-- =========================================================
-- Booking System Database Schema (MySQL 8+)
-- =========================================================

CREATE DATABASE IF NOT EXISTS booking_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE booking_system;

-- ---------------------------------------------------------
-- USERS  (public customers + admins)
-- deleted_at is the soft-delete flag that powers "undo delete"
-- ---------------------------------------------------------
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(120)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255)  NOT NULL,
    phone         VARCHAR(30)   NULL,
    role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    avatar_url    VARCHAR(255)  NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME NULL DEFAULT NULL,          -- NULL = active, set = "deleted"
    INDEX idx_deleted_at (deleted_at)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- AUTH TOKENS (simple bearer-token auth, no external libs)
-- ---------------------------------------------------------
CREATE TABLE auth_tokens (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    token      CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- SERVICES  (the bookable "products")
-- ---------------------------------------------------------
CREATE TABLE services (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    description      TEXT NULL,
    category         VARCHAR(80)  NULL,
    price            DECIMAL(10,2) NOT NULL DEFAULT 0,
    duration_minutes INT NOT NULL DEFAULT 60,
    image_url        VARCHAR(255) NULL,
    is_active        TINYINT(1) NOT NULL DEFAULT 1,
    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- BOOKINGS
-- ---------------------------------------------------------
CREATE TABLE bookings (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    user_id       INT NOT NULL,
    service_id    INT NOT NULL,
    booking_date  DATE NOT NULL,
    booking_time  TIME NOT NULL,
    status        ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
    notes         VARCHAR(500) NULL,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_date (booking_date)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- ADMIN ACTION LOG (audit trail — also backs the "undo" UI,
-- so an admin can see exactly what was deleted and when)
-- ---------------------------------------------------------
CREATE TABLE admin_action_log (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    admin_id       INT NOT NULL,
    action         ENUM('delete_user','restore_user','permanent_delete_user') NOT NULL,
    target_user_id INT NOT NULL,
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Seed data
-- ---------------------------------------------------------

-- Admin password = "Admin123!"  (bcrypt hash below)
INSERT INTO users (name, email, password_hash, role) VALUES
('System Admin', 'admin@bookingsystem.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

INSERT INTO services (name, description, category, price, duration_minutes, image_url) VALUES
('Deep Tissue Massage', 'A firm-pressure massage that targets chronic muscle tension.', 'Wellness', 65.00, 60, NULL),
('Haircut & Style', 'Precision cut and blow-dry finish with a senior stylist.', 'Salon', 45.00, 45, NULL),
('Personal Training Session', 'One-on-one strength and conditioning coaching.', 'Fitness', 55.00, 50, NULL),
('Facial Treatment', 'Deep-cleansing facial with steam and extraction.', 'Spa', 70.00, 75, NULL),
('Consultation Call', '30-minute strategy consultation.', 'Business', 30.00, 30, NULL);
