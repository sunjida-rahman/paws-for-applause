const express = require("express");
const mysql = require("mysql2");

const router = express.Router();

// MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root", // Update with your MySQL username
    password: "sunjida2001", // Update with your MySQL password
    database: "paws_for_applause", // Update with your database name
});

// Donation submission route
router.post("/api/submit-donation", (req, res) => {
    const {
        donorName,
        donorEmail,
        donorPhone,
        donationAmount,
        donationMode,
        bankAccountNumber,
        bankTransactionId,
    } = req.body;

    // Validate required fields
    if (!donorName || !donorEmail || !donorPhone || !donationAmount || !donationMode) {
        return res.status(400).json({ error: "All required fields must be filled." });
    }

    const donationDate = new Date().toISOString().split("T")[0]; // Current date in YYYY-MM-DD format

    // Insert into the donation table
    const query = `
        INSERT INTO donation 
        (donor_name, donor_email, donor_phone, donation_amount, donation_mode, bank_account_number, bank_transaction_id, donation_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the query
    pool.query(
        query,
        [
            donorName,
            donorEmail,
            donorPhone,
            parseFloat(donationAmount),
            donationMode,
            donationMode === "bank" ? bankAccountNumber : null,
            donationMode === "bank" ? bankTransactionId : null,
            donationDate,
        ],
        (err, results) => {
            if (err) {
                console.error("Error inserting data into MySQL:", err);
                return res.status(500).json({ error: "Database error." });
            }

            // Emit real-time notification for successful donation
            if (req.io) {
                req.io.emit("donationSuccess", {
                    message: "Thank you for your donation!",
                    donorName: donorName,
                    donationAmount: donationAmount,
                    donationMode: donationMode,
                });
            }

            // Send success response
            res.json({ message: "Donation submitted successfully!" });
        }
    );
});


// Fallback route for handling unknown endpoints
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
module.exports = (io) => {
  const express = require("express");
  const router = express.Router();

  // Example route
  router.post("/api/", (req, res) => {
      // Your logic here
      res.send("Injury report received");
  });

  // You can use `io` for real-time updates if needed
  io.on("connection", (socket) => {
      console.log("New socket connection established");
  });

  return router;
};
