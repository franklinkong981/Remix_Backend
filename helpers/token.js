/**  Contains helper functions that aid in token creation. Currently only contains one function: createToken. */

const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config.js");

/** Creates a token by taking the user information inputted (should contain userId, username and email), generates a token 
 *  with the user information input as the payload, signs it with a secret key, and returns it.
 * 
 *  Returned signed token will contain the userId, username, email, and iat (date and time token was issued/created).
 * 
 *  The password must not be supplied, that is private information.
 */
function createToken({id, username, email}) {
  let tokenPayload = {
    userId: id,
    username: username,
    email: email
  };

  return jwt.sign(tokenPayload, SECRET_KEY)
}

module.exports = {createToken};