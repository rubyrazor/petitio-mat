DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    signature TEXT NOT NULL CHECK (signature != ''),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);