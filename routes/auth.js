/** The routes in the app that have to do with authentication. Right now they include the route to return a token upon
 *  successful login and the route to register a new user.
 * 
 * All routes in this file will have the prefix of "/auth".
 */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const User = require("../models/user.js");

const jsonschema = require("jsonschema");
const userRegisterSchema = require("../schemas/userRegister.json");

/**
 * POST /auth/register: Req.body {user: {username, email, password}} => success message is successful.
 * 
 * User registration endpoint aka Route to add a new user to the database. user object in request body MUST contain username, email, password subject
 * to certain constraints.
 * 
 * CONSTRAINTS
 * - Required req.body attributes: username, email, password.
 * - username: string, 5-30 characters
 * - email: string, not empty, email format.
 * - password: string, >= 8 characters.
 * 
 * Returns {newUserInfo: {username, email}, message: "Successfully registered new user"} throws error if unsuccessful.
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

    const newUserInfo = await User.registerNewUser(req.body);
    return res.status(201).json({newUserInfo, message: "Successfully registered new user"});
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/login:  { username, password } => { user: {username, email}, token }
 *
 * User login endpoint. If successful (username and password match info in database), returns user information and an encrypted JWT token
 * which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/login", async function (req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, userLoginSchema);
    if (!inputValidator.valid) {
      const inputErrors = inputValidator.errors.map(e => e.stack);
      throw new BadRequestError(inputErrors);
    }

    const { username, password } = req.body;
    const user = await User.authenticateUser(username, password);
    const token = createToken(user);
    return res.json({ user, token });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
