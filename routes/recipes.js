/* The routes in this app that have to do with recipes, such as fetching information on all recipes, adding a recipe, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const Recipe = require("../models/recipe.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
//insert all schemas here.

/** Helper function that validates the recipe search query in the request query string for GET /recipes. There should only be one attribute: recipeName. Throws BadRequestError otherwise. */
function validateRecipeSearchQuery(query) {
  for (const key of Object.keys(query)) {
    if (key !== "recipeName") {
      throw new BadRequestError("The query string must only contain the non-empty property 'recipeName'.");
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
  let allRecipes;
  try {
    if (Object.keys(req.query).length === 0) {
      allRecipes = await Recipe.getAllRecipesBasicInfo();
    } else {
      validateRecipeSearchQuery(req.query);

      allRecipes = await Recipe.searchRecipes(req.query.username);
    }

    return res.status(200).json({recipeSearchResults: allRecipes});
  } catch (err) {
    return next(err);
  }
});



module.exports = router;