-- DROP TABLE IF EXISTS signatories;

CREATE TABLE signatories (
    id SERIAL PRIMARY KEY,
   "first name" VARCHAR(255) NOT NULL CHECK ("first name" != ''),
    "last name" VARCHAR(255) NOT NULL CHECK ("last name" != ''),
    signatures TEXT NOT NULL CHECK (signatures != ''),
    timestamp TIMESTAMP DEFAULT NOW()
    );



