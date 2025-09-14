/** This file contains the middleware for Remix, all of which involve authentication. Many actions within the app 
 * require the user to be logged in, and some actions (ie. editing a review) are only allowed when a certain user is already
 * logged in (ie. the review's author must be logged in). The middleware functions here help enforce these restrictions.
 */

const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config.js");
const {UnauthorizedError, ForbiddenError} = require("../errors/errors.js");
const Recipe = require("../models/recipe.js");

/** Middleware function that authenticates the user.
 *  Will be executed before most routes. Checks the authorization attribute in the request headers to see if there is an encrypted
 *  jwt. This jwt will be only be supplied if a user is currently logged in. If it's not there, no error is thrown and the function returns.
 *  If it is, the token is decrypted with a secret key and the decrypted payload (username, email) is stored in the user attribute in res.locals.
 * 
 *  NOTE: Won't be an error if the token is invalid either.
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
    if (err instanceof jwt.JsonWebTokenError) return next();
    return next(err);
  }
}

/** Middleware function that checks if a user is logged in.
 *  This is executed when visiting certain pages that require a logged in user to access.
 *  Checks if there's a token payload in res.locals.user. If not, throws UnauthorizedError.
 */
function ensureLoggedIn(req, res, next) {
  try {
    if (!(res.locals.user)) throw new UnauthorizedError("You must be logged in to access this!");
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Some actions in the Remix app such as editing or deleting your own remixes/reviews can only be performed by their author.
 *  This middleware function ensures that the user attempting to perform this action (the current username supplied in the res.locals.user decrypted payload of the user's jwt)
 *  matches the username supplied in request parameters (the username that the remix/review belongs to).
 * 
 *  If it doens't match, returns an UnauthorizedError.
 */
function ensureIsCorrectUser(req, res, next) {
  try {
    const userPayload = res.locals.user;
    if (!userPayload) throw new UnauthorizedError("You must be logged in to perform this action!");
    if (userPayload.username != req.params.username) {
      throw new UnauthorizedError("You can only edit/delete your own recipes/remixes/reviews or information from your own account!");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * This middleware function will be called when a logged in user tries to update a recipe. It will make sure that
 * the recipe the user is trying to update was created by the user, throws a ForbiddenError otherwise.
 * 
 * Only the recipe's author has the ability to update the recipe.
 */
async function ensureRecipeBelongsToCorrectUser(req, res, next) {
  try {
    //by now, the ensureIsLoggedIn middleware has already passed, so we know a payload exists in res.locals.user.
    const loggedInUsername = res.locals.user.username;
    const recipeAuthor = await Recipe.getRecipeAuthor(req.params.recipeId);
    if (loggedInUsername != recipeAuthor.username) {
      throw new ForbiddenError("You can't edit this recipe because you didn't create it.");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * This middleware function will be called when a logged in user tries to update a recipe review. It will make sure that
 * the recipe review the user is trying to update was created by the user, throws a ForbiddenError otherwise.
 * 
 * Only the recipe review's author has the ability to update the recipe review.
 */
async function ensureRecipeReviewBelongsToCorrectUser(req, res, next) {
  try {
    //by now, the ensureIsLoggedIn middleware has already passed, so we know a payload exists in res.locals.user.
    const loggedInUsername = res.locals.user.username;
    const recipeReviewAuthor = await Recipe.getReviewAuthor(req.params.reviewId);
    if (loggedInUsername != recipeReviewAuthor.username) {
      throw new ForbiddenError("You can't edit this recipe review because you didn't create it.");
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJwt,
  ensureLoggedIn,
  ensureIsCorrectUser,
  ensureRecipeBelongsToCorrectUser
}