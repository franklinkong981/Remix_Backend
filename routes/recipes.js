/* The routes in this app that have to do with recipes, such as fetching information on all recipes, adding a recipe, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const Recipe = require("../models/recipe.js");
const {ensureLoggedIn, 
  ensureIsCorrectUser,
  ensureRecipeBelongsToCorrectUser,
  ensureRecipeReviewBelongsToCorrectUser
} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
const addRecipeSchema = require("../schemas/recipeNew.json");
const updateRecipeSchema = require("../schemas/recipeUpdate.json");

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
    const remixes = await Recipe.getRemixes(req.params.recipeId);
    return res.status(200).json({remixes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId/reviews => { recipeReviews: [ {id, reviewAuthor, title, content, createdAt}, ...] }
 * 
 * Endpoint for fetching information for all reviews of a particular recipe. Will be needed for page that displays all reviews for a recipe.
 * 
 * Authorization requried: Logged in.
 */
router.get("/:recipeId/reviews", ensureLoggedIn, async function(req, res, next) {
  try {
    const recipeReviews = await Recipe.getRecipeReviews(req.params.recipeId);
    return res.status(200).json({recipeReviews});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId => { recipeDetails: [ {id, recipeAuthor, name, description, ingredients, directions, cookingTime, servings, remixes: [ {id, name, description, imageUrl, createdAt}, ... ], reviews: [ {id, reviewAuthor, title, content, createdAt}, ... ], imageUrl, createdAt}, ...] }
 * 
 * Endpoint for fetching information for detailed information for a particular recipe, such as the ingredients, instructions, the user who created it, etc. All will be used on the page that displays a recipe's details.
 * 
 * Authorization required: Logged in.
 */
router.get("/:recipeId", ensureLoggedIn, async function(req, res, next) {
  try {
    const recipeDetails = await Recipe.getRecipeDetails(req.params.recipeId, 3);
    return res.status(200).json({recipeDetails});
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /recipes => { newRecipe: {name, description, ingredients, directions, cookingTime, servings, imageUrl}, success message }
 * 
 * Endpoint for adding a new recipe. Body is subject to the following constraints:
 * 
 * req.body CONSTRAINTS:
 *  - name must be of type string, 1-100 characters.
 *  - description must be of type string, 1-255 characters.
 *  - ingredients must be of type string, cannot be empty.
 *  - directions must be of type string, cannot be empty.
 *  - cookingTime is optional, but if present, must be of type number and can't be negative.
 *  - servings is optional, but if present, must be of type number and can't be negative.
 *  - imageUrl is optional, but if present, must be of type string.
 * 
 *  - name, description, ingredients, and directions are required in the body of the request.
 *  - req.body cannot contain any attributes other than the 7 listed above.
 * 
 * Authorization required: Logged in.
 */
router.post("/", ensureLoggedIn, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, addRecipeSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }

    const newRecipe = await Recipe.addRecipe(res.locals.user.userId, req.body);
    return res.status(201).json({newRecipe, message: "Successfully added new recipe"});
  } catch (err) {
    return next(err);
  }
});

router.patch("/:recipeId", ensureLoggedIn, ensureRecipeBelongsToCorrectUser, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, updateRecipeSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }
    
    const updatedRecipe = await Recipe.updateRecipe(req.params.recipeId, req.body);
    return res.status(200).json({updatedRecipe, message: `Successfully updated the recipe with id ${req.params.recipeId}`});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;