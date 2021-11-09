-- DROP TABLE IF EXISTS profiles;

CREATE TABLE profiles (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL UNIQUE REFERENCES users(id),
    age INT,
    city TEXT,
    url TEXT
);