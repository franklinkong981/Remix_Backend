/* This is the file that sets up testing for the User, Recipe, and Remix models.
This establishes the required tables/database for testing and inserts the starter data. 
*/

const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

async function commonBeforeAll() {
  // deletes any data that might be leftover in the test database tables.
  await db.query("DELETE FROM users");
  await db.query("ALTER SEQUENCE jobs_id_seq RESTART WITH 1");
  await db.query("DELETE FROM recipes");
  await db.query("ALTER SEQUENCE recipes_id_seq RESTART WITH 1");
  await db.query("DELETE FROM remixes");
  await db.query("ALTER SEQUENCE remixes_id_seq RESTART WITH 1");
  await db.query("DELETE FROM recipe_favorites");
  await db.query("ALTER SEQUENCE recipe_favorites_id_seq RESTART WITH 1");
  await db.query("DELETE FROM remix_favorites");
  await db.query("ALTER SEQUENCE remix_favorites_id_seq RESTART WITH 1");
  await db.query("DELETE FROM recipe_reviews");
  await db.query("ALTER SEQUENCE recipe_reviews_id_seq RESTART WITH 1");
  await db.query("DELETE FROM remix_reviews");
  await db.query("ALTER SEQUENCE remix_reviews_id_seq RESTART WITH 1");

  //insert starter test data
  //2 users: user1 and user2
  await db.query(`INSERT INTO users (username, email, hashed_password)
        VALUES ('user1', 'u1@gmail.com', $1),
               ('user2', 'u2@gmail.com', $2)
        RETURNING username`,
        [await bcrypt.hash("password1", BCRYPT_WORK_FACTOR), await bcrypt.hash("password2", BCRYPT_WORK_FACTOR)]
  );

  //3 recipes: 2 by user1 and 1 by user2.
  await db.query(`INSERT into recipes (user_id, name, description, ingredients, directions, cooking_time, servings, image_url)
        VALUES (1, 'recipe 1.1', 'The first recipe by user 1', 'Onions, celery, garlic', 'Put everything in a pot and let it cook', 30, 4, 'http://recipe1.img'),
               (1, 'recipe 1.2', 'The second recipe by user 1', 'Cherries, apple, water', 'Put everything into blender', 10, 6, 'http://recipe2.img'),
               (2, 'recipe 2.1'. 'The first recipe by user 2', 'beef, chicken, pork', 'Let it cook in the oven', 120, 3, 'http://recipe3.img')`,            
  );

  //3 remixes: 1 by user1 and 2 by user2.
  // user1 remixes recipe 2.1, user2 remixes recipe 1.1 and 1.2.
  await db.query(`INSERT INTO remixes (user_id, recipe_id, purpose, name, description, ingredients, directions, cooking_time, servings, image_url)
        VALUES (1, 3, 'Add a new meat', 'recipe 2.1 remix', 'The remixed first recipe by user 2', 'beef, chicken, pork, mutton', 'Let all the meats cook in the oven', 150, 4, 'http://remix1.img),
               (2, 1, 'Add a new vegetable', 'recipe 1.1 remix', 'The remixed first recipe by user 1', 'Onions, celery, garlix, tomatoes', 'Put everything in a pot and let it cook', 30, 4, 'http://remix2.img),
               (2, 2, 'Add ice', 'recipe 1.2 remix', 'The remixed second recipe by user 1', 'Cherries, apple, water, ice', 'Put everything into a blender and let ice melt', 20, 6, 'http://remix3.img')`
  );

  //3 recipe favorites: user1 likes recipe 1.1 and recipe 2.1, user2 likes recipe 1.2.
  await db.query(`INSERT INTO recipe_favorites (user_id, recipe_id)
        VALUES (1, 1), (1, 3), (2, 2)`);

  //2 remix favorites: user1 likes the recipe 1.1 remix and user2 likes the recipe 2.1 remix.
  await db.query(`INSERT INTO remix_favorites (user_id, remix_id)
        VALUES (1, 2), (2, 1)`);

  //2 recipe reviews: user1 reviews recipe 1.1, user2 reviews recipe 1.2.
  await db.query(`INSERT INTO recipe_reviews (user_id, recipe_id, title, content)
        VALUES (1, 1, 'Yum!', 'I really like this recipe!'),
               (2, 2, 'My favorite!', 'I like this recipe a lot!')`);

  //2 remix reviews: user1 reviews recipe 1.1 remix and user2 reviews recipe 2.1 remix.
  await db.query(`INSERT INTO remix_reviews (user_id, remix_id, title, content)
        VALUES (1, 2, 'I love vegetables!', "I'm going to add more vegetables to this remix later."),
               (2, 1, 'I love meat!', "I'm going add another meat to this remix later.")`);
}

//starts SQL transaction block.
async function commonBeforeEach() {
  await db.query("BEGIN");
}

//undo the changes made by the test that was just finished.
async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll
};