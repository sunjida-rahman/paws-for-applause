const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");
const upload = multer();
const router = express.Router();

// Middleware
router.use(express.json());
router.use(cors());

// MySQL connection
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "sunjida2001", // Update with your MySQL password
    database: "paws_for_applause", // Update with your database name
});

// Check database connection
pool.getConnection((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
    } else {
        console.log("Connected to MySQL database.");
    }
});

// POST route for donation process
router.post("/api/donate", upload.none(), (req, res) => {
    const {
        donorName,
        donorEmail,
        donorPhone,
        donationAmount,
        donationMode,
        bankAccountNumber,
        bankTransactionId,
    } = req.body;

    if (
        !donorName ||
        !donorEmail ||
        !donationAmount ||
        !donationMode ||
        (donationMode === "bank" &&
            (!bankAccountNumber || !bankTransactionId))
    ) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
        INSERT INTO donation (
            donor_name, donor_email, donor_phone, donation_amount, 
            donation_mode, bank_account_number, bank_transaction_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    pool.query(
        query,
        [
            donorName,
            donorEmail,
            donorPhone,
            donationAmount,
            donationMode,
            bankAccountNumber || null,
            bankTransactionId || null,
        ],
        (err,results) => {
            if (err) {
                console.error("Error inserting data into MySQL:", err);
                return res.status(500).json({ error: "Database error." });
            }
            res.json({ message: "Thank you for your donation!" });
        }
    );
});

// Fallback route for unmatched endpoints
router.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
});
router.post('/api/donate', (req, res) => {
    // Handle donation logic here
    console.log(req.body); // For debugging purposes
    res.send("Donation received");
});

// Export the router to be used in server.js
module.exports = router;
