/* This file tests the various methods found in the User model class, like authenticating a user, fetching information on all users, etc. 
*/

const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors/errors.js");
const db = require("../db.js");
const User = require("./user.js");
const {commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

function createNewUserObject(username, email, password) {
  return {
    username, email, password
  };
}

/************************************** registerNewUser */

describe("registerNewUser works as intended", function() {
  const usernames = ["new_user", "new", "this username is way too long, it is over 30 characters"];
  const emails = ["newuser981@gmail.com", "bad_email_format"];
  const passwords = ["good_password", "bad"];
  
  test("Successfully adds new user to database and returns correct user information if information provided meets requirements", async function() {
    let registeredUser = await User.registerNewUser({
      username: usernames[0],
      email: emails[0],
      password: passwords[0]
    });

    expect(registeredUser.username).toEqual(usernames[0]);
    expect(registeredUser.email).toEqual(emails[0]);
    expect(registeredUser.hashed_password.startsWith("$2b$")).toEqual(true);

    //make sure new user has been added to the database.
    const found = await db.query("SELECT * FROM users WHERE username = 'new_user'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].username).toEqual(usernames[0]);
    expect(found.rows[0].email).toEqual(emails[0]);
    expect(found.rows[0].hashed_password.startsWith("$2b$")).toEqual(true);
  });

  test("Returns a BadRequestError if a user with a duplicate username is registered", async function() {
    try {
      await User.registerNewUser({
        username: usernames[0],
        email: emails[0],
        password: passwords[0]
      });
      await User.registerNewUser({
        username: usernames[0],
        email: emails[0],
        password: passwords[0]
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The username new_user is already taken. Please try another username.");
    }
  });

  test("Returns a BadRequestError if the username is too short", async function() {
    try {
      await User.registerNewUser({
        username: usernames[1],
        email: emails[0],
        password: passwords[0]
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The username must be between 5-30 characters.");
    }
  });

  test("Returns a BadRequestError if the username is too long", async function() {
    try {
      await User.registerNewUser({
        username: usernames[2],
        email: emails[0],
        password: passwords[0]
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The username must be between 5-30 characters.");
    }
  });

  test("Returns a BadRequestError if the email is of the wrong format", async function() {
    try {
      await User.registerNewUser({
        username: usernames[0],
        email: emails[1],
        password: passwords[0]
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The email must have a valid format.");
    }
  });

  test("Returns a BadRequestError if the password is too short", async function() {
    try {
      await User.registerNewUser({
        username: usernames[0],
        email: emails[0],
        password: passwords[1]
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The password must be at least 8 characters.");
    }
  });
});

/************************************** authenticateUser */

describe("authenticateUser function works as intended", function() {
  test("Successfully authenticates a user if the correct username and password is supplied", async function() {
    const user = await User.authenticateUser('user1', 'password1');
    expect(user).toEqual({
      username: "user1",
      email: "u1@gmail.com"
    });
  });

  test("Throws UnauthorizedError if supplied username isn't found in the database", async function() {
    try {
      await User.authenticateUser("nonexistentuser", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
      expect(err.status).toEqual(401);
      expect(err.message).toEqual("Your username/password is incorrect. Please try again");
    }
  });

  test("Throws UnauthorizedError if username exists in database but supplied password doesn't match", async function() {
    try {
      await User.authenticateUser("user1", "wrong_password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
      expect(err.status).toEqual(401);
      expect(err.message).toEqual("Your username/password is incorrect. Please try again");
    }
  });
});

/************************************** getAllUsers */

describe("getAllUsers works as intended", function () {
  test("Successfully fetches and returns correct username and email for both users", async function () {
    const allUsers = await User.getAllUsers();
    expect(allUsers).toEqual([
      {
        username: "user1",
        email: "u1@gmail.com"
      },
      {
        username: "user2",
        email: "u2@gmail.com"
      },
    ]);
  });
});

/************************************** getUserBasicInfo */

describe("getAllUsers works as intended", function () {
  test("Successfully fetches and returns correct username and email if supplied username exists", async function () {
    const user = await User.getUserBasicInfo("user1");
    expect(user).toEqual({
        username: "user1",
        email: "u1@gmail.com"
    });
  });

  test("Throws NotFoundError if supplied username isn't found in the database", async function() {
    try {
      await User.getUserBasicInfo("random_username");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The user with username random_username was not found in the database.");
    }
  });
});

/************************************** searchUsers */

describe("searchUsers works as intended", function () {
  test("Successfully fetches and returns user1 but not user2 with search term 1", async function () {
    const searchResults = await User.searchUsers("1");
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].username).toEqual("user1");
  });

  test("Returns both user1 and user2 in alphabetical order if the search term is empty", async function () {
    const searchResults = await User.searchUsers("");
    expect(searchResults.length).toEqual(2);
    expect(searchResults[0].username).toEqual("user1");
    expect(searchResults[1].username).toEqual("user2");
  });

  test("Returns an empty array if no users match the search term", async function() {
    const searchResults = await User.searchUsers("no users!");
    expect(searchResults.length).toEqual(0);
  });
});

/************************************** updateUser */

describe("updateUser works as intended", function () {
  test("Successfully updates user 1's username and email", async function () {
    const updatedUser1 = await User.updateUser("user1", {username: "new_user", email: "new_user1@gmail.com"});
    expect(updatedUser1.username).toEqual("new_user");
    expect(updatedUser1.email).toEqual("new_user1@gmail.com");
  });

  test("Successfully partially updates user 2 by just changing the email", async function () {
    const updatedUser2 = await User.updateUser("user2", {email: "new_user2@gmail.com"});
    expect(updatedUser2.username).toEqual("user2");
    expect(updatedUser2.email).toEqual("new_user2@gmail.com");
  });

  test("Throws BadRequestError if data to update contains attributes other than username and email", async function () {
    try {
      const searchResults = await User.updateUser("user1", {username: "new_user", password: "new_password"});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("You can only update your username and/or email.");
    }
  });

  test("Throws BadRequestError if updated username does not have the correct length", async function () {
    try {
      const searchResults = await User.updateUser("user1", {username: "new"});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The new username must be between 5-30 characters.");
    }
  });

  test("Throws BadRequestError if updated email does not have the correct format", async function () {
    try {
      const searchResults = await User.updateUser("user1", {email: "new"});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The new email must be valid.");
    }
  });

  test("Throws NotFoundError if the username of user to be updated can't be found in the database", async function () {
    try {
      const searchResults = await User.updateUser("user3", {username: "new_user"});
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The user with username of user3 was not found in the database.")
    }
  });
});

/************************************** getRecipesFromUser */

describe("getRecipesFromUser works as intended", function () {
  test("Successfully fetches all of user1's recipes and returns the most recent recipe first, then by recipe name", async function () {
    const user1AllRecipes = await User.getRecipesFromUser("user1");
    expect(user1AllRecipes.length).toEqual(2);
    expect(user1AllRecipes[0].name).toEqual("recipe 1.1");
    expect(user1AllRecipes[0].description).toEqual("The first recipe by user 1");
    expect(user1AllRecipes[0].imageUrl).toEqual(expect.any(String));
    expect(user1AllRecipes[0].createdAt).toEqual(expect.any(Date));
    expect(user1AllRecipes[1].name).toEqual("recipe 1.2");
  });

  test("Successfully fetches only user1's most recent recipe with limit 1", async function () {
    const user1NewestRecipe = await User.getRecipesFromUser("user1", 1);
    expect(user1NewestRecipe.length).toEqual(1);
    const newestRecipe = user1NewestRecipe[0];
    expect(newestRecipe.name).toEqual("recipe 1.1");
  });

  test("Throws NotFoundError if the username of user to fetch remixes from can't be found in the database", async function () {
    try {
      const user1NewestRecipe = await User.getRecipesFromUser("new_user");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The user with username new_user was not found in the database.");
    }
  });
});

/************************************** getRemixesFromUser */

describe("getRemixesFromUser works as intended", function () {
  test("Successfully fetches all of user2's remixes and returns the most recent remix first, then by remix name", async function () {
    const user2AllRemixes = await User.getRemixesFromUser("user2");
    console.log(user2AllRemixes);
    expect(user2AllRemixes.length).toEqual(2);
    expect(user2AllRemixes[0].name).toEqual("recipe 1.1 remix");
    expect(user2AllRemixes[0].description).toEqual("The remixed first recipe by user 1");
    expect(user2AllRemixes[0].imageUrl).toEqual(expect.any(String));
    expect(user2AllRemixes[0].createdAt).toEqual(expect.any(Date));
    expect(user2AllRemixes[1].name).toEqual("recipe 1.2 remix");
  });

  test("Successfully fetches only user2's most recent remix with limit 1", async function () {
    const user2NewestRemix = await User.getRemixesFromUser("user2", 1);
    expect(user2NewestRemix.length).toEqual(1);
    const newestRemix = user2NewestRemix[0];
    expect(newestRemix.name).toEqual("recipe 1.1 remix");
  });

  test("Throws NotFoundError if the username of user to fetch remixes from can't be found in the database", async function () {
    try {
      const user2NewestRemix = await User.getRemixesFromUser("new_user");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The user with username new_user was not found in the database.");
    }
  });
});