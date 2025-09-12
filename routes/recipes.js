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
 * GET /recipes => {recipeSearchResults: [{id, name, description, imageUrl, createdAt}, ...]}
 * 
 * Endpoint for recipe searchbar search results in the app. Returns basic information for all recipes whose names match the search term.
 * If request object contains a query string with property "recipeName", returns recipe information for all recipes whose names match the search term,
 * sorted by name in alphabetical order.
 * 
 * Otherwise, returns basic information on all recipes in the database sorted by name in alphabetical order.
 * 
 * CONSTRAINTS:
 * If query string is present, it must only contain one attribute: recipeName. BadRequestError will be thrown otherwise.
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

      allRecipes = await Recipe.searchRecipes(req.query.recipeName);
    }

    return res.status(200).json({recipeSearchResults: allRecipes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId/remixes => { remixes: [ {id, name, description, imageUrl, createdAt}, ...] }
 * 
 * Endpoint for fetching basic information on all remixes of a recipe with a specific id.
 * 
 * Authorization requried: Logged in.
 */
router.get("/:recipeId/remixes", ensureLoggedIn, async function(req, res, next) {
  try {
    const remixes = Recipe.getRemixes(req.params.recipeId);
    return res.status(200).json({remixes});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;