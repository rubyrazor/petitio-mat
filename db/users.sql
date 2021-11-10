DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL CHECK (first != ''),
    last VARCHAR(255) NOT NULL CHECK (last != ''),
    email VARCHAR(255) NOT NULL UNIQUE CHECK (last != ''),
    hashedPw VARCHAR(255) NOT NULL CHECK (last != ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

