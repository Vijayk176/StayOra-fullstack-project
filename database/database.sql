-- =====================================================================
-- STAYORA - SMART HOTEL MANAGEMENT SYSTEM
-- Database: PostgreSQL (Neon Cloud)
-- File: database.sql
-- Description: Full schema (16 tables) + sample data + indexes
-- Run this once in the Neon SQL editor OR via: psql $DATABASE_URL -f database.sql
-- =====================================================================

-- Drop tables if they already exist (safe re-run, order matters due to FKs)
DROP TABLE IF EXISTS ActivityLogs CASCADE;
DROP TABLE IF EXISTS ContactMessages CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Housekeeping CASCADE;
DROP TABLE IF EXISTS Employees CASCADE;
DROP TABLE IF EXISTS Departments CASCADE;
DROP TABLE IF EXISTS ServiceBookings CASCADE;
DROP TABLE IF EXISTS Services CASCADE;
DROP TABLE IF EXISTS Invoices CASCADE;
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS Bookings CASCADE;
DROP TABLE IF EXISTS Rooms CASCADE;
DROP TABLE IF EXISTS RoomTypes CASCADE;
DROP TABLE IF EXISTS Guests CASCADE;
DROP TABLE IF EXISTS Users CASCADE;
DROP TABLE IF EXISTS Roles CASCADE;

-- =====================================================================
-- 1. ROLES
-- =====================================================================
CREATE TABLE Roles (
    role_id     SERIAL PRIMARY KEY,
    role_name   VARCHAR(50) NOT NULL UNIQUE CHECK (role_name IN ('Admin', 'Receptionist'))
);

-- =====================================================================
-- 2. USERS  (system login accounts - staff)
-- =====================================================================
CREATE TABLE Users (
    user_id       SERIAL PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INTEGER NOT NULL REFERENCES Roles(role_id) ON DELETE RESTRICT,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 3. DEPARTMENTS
-- =====================================================================
CREATE TABLE Departments (
    department_id   SERIAL PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(255)
);

-- =====================================================================
-- 4. EMPLOYEES
-- =====================================================================
CREATE TABLE Employees (
    employee_id    SERIAL PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(100) NOT NULL UNIQUE,
    phone          VARCHAR(20) NOT NULL,
    department_id  INTEGER NOT NULL REFERENCES Departments(department_id) ON DELETE RESTRICT,
    designation    VARCHAR(100) NOT NULL,
    salary         NUMERIC(10,2) NOT NULL CHECK (salary >= 0),
    hire_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active      BOOLEAN DEFAULT TRUE
);

-- =====================================================================
-- 5. GUESTS
-- =====================================================================
CREATE TABLE Guests (
    guest_id     SERIAL PRIMARY KEY,
    full_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(100) NOT NULL UNIQUE,
    phone        VARCHAR(20) NOT NULL,
    cnic_passport VARCHAR(30) NOT NULL UNIQUE,
    address      VARCHAR(255),
    city         VARCHAR(100),
    country      VARCHAR(100) DEFAULT 'Pakistan',
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 6. ROOMTYPES
-- =====================================================================
CREATE TABLE RoomTypes (
    room_type_id   SERIAL PRIMARY KEY,
    type_name      VARCHAR(50) NOT NULL UNIQUE,
    description    VARCHAR(255),
    base_price     NUMERIC(10,2) NOT NULL CHECK (base_price > 0),
    max_occupancy  INTEGER NOT NULL CHECK (max_occupancy > 0)
);

-- =====================================================================
-- 7. ROOMS
-- =====================================================================
CREATE TABLE Rooms (
    room_id       SERIAL PRIMARY KEY,
    room_number   VARCHAR(10) NOT NULL UNIQUE,
    room_type_id  INTEGER NOT NULL REFERENCES RoomTypes(room_type_id) ON DELETE RESTRICT,
    floor_number  INTEGER NOT NULL CHECK (floor_number >= 0),
    status        VARCHAR(20) NOT NULL DEFAULT 'Available'
                  CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    image_url     VARCHAR(255)
);

-- =====================================================================
-- 8. BOOKINGS
-- =====================================================================
CREATE TABLE Bookings (
    booking_id     SERIAL PRIMARY KEY,
    guest_id       INTEGER NOT NULL REFERENCES Guests(guest_id) ON DELETE CASCADE,
    room_id        INTEGER NOT NULL REFERENCES Rooms(room_id) ON DELETE RESTRICT,
    user_id        INTEGER REFERENCES Users(user_id) ON DELETE SET NULL, -- receptionist who booked
    check_in_date  DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount   NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    booking_status VARCHAR(20) NOT NULL DEFAULT 'Confirmed'
                   CHECK (booking_status IN ('PendingConfirmation', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled')),
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (check_out_date > check_in_date)
);

-- =====================================================================
-- 9. PAYMENTS
-- =====================================================================
CREATE TABLE Payments (
    payment_id     SERIAL PRIMARY KEY,
    booking_id     INTEGER NOT NULL REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    amount_paid    NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'BankTransfer', 'Online')),
    payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Refunded'))
);

-- =====================================================================
-- 10. INVOICES
-- =====================================================================
CREATE TABLE Invoices (
    invoice_id    SERIAL PRIMARY KEY,
    booking_id    INTEGER NOT NULL UNIQUE REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    invoice_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_amount  NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    tax_amount    NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
    grand_total   NUMERIC(10,2) NOT NULL CHECK (grand_total >= 0)
);

-- =====================================================================
-- 11. SERVICES  (Laundry, Spa, Food, etc.)
-- =====================================================================
CREATE TABLE Services (
    service_id    SERIAL PRIMARY KEY,
    service_name  VARCHAR(100) NOT NULL UNIQUE,
    description   VARCHAR(255),
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0)
);

-- =====================================================================
-- 12. SERVICEBOOKINGS
-- =====================================================================
CREATE TABLE ServiceBookings (
    service_booking_id SERIAL PRIMARY KEY,
    booking_id          INTEGER NOT NULL REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    service_id          INTEGER NOT NULL REFERENCES Services(service_id) ON DELETE RESTRICT,
    quantity             INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    service_date         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_price          NUMERIC(10,2) NOT NULL CHECK (total_price >= 0)
);

-- =====================================================================
-- 13. HOUSEKEEPING
-- =====================================================================
CREATE TABLE Housekeeping (
    housekeeping_id SERIAL PRIMARY KEY,
    room_id         INTEGER NOT NULL REFERENCES Rooms(room_id) ON DELETE CASCADE,
    employee_id     INTEGER NOT NULL REFERENCES Employees(employee_id) ON DELETE RESTRICT,
    task_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    status          VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'InProgress', 'Completed')),
    remarks         VARCHAR(255)
);

