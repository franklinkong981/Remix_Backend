/* The routes in this app that have to do with users, such as updating a user's profile, viewing information on a specific user, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const User = require("../models/user.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");

function validateUserSearchQuery(query) {
  for (const key of Object.keys(query)) {
    if (key !== "username") {
      throw new BadRequestError("The query string must only contain the non-empty property 'username'");
    }

    if (!(Object.hasOwn(query, "username"))) {
      throw new BadRequestError("The query string must contain the non-empty property 'username'");
    }
  }
}

/**
 * GET /users => {users: [{username, email}, ...]}
 * 
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



module.exports = router;