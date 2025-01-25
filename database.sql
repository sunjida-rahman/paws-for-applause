CREATE DATABASE paws_for_applause;
USE paws_for_applause;

-- Drop existing tables to avoid conflicts (use with caution in production)
DROP TABLE IF EXISTS donation;
DROP TABLE IF EXISTS adoption_requests;
DROP TABLE IF EXISTS injury_reports;
DROP TABLE IF EXISTS users;

-- Users Table
CREATE TABLE users (
    id INT  PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(10) NOT NULL UNIQUE
);

-- Injury Reports Table
CREATE TABLE injury_reports (
    
    user_id INT NOT NULL ,
    location TEXT,
    image VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Adoption Requests Table
CREATE TABLE adoption_requests (
    user_id INT NOT NULL,
    pet_id INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    adoption_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
   
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   
);

-- Donation Table
CREATE TABLE donation (
    
    user_id INT NOT NULL ,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(15) NOT NULL,
    donation_amount DECIMAL(10, 2) NOT NULL,
    donation_mode ENUM('cash', 'bank') NOT NULL,
    bank_account_number VARCHAR(50),
    bank_transaction_id VARCHAR(50),
    donation_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sample Data (Optional)
INSERT INTO users (name, phone) VALUES ('Alice', '1234567890'), ('Bob', '0987654321');

CREATE TABLE animals (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    breed VARCHAR(255) NOT NULL,
    health_condition TEXT NOT NULL,
    is_available_for_adoption VARCHAR(10) ,
    pet_image VARCHAR(255)
);
DROP TABLE animals;

-- Queries to Verify Tables
SELECT * FROM users;
SELECT * FROM injury_reports;
SELECT * FROM adoption_requests;
SELECT * FROM donation;
SELECT * FROM animals;
INSERT INTO animals (pet_id, breed, health_condition, is_available_for_adoption, pet_image) 
VALUES 
(1001, 'Not known', 'Healthy, vaccinated', 'NO', '201.jpg'),
(1002, 'Not known', 'Requires medication for allergies', 'NO', 'dogs1.jpg'),
(1003, 'Not known', 'Healthy, vaccinated', 'NO', '202.jpg'),
(1004, 'Not known', 'Healthy, vaccinated', 'NO', '203.jpg'),
(1005, 'Not known', 'Healthy, vaccinated', 'YES', 'cat(ashcolor).jpg'),
(1006, 'Not known', 'Healthy, vaccinated', 'YES', 'cat(lightbrown).jpg');