-- =====================================================================
-- 14. REVIEWS
-- =====================================================================
CREATE TABLE Reviews (
    review_id   SERIAL PRIMARY KEY,
    guest_id    INTEGER NOT NULL REFERENCES Guests(guest_id) ON DELETE CASCADE,
    booking_id  INTEGER REFERENCES Bookings(booking_id) ON DELETE SET NULL,
    rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment     VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 15. CONTACTMESSAGES  (from public website "Contact Us" form)
-- =====================================================================
CREATE TABLE ContactMessages (
    message_id  SERIAL PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL,
    subject     VARCHAR(150),
    message     VARCHAR(1000) NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 16. ACTIVITYLOGS  (audit trail of user actions)
-- =====================================================================
CREATE TABLE ActivityLogs (
    log_id      SERIAL PRIMARY KEY,
    user_id     INTEGER REFERENCES Users(user_id) ON DELETE SET NULL,
    action      VARCHAR(255) NOT NULL,
    entity_name VARCHAR(100),
    entity_id   INTEGER,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- INDEXES (performance)
-- =====================================================================
CREATE INDEX idx_bookings_guest      ON Bookings(guest_id);
CREATE INDEX idx_bookings_room       ON Bookings(room_id);
CREATE INDEX idx_bookings_status     ON Bookings(booking_status);
CREATE INDEX idx_payments_booking    ON Payments(booking_id);
CREATE INDEX idx_rooms_status        ON Rooms(status);
CREATE INDEX idx_servicebookings_svc ON ServiceBookings(service_id);
CREATE INDEX idx_employees_dept      ON Employees(department_id);
CREATE INDEX idx_guests_email        ON Guests(email);

-- =====================================================================
-- SAMPLE DATA
-- =====================================================================

-- Roles
INSERT INTO Roles (role_name) VALUES ('Admin'), ('Receptionist');

-- Users (password for both = "Password123" -> bcrypt hash, generated by app on register normally.
-- Below is a REAL, verified bcrypt hash of "Password123" so you can log in immediately)
INSERT INTO Users (full_name, email, password_hash, role_id) VALUES
('Ali Admin', 'admin@stayora.com', '$2b$10$D1Aw998HXysWC3h7V5BWmOcheq12EJ0E9haUeAR9t8sQQZ0EmRmkK', 1),
('Sara Receptionist', 'reception@stayora.com', '$2b$10$D1Aw998HXysWC3h7V5BWmOcheq12EJ0E9haUeAR9t8sQQZ0EmRmkK', 2);

-- Departments
INSERT INTO Departments (department_name, description) VALUES
('Front Desk', 'Guest check-in and check-out operations'),
('Housekeeping', 'Room cleaning and maintenance'),
('Food & Beverage', 'Restaurant and room service'),
('Management', 'Hotel administration');

-- Employees
INSERT INTO Employees (full_name, email, phone, department_id, designation, salary, hire_date) VALUES
('Ahmed Khan', 'ahmed.khan@stayora.com', '03001112222', 1, 'Front Desk Officer', 45000, '2023-01-15'),
('Bushra Iqbal', 'bushra.iqbal@stayora.com', '03002223333', 2, 'Housekeeping Supervisor', 40000, '2022-06-10'),
('Usman Tariq', 'usman.tariq@stayora.com', '03003334444', 3, 'Chef', 60000, '2021-09-01'),
('Hina Malik', 'hina.malik@stayora.com', '03004445555', 4, 'Hotel Manager', 90000, '2020-03-20');

-- Guests
INSERT INTO Guests (full_name, email, phone, cnic_passport, address, city, country) VALUES
('Bilal Ahmed', 'bilal.ahmed@example.com', '03111234567', '42101-1234567-1', 'House 12, Street 5', 'Karachi', 'Pakistan'),
('Ayesha Noor', 'ayesha.noor@example.com', '03211234567', '42101-2345678-2', 'Flat 4B, DHA', 'Lahore', 'Pakistan'),
('John Smith', 'john.smith@example.com', '00447911123456', 'P1234567', '10 Downing Ave', 'London', 'UK'),
('Sana Sheikh', 'sana.sheikh@example.com', '03331234567', '42101-3456789-3', 'Block 6, Gulshan', 'Karachi', 'Pakistan');

-- RoomTypes
INSERT INTO RoomTypes (type_name, description, base_price, max_occupancy) VALUES
('Standard', 'Comfortable standard room with basic amenities', 8000, 2),
('Deluxe', 'Spacious room with premium amenities', 14000, 3),
('Suite', 'Luxury suite with living area', 25000, 4),
('Family', 'Large room suited for families', 18000, 5);

-- Rooms
INSERT INTO Rooms (room_number, room_type_id, floor_number, status) VALUES
('101', 1, 1, 'Available'),
('102', 1, 1, 'Occupied'),
('201', 2, 2, 'Available'),
('202', 2, 2, 'Maintenance'),
('301', 3, 3, 'Available'),
('302', 3, 3, 'Occupied'),
('401', 4, 4, 'Available'),
('402', 4, 4, 'Available');

-- Bookings
INSERT INTO Bookings (guest_id, room_id, user_id, check_in_date, check_out_date, total_amount, booking_status) VALUES
(1, 2, 2, '2026-06-01', '2026-06-05', 32000, 'CheckedOut'),
(2, 6, 2, '2026-06-10', '2026-06-12', 50000, 'CheckedIn'),
(3, 3, 2, '2026-06-20', '2026-06-22', 28000, 'Confirmed'),
(4, 1, 2, '2026-07-01', '2026-07-03', 16000, 'Confirmed');

-- Payments
INSERT INTO Payments (booking_id, amount_paid, payment_method, payment_status) VALUES
(1, 32000, 'Card', 'Paid'),
(2, 25000, 'Cash', 'Paid'),
(2, 25000, 'Online', 'Pending'),
(3, 28000, 'BankTransfer', 'Paid');

-- Invoices
INSERT INTO Invoices (booking_id, total_amount, tax_amount, grand_total) VALUES
(1, 32000, 1600, 33600),
(2, 50000, 2500, 52500),
(3, 28000, 1400, 29400);

-- Services
INSERT INTO Services (service_name, description, price) VALUES
('Laundry', 'Washing and ironing of clothes', 800),
('Spa', 'Relaxing spa treatment', 3500),
('Food', 'Room service meal', 1200),
('Airport Pickup', 'Pickup from airport to hotel', 2000);

-- ServiceBookings
INSERT INTO ServiceBookings (booking_id, service_id, quantity, total_price) VALUES
(1, 1, 2, 1600),
(1, 3, 1, 1200),
(2, 2, 1, 3500),
(3, 4, 1, 2000);

-- Housekeeping
INSERT INTO Housekeeping (room_id, employee_id, task_date, status, remarks) VALUES
(2, 2, '2026-06-05', 'Completed', 'Room cleaned after checkout'),
(6, 2, '2026-06-12', 'Pending', 'Scheduled after checkout'),
(4, 2, '2026-06-01', 'InProgress', 'AC under maintenance');

-- Reviews
INSERT INTO Reviews (guest_id, booking_id, rating, comment) VALUES
(1, 1, 5, 'Excellent stay, very clean rooms!'),
(2, 2, 4, 'Good service, spa was relaxing.'),
(3, 3, 3, 'Average experience, room was small.');

-- ContactMessages
INSERT INTO ContactMessages (full_name, email, subject, message) VALUES
('Zara Yousuf', 'zara.yousuf@example.com', 'Booking Inquiry', 'Do you have availability for 4 guests next month?'),
('Omar Farooq', 'omar.farooq@example.com', 'Feedback', 'Loved the hotel, thank you for the hospitality.');

-- ActivityLogs
INSERT INTO ActivityLogs (user_id, action, entity_name, entity_id) VALUES
(1, 'Created new room', 'Rooms', 8),
(2, 'Checked in guest', 'Bookings', 2),
(1, 'Updated employee salary', 'Employees', 3);

-- =====================================================================
-- END OF SCRIPT
-- =====================================================================
