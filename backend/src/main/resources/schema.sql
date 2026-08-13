-- PAARI Smart Food Rescue Network database schema

-- Drop tables if they exist to allow clean initialization
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS feedbacks;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS pickup_deliveries;
DROP TABLE IF EXISTS food_requests;
DROP TABLE IF EXISTS food_donations;
DROP TABLE IF EXISTS volunteers;
DROP TABLE IF EXISTS receivers;
DROP TABLE IF EXISTS donors;
DROP TABLE IF EXISTS users;

-- 1. Users Table
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Donors Table
CREATE TABLE donors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    organization_name VARCHAR(255),
    address VARCHAR(555) NOT NULL,
    food_type_offered VARCHAR(555),
    rating FLOAT DEFAULT 0.0,
    latitude DOUBLE,
    longitude DOUBLE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Receivers (NGOs) Table
CREATE TABLE receivers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    organization_name VARCHAR(255),
    address VARCHAR(555) NOT NULL,
    area_served VARCHAR(555),
    rating FLOAT DEFAULT 0.0,
    latitude DOUBLE,
    longitude DOUBLE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Volunteers Table
CREATE TABLE volunteers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    vehicle_type VARCHAR(100),
    vehicle_number VARCHAR(100),
    availability_status BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. FoodDonations Table
CREATE TABLE food_donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    food_type VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    description VARCHAR(1000),
    pickup_address VARCHAR(555) NOT NULL,
    pickup_time TIMESTAMP NOT NULL,
    expiry_time TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
    latitude DOUBLE,
    longitude DOUBLE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE
);

-- 6. FoodRequests Table
CREATE TABLE food_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    quantity_requested DECIMAL(10, 2) NOT NULL,
    request_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES receivers(id) ON DELETE CASCADE
);

-- 7. PickupDeliveries Table
CREATE TABLE pickup_deliveries (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT NOT NULL,
    volunteer_id BIGINT,
    pickup_time TIMESTAMP,
    delivery_time TIMESTAMP,
    pickup_location VARCHAR(555),
    delivery_location VARCHAR(555),
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    distance_km DOUBLE,
    route_data TEXT,
    FOREIGN KEY (request_id) REFERENCES food_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE SET NULL
);

-- 8. Feedbacks Table
CREATE TABLE feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    target_user_id BIGINT,
    type VARCHAR(50) NOT NULL,
    rating INT NOT NULL,
    comment VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. Notifications Table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 10. Payments Table
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL,
    payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE SET NULL
);
