/* The routes in this app that have to do with users, such as updating a user's profile, viewing information on a specific user, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const User = require("../models/user.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");

/**
 * GET /users => {users: [{username, email}, ...]}
 * 
 * Returns all users basic info (username and email) from the database sorted by username in alphabetical order.
 * 
 * Authorization required: Logged in.
 */
router.get("/", ensureLoggedIn, async function(req, res, next) {
  try {
    const allUsers = await User.getAllUsers();
    return res.status(200).json({allUsers});
  } catch (err) {
    return next(err);
  }
});



module.exports = router;