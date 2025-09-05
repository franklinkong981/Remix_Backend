/* The routes in this app that have to do with users, such as updating a user's profile, viewing information on a specific user, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const User = require("../models/user.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

/** Helper function that validates the user search query in the request query string for GET /users. There should only be one attribute: Username. Throws BadRequestError otherwise. */
function validateUserSearchQuery(query) {
  for (const key of Object.keys(query)) {
    if (key !== "username") {
      throw new BadRequestError("The query string must only contain the non-empty property 'username'.");
    }
  }
}

/**
 * GET /users => {allUsers: [{username, email}, ...]}
 * 
 * Endpoint that allows retrieval of basic user information and/or searching for users by username.
 * If request object contains a query string with property "username", returns username and email for all users (sorted by username alphabetical order)
 * whose usernames contain the "username" query search term.
 * 
 * Otherwise, returns username and email of all users in the database sorted by username alphabetical order.
 * 
 * CONSTRAINTS:
 * If query string is present, it must only contain one attribute: username. BadRequestError will be thrown otherwise.
 * 
 * Authorization required: Logged in.
 */
router.get("/", ensureLoggedIn, async function(req, res, next) {
  let allUsers;
  try {
    if (Object.keys(req.query).length === 0) {
      allUsers = await User.getAllUsers();
    } else {
      validateUserSearchQuery(req.query);

      allUsers = await User.searchUsers(req.query.username);
    }

    return res.status(200).json({allUsers});
  } catch (err) {
    return next(err);
  }
});

/** PATCH /users/[username] { username, email } => { updatedUser: {username, email} }
 * 
 *  Endpoint where a logged in user can update their information. 
 * 
 *  CONSTRAINTS:
 *  - req.body must include AT LEAST one attribute: Username or email.
 *  - Can't have attributes other than username and email.
 *  - Updated username must be between 5-30 characters.
 *  - Updated email has to be proper email format.
 * 
 *  Returns newly updated username and email in updatedUser object.
 *
 * Authorization required: logged in and username must match.
 **/

router.patch("/:username", ensureLoggedIn, ensureIsCorrectUser, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.update(req.params.username, req.body);
    return res.json({ updatedUser: user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;