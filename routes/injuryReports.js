const express = require("express");
const mysql = require("mysql");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

// Initialize app and middleware
const app = express();
app.use(express.json()); // To parse JSON request bodies
app.use(cors()); // Enable CORS

// Static folder to serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Create MySQL connection pool
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "sunjida2001", // Replace with your MySQL root password
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
        cb(null, "uploads"); // Save files in the "uploads" directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
    },
});

const upload = multer({ storage: storage });

// POST route to handle injury report submissions
app.post("/api/report-injury", upload.single("image"), (req, res) => {
    const { name, phone, location } = req.body;
    const image = req.file ? req.file.filename : null;

    // Validate required fields
    if (!name || !phone || !location || !image) {
        return res.status(400).json({ error: "All fields are required." });
    }

    // Insert data into MySQL database
    const query = `
        INSERT INTO injury_reports (name, phone, location, image)
        VALUES (?, ?, ?, ?)
    `;
    pool.query(query, [name, phone, location, image], (err, results) => {
        if (err) {
            console.error("Error inserting data into MySQL:", err);
            return res.status(500).json({ error: "Database error." });
        }
        res.json({ message: "Report submitted successfully!" });
    });
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
  router.post("/api/report-injury", (req, res) => {
      // Your logic here
      res.send("Injury report received");
  });

  // You can use `io` for real-time updates if needed
  io.on("connection", (socket) => {
      console.log("New socket connection established");
  });

  return router;
};
