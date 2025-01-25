const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const router = express.Router();

// Middleware to parse JSON request body
router.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: 'localhost',   // Your MySQL host (e.g., localhost)
    user: 'root',        // Your MySQL username
    password: 'sunjida2001', // Your MySQL password
    database: 'paws_for_applause' // Your MySQL database name
});

// Test the DB connection
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// POST login user endpoint
router.post('/api/user/login', (req, res) => {
    const { username, phone } = req.body;

    if (!username || !phone) {
        return res.status(400).json({ error: "Username and phone are required" });
    }

    // Query to check if the user exists
    const query = 'SELECT * FROM users WHERE name = ? AND phone = ?';
    db.query(query, [username, phone], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ error: 'Database query error' });
        }

        if (results.length > 0) {
            // User found, send success response
            res.status(200).json({ message: 'Login successful' });
        } else {
            // User not found
            res.status(401).json({ error: 'Invalid username or phone number' });
        }
    });
});

module.exports = router; // Export the router to be used in server.js
