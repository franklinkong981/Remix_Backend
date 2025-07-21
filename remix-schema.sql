CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE CHECK (LENGTH(username) >= 5),
  email VARCHAR NOT NULL UNIQUE,
  hashed_password VARCHAR(30) NOT NULL CHECK (LENGTH(hashed_password) >= 8),
  CONSTRAINT check_valid_email CHECK (
    email LIKE '%@%.%'
  )
);

