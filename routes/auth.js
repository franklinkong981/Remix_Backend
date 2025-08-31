/** The routes in the app that have to do with authentication. Right now they include the route to return a token upon
 *  successful login and the route to register a new user.
 * 
 * All routes in this file will have the prefix of "/auth".
 */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const {User} = require("../models/user.js");

const jsonschema = require("jsonschema");
const userRegisterSchema = require("../schemas/userRegister.json");

/**
 * POST /auth/register: Req.body {user: {username, email, password}} => success message is successful.
 * 
 * User registration endpoint aka Route to add a new user to the database. user object in request body MUST contain username, email, password subject
 * to certain constraints.
 * 
 * Returns success message if successful, throws error if unsuccessful.
 * 
 * Authorization required: None.
 */
router.post("/register", async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, userRegisterSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
