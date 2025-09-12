/* The routes in this app that have to do with recipes, such as fetching information on all recipes, adding a recipe, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const Recipe = require("../models/recipe.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
//insert all schemas here.





module.exports = router;