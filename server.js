require("dotenv").config(); // For environment variables
const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Initialize app, server, and middleware
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder to serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "sunjida2001", // Replace with your MySQL password
  database: "paws_for_applause", // Replace with your database name
});

// Check database connection
pool.getConnection((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
  } else {
    console.log("Connected to MySQL database.");
  }
});

// Set up file upload using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

app.post("/api/user/login", (req, res) => {
  const { userId, username, phone } = req.body;

  // Input validation
  if (!userId || !username || !phone) {
    return res
      .status(400)
      .json({ error: "All fields (userId, username, phone) are required." });
  }

  // Check if user already exists by phone number
  const checkQuery = "SELECT * FROM users WHERE phone = ?";
  pool.query(checkQuery, [phone], (err, results) => {
    if (err) {
      console.error("Database query error (checking user):", err);
      return res
        .status(500)
        .json({ error: "Internal server error. Please try again later." });
    }

    if (results.length > 0) {
      // User exists
      const user = results[0];
      if (user.id === parseInt(userId)) {
        return res
          .status(200)
          .json({ message: "Login successful", userId: user.id });
      } else {
        return res
          .status(400)
          .json({ error: "User ID does not match the phone number." });
      }
    } else {
      // User does not exist, insert new user
      const insertQuery =
        "INSERT INTO users (id, name, phone) VALUES (?, ?, ?)";
      pool.query(insertQuery, [userId, username, phone], (err, results) => {
        if (err) {
          // Handle duplicate userId or phone error
          if (err.code === "ER_DUP_ENTRY") {
            return res
              .status(400)
              .json({ error: "User ID or phone number already exists." });
          }
          console.error("Database query error (inserting user):", err);
          return res
            .status(500)
            .json({ error: "Error creating user. Please try again." });
        }

        // User created successfully
        return res.status(201).json({
          message: "User created and logged in successfully",
          userId: userId,
        });
      });
    }
  });
});

// **Injury Report API**
app.post("/api/report-injury", upload.single("image"), (req, res) => {
  console.log(req.body); // Debug what the server receives
  const { user_id, location } = req.body;
  const image = req.file ? req.file.filename : null;
  if (!location || !image || !user_id) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query = ` 
    INSERT INTO injury_reports (user_id, location, image) 
    VALUES (?, ?, ?) 
  `;
  pool.query(query, [user_id, location, image], (err) => {
    console.log(err);
    if (err) {
      console.error("Error inserting data into MySQL:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res.json({ message: "Report submitted successfully!" });
  });
});

// **Adoption API**
app.post("/api/adopt-pet", upload.none(), (req, res) => {
  const { user_id, adopterName, adopterPhone, adopterEmail, adopterAddress, petID } = req.body;

  if (!user_id || !adopterName || !adopterPhone || !adopterAddress || !petID) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const date = new Date().toISOString().split("T")[0];

  const query = `
    INSERT INTO adoption_requests (user_id, user_name, contact_number, address, pet_id, email, adoption_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  
  pool.query(query, [user_id, adopterName, adopterPhone, adopterAddress, petID, adopterEmail, date], (err) => {
    if (err) {
      console.error("Error inserting data into MySQL:", err);
      return res.status(500).json({ error: "Database error." });
    }

    // Emit notification to the app via Socket.io
    io.emit("newAdoption", {
      message: `New adoption request submitted for Pet ID: ${petID}`
    });

    res.json({ message: "Adoption request submitted successfully!" });
  });
});
// **Donation API**
app.post("/api/donate", upload.none(), (req, res) => {
  const { user_id, donorName, donorEmail, donorPhone, donationAmount, donationMode, bankAccountNumber, bankTransactionId } = req.body;

  if (!user_id || !donorName || !donorEmail || !donationAmount || !donationMode) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const date = new Date().toISOString().split("T")[0];

  const query = `
    INSERT INTO donation (user_id, donor_name, donor_email, donor_phone, donation_amount, donation_mode, bank_account_number, bank_transaction_id, donation_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  pool.query(query, [user_id, donorName, donorEmail, donorPhone || null, parseFloat(donationAmount), donationMode, bankAccountNumber || null, bankTransactionId || null, date], (err) => {
    if (err) {
      console.error("Error inserting data into MySQL:", err);
      return res.status(500).json({ error: "Database error." });
    }

    // Emit notification to the app via Socket.io
    io.emit("newDonation", {
      message: `New donation of amount ${donationAmount} received.`
    });

    res.json({ message: "Thank you for your donation!" });
  });
});



 // **Fetch Animals API** - Get all animals for the animal store page
 app.get("/api/get-animals", (req, res) => {
  console.log("Request received at /api/get-animals");
  const query = "SELECT * FROM animals";
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching animals:", err);
      return res.status(500).json({ message: "Failed to fetch animals" });
    }
    res.json(results);
  });
});


// Socket.io integration (if needed for real-time updates)
io.on("connection", (socket) => {
  console.log("New socket connection established");
});

// Fallback route for handling unknown endpoints
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found." });
});

// Start server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
