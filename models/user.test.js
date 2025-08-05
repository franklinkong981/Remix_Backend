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

/************************************** registerNewUser */

function createNewUserObject(username, email, password) {
  return {
    username, email, password
  };
}

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