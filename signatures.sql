--  DROP TABLE IF EXISTS signatures;

 
 CREATE TABLE signatures(
      id SERIAL PRIMARY KEY,
      userId INTEGER NOT NULL REFERENCES users(id),
      signature TEXT NOT NULL CHECK (signature != ''),
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )