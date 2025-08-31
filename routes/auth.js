/** The routes in the app that have to do with authentication. Right now they include the route to return a token upon
 *  successful login and the route to register a new user.
 */

const express = require("express");
const router = new express.Router();

const jsonschema = require("jsonschema");

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const {User} = require("../models/user.js");


module.exports = router;
