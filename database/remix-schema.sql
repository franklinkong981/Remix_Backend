CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE CHECK (LENGTH(username) >= 5),
  email VARCHAR NOT NULL UNIQUE,
  hashed_password VARCHAR(30) NOT NULL CHECK (LENGTH(hashed_password) >= 8),
  CONSTRAINT check_valid_email CHECK (
    email LIKE '%@%.%'
  )
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  ingredients VARCHAR NOT NULL,
  directions VARCHAR NOT NULL,
  cooking_time INT,
  servings INT,
  image_url VARCHAR NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg' 
);

CREATE TABLE remixes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  purpose VARCHAR(255) NOT NULL CHECK (LENGTH(purpose) >= 10),
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255) NOT NULL,
  ingredients VARCHAR NOT NULL,
  directions VARCHAR NOT NULL,
  cooking_time INT,
  servings INT,
  image_url VARCHAR NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'  
);

CREATE TABLE recipe_favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE
);

CREATE TABLE remix_favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  remix_id INT NOT NULL REFERENCES remixes (id) ON DELETE CASCADE
);

CREATE TABLE recipe_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  content VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE remix_reviews (
  id INT PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  remix_id INT NOT NULL REFERENCES remixes (id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  content VARCHAR NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);