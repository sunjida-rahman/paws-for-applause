const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// Initialize app and middleware
const app = express();
app.use(express.json());
app.use(cors());

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

// POST route for adoption process
app.post("/api/adopt-pet", (req, res) => {
    const { adopterName, adopterPhone, adopterAddress, petID } = req.body;

    if (!adopterName || !adopterPhone || !adopterAddress || !petID) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const query = `
        INSERT INTO adoptions (adopter_name, adopter_phone, adopter_address, pet_id)
        VALUES (?, ?, ?, ?)
    `;
    pool.query(query, [adopterName, adopterPhone, adopterAddress, petID], (err, results) => {
        if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).json({ error: "Database error." });
        }
        res.json({ message: "Adoption form submitted successfully!" });
    });
});

// Fallback route
app.use((req, res) => {
    res.status(404).json({ error: "Endpoint not found." });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
