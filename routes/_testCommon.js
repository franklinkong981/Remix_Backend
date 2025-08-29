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

  /* await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });
  await Company.create(
    {
      handle: "c4",
      name: "C4",
      numEmployees: 4,
      description: "Desc4",
      logoUrl: "http://c4.img",
    });
  
  await Job.create({title: 'j1', salary: 100, equity: 0.6, companyHandle: 'c1'});
  await Job.create({title: 'j2', salary: 150, equity: 0.5, companyHandle: 'c2'});
  await Job.create({title: 'j3', salary: 200, equity: 0.0, companyHandle: 'c3'});
  await Job.create({title: 'j4', salary: 50, equity: 0.0, companyHandle: 'c1'});

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: true,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  await User.applyToJob("u2", 1); */
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


const u1Token = createToken({ username: "u1", isAdmin: true });
const u2Token = createToken({ username: "u2", isAdmin: false});


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token
};