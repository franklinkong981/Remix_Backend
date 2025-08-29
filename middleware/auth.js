/** This file contains the middleware for Remix, all of which involve authentication. Many actions within the app 
 * require the user to be logged in, and some actions (ie. editing a review) are only allowed when a certain user is already
 * logged in (ie. the review's author must be logged in). The middleware functions here help enforce these restrictions.
 */

const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config.js");
const {UnauthorizedError} = require("../errors/errors.js");

/** Middleware function that authenticates the user.
 *  Will be executed before most routes. Checks the authorization attribute in the request headers to see if there is an encrypted
 *  jwt. This jwt will be only be supplied if a user is currently logged in. If it's not there, no error is thrown and the function returns.
 *  If it is, the token is decrypted with a secret key and stored in the user attribute in res.locals.
 * 
 *  NOTE: This middleware function will be run before almost every route since res.locals is not shared between different request/response cycles.
 */
function authenticateJwt(req, res, next) {
  try {
    const reqHeaderEncryptedJwt = req.headers && req.headers.authorization;
    if (reqHeaderEncryptedJwt) {
      const encryptedToken = reqHeaderEncryptedJwt.trim();
      const decryptedTokenPayload = jwt.verify(encryptedToken, SECRET_KEY);
      res.locals.user = decryptedTokenPayload;
    }
    return next();
  } catch (err) {
    return next(err);
  }
}