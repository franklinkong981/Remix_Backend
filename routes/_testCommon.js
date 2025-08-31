/* This is the file that sets up testing for the routes in the Remix app.
This establishes the required tables/database for testing and inserts the starter data. 
*/

const db = require("../db.js");
const User = require("../models/user.js");
const Recipe = require("../models/recipe.js");
const Remix = require("../models/remix.js");
const { createToken } = require("../helpers/token.js");

async function commonBeforeAll() {
  // deletes any data that might be leftover in the test database tables.
  await db.query("DELETE FROM users");
  await db.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
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

  await User.registerNewUser({
    username: "user1",
    email: "user1@gmail.com",
    password: "user1password"
  });

  await User.registerNewUser({
    username: "user2",
    email: "user2@gmail.com",
    password: "user2password"
  });

  //3 recipes: Recipe 1.1 by user 1 is a vegetable recipe, recipe 1.2 by user 1 is a fruit blender recipe, recipe 2.1 by user 2 is a meat recipe.
  await Recipe.addRecipe(1, {
    name: "recipe 1.1",
    description: "The first recipe by user 1",
    ingredients: "Onions, celery, garlic",
    directions: "Put everything in a pot and let it cook",
    servings: 4,
    imageUrl: "http://recipe1.img"
  });

  await Recipe.addRecipe(1, {
    name: "recipe 1.2",
    description: "The second recipe by user 1",
    ingredients: "Cherries, apple, water",
    directions: "Put everything into blender",
    cookingTime: 10,
    imageUrl: "http://recipe2.img"
  });

  await Recipe.addRecipe(2, {
    name: "recipe 2.1",
    description: "The first recipe by user 2",
    ingredients: "beef, chicken, pork",
    directions: "Let it cook in the oven",
    cookingTime: 120,
    servings: 3
  });

  //4 remixes: Recipe 2.1 (meat recipe) remix 1 by user 1 adds mutton, recipe 2.1 (meat recipe) remix 2 by user 2 adds mutton and rabbit.
  // Recipe 1.1 remix by user 2 adds a new vegetable: Tomatoes. Recipe 1.2 remix by user 2 adds more ice.
  await Remix.addRemix(1, 3, {
    name: "recipe 2.1 remix 1",
    description: "The first remix of recipe 2.1 by user 1",
    purpose: "Add a new meat",
    ingredients: "beef, chicken, pork, mutton",
    directions: "Let all the meats cook in the oven",
    servings: 5,
    imageUrl: "http://remix1.img"
  });

  await Remix.addRemix(2, 3, {
    name: "recipe 2.1 remix 2",
    description: "The second remix of recipe 2.1 by user 2",
    purpose: "Add 2 new meats",
    ingredients: "beef, chicken, pork, mutton, rabbit",
    directions: "Let all the meats including rabbit meat cook in the oven",
    servings: 6,
    imageUrl: "http://remix2.img"
  });

  await Remix.addRemix(2, 1, {
    name: "recipe 1.1 remix",
    description: "The remix of recipe 1.1 by user 2",
    purpose: "Add a new vegetable",
    ingredients: "Onions, celery, garlic, tomatoes",
    directions: "Put everything in a pot and let it cook",
    cookingTime: 40,
    imageUrl: "http://remix3.img"
  });

  await Remix.addRemix(2, 2, {
    name: "recipe 1.2 remix",
    description: "The remix of recipe 1.2 by user 2",
    purpose: "Add more ice",
    ingredients: "Cherries, apple, water, ice",
    directions: "Put everything into a blender and let ice melt",
    cookingTime: 12,
    servings: 2
  });

  //user1 likes recipe 1.1 (vegetable recipe) and recipe 2.1 (meat recipe). user2 likes recipe 1.2 (fruit blender recipe).
  //user1 likes recipe 2.1 remix 2 (meats + mutton + rabbit). user2 likes recipe 2.1 remix 1 (+ mutton) and recipe 2.1 remix 2 (+ mutton and rabbit).
  await User.addRecipeToFavorites("user1", 1);
  await User.addRecipeToFavorites("user1", 3);
  await User.addRecipeToFavorites("user2", 2);

  await User.addRemixToFavorites("user1", 2);
  await User.addRemixToFavorites("user2", 1);
  await User.addRemixToFavorites("user2", 2);

  //4 recipe reviews: user1 reviews recipe 1.1 and recipe 2.1, user2 reviews recipe 1.2 and recipe 2.1
  await Recipe.addReview(1, 1, {
    title: "Yum!",
    content: "I really like this recipe!"
  });

  await Recipe.addReview(1, 3, {
    title: "Another delicious recipe!",
    content: "I make this all the time!"
  });

  await Recipe.addReview(2, 2, {
    title: "My favorite!",
    content: "I like this recipe the best!"
  });

  await Recipe.addReview(2, 3, {
    title: "My second favorite!",
    content: "I like this recipe the second best!"
  });

  //3 remix reviews: user1 reviews the recipe 1.1 remix (that adds tomatoes) and recipe 2.1 remix 1 (adds mutton), user2 reviews recipe 2.1 remix 1 (adds mutton) 
  await Remix.addReview(1, 3, {
    title: "I love vegetables!",
    content: "I'm going to add more vegetables to this remix later."
  });

  await Remix.addReview(1, 1, {
    title: "New meat is good",
    content: "I really enjoy this new recipe that adds a meat"
  });

  await Remix.addReview(2, 1, {
    title: "I love meat!",
    content: "I'm going to add another meat to this remix later."
  });
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const user1Token = createToken({ username: "user1", email: "user1@gmail.com" });
const user2Token = createToken({ username: "user2", email: "user2@gmail.com"});


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token
};