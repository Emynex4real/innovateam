-- Create transactions table for proper database storage
-- This replaces the JSON file system with a proper database table

-- For MySQL/MariaDB
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('credit', 'debit', 'purchase', 'refund') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
    category VARCHAR(50) DEFAULT 'general',
    reference VARCHAR(20),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- For PostgreSQL (uncomment if using PostgreSQL)
-- CREATE TYPE transaction_type AS ENUM ('credit', 'debit', 'purchase', 'refund');
-- CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed');
-- 
-- CREATE TABLE IF NOT EXISTS transactions (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     user_id UUID NOT NULL,
--     type transaction_type NOT NULL,
--     amount NUMERIC(10,2) NOT NULL,
--     description TEXT,
--     status transaction_status DEFAULT 'completed',
--     category VARCHAR(50) DEFAULT 'general',
--     reference VARCHAR(20),
--     metadata JSONB,
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     deleted_at TIMESTAMP NULL
-- );
-- 
-- CREATE INDEX idx_transactions_user_id ON transactions(user_id);
-- CREATE INDEX idx_transactions_status ON transactions(status);
-- CREATE INDEX idx_transactions_type ON transactions(type);
-- CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Insert sample transaction data (optional)
INSERT INTO transactions (id, user_id, type, amount, description, status, category, reference) VALUES
('sample-tx-1', 'sample-user-1', 'purchase', 500.00, 'JAMB Form Purchase', 'completed', 'jamb_services', 'REF001'),
('sample-tx-2', 'sample-user-2', 'purchase', 1000.00, 'O-Level Upload Service', 'completed', 'olevel_services', 'REF002'),
('sample-tx-3', 'sample-user-3', 'purchase', 750.00, 'AI Examiner Service', 'pending', 'ai_services', 'REF003');