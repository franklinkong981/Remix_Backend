/**  Contains helper functions that aid in token creation. */

const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config.js");

/** Creates a token by taking the user information inputted (should contain username and email), generates a token 
 *  with the user information input as the payload, signs it with a secret key, and returns is.
 * 
 *  The password must not be supplied, that is private information.
 */
function createToken({username, email}) {
  let tokenPayload = {
    username: username,
    email: email
  };

  return jwt.sign(tokenPayload, SECRET_KEY)
}

module.export = {createToken};