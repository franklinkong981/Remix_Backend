/** Contains tests for the token-related helper functions in token.js that are involved in creating and returning JSON Web tokens. */

const jwt = require("jsonwebtoken");
const { createToken } = require("./token.js");
const {SECRET_KEY} = require("../config.js");

describe("The function createToken works as intended", function() {
  test("Generates and returns a signed token that contains the correct payload", function() {
    const token = createToken({id: 1, username: "user1", email: "user1@gmail.com"});
    const payload = jwt.verify(token, SECRET_KEY);
    expect(payload).toEqual({
      userId: 1,
      username: "user1",
      email: "user1@gmail.com",
      iat: expect.any(Number)
    });
  });
});

