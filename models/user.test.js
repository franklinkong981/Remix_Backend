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