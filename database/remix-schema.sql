
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL UNIQUE CHECK (LENGTH(username) >= 5),
  email VARCHAR NOT NULL CHECK (email <> ''),
  hashed_password VARCHAR NOT NULL CHECK (LENGTH(hashed_password) >= 8),
  CONSTRAINT check_valid_email CHECK (
    email LIKE '%@%.%'
  )
);

CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL CHECK (name <> ''),
  description VARCHAR(255) NOT NULL CHECK (description <> ''),
  ingredients VARCHAR NOT NULL CHECK (ingredients <> ''),
  directions VARCHAR NOT NULL CHECK (directions <> ''),
  cooking_time INT NOT NULL DEFAULT 0,
  servings INT  NOT NULL DEFAULT 0,
  image_url VARCHAR NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
  created_at TIMESTAMP NOT NULL DEFAULT NOW() 
);

CREATE TABLE remixes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  recipe_id INT NOT NULL REFERENCES recipes (id) ON DELETE CASCADE,
  purpose VARCHAR(255) NOT NULL CHECK (LENGTH(purpose) >= 10),
  name VARCHAR(100) NOT NULL CHECK (name <> ''),
  description VARCHAR(255) NOT NULL CHECK (description <> ''),
  ingredients VARCHAR NOT NULL CHECK (ingredients <> ''),
  directions VARCHAR NOT NULL CHECK (directions <> ''),
  cooking_time INT NOT NULL DEFAULT 0,
  servings INT NOT NULL DEFAULT 0,
  image_url VARCHAR NOT NULL DEFAULT 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()  
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
  title VARCHAR(100) NOT NULL CHECK (title <> ''),
  content VARCHAR NOT NULL CHECK (content <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE remix_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  remix_id INT NOT NULL REFERENCES remixes (id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL CHECK (title <> ''),
  content VARCHAR NOT NULL CHECK (content <> ''),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);