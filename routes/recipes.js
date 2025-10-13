/* The routes in this app that have to do with recipes, such as fetching information on all recipes, adding a recipe, etc. */

const express = require("express");
const router = new express.Router();

const {convertToReadableDateTime, changeCreatedAtAttribute} = require("../helpers/dateTime.js");
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
const addRecipeReviewSchema = require("../schemas/recipeReviewNew.json");
const updateRecipeReviewSchema = require("../schemas/recipeReviewUpdate.json");

/** Helper function that validates the recipe search query in the request query string for GET /recipes. There should only be one attribute: recipeName. Throws BadRequestError otherwise. */
function validateRecipeSearchQuery(query) {
  for (const key of Object.keys(query)) {
    if (key !== "recipeName") {
      throw new BadRequestError("The query string must only contain the non-empty property 'recipeName'.");
    }
  }
}

/**
 * GET /recipes => {recipeSearchResults: [{id, name, recipeAuthor, description, imageUrl, createdAt}, ...]}
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
  let allRecipesRaw;
  try {
    if (Object.keys(req.query).length === 0) {
      allRecipesRaw = await Recipe.getAllRecipesBasicInfo();
    } else {
      validateRecipeSearchQuery(req.query);

      allRecipesRaw = await Recipe.searchRecipes(req.query.recipeName);
    }
    
    //convert createdAt attribute for each recipe object from an sql datetimestamp to a readable string.
    const allRecipes = allRecipesRaw.map(recipe => changeCreatedAtAttribute(recipe));

    return res.status(200).json({recipeSearchResults: allRecipes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId/remixes => { remixes: [ {id, name, remixAuthor, description, imageUrl, createdAt}, ...] }
 * 
 * Endpoint for fetching basic information on all remixes of a recipe with a specific id.
 * 
 * Authorization requried: Logged in.
 */
router.get("/:recipeId/remixes", ensureLoggedIn, async function(req, res, next) {
  try {
    const remixesRaw = await Recipe.getRemixes(req.params.recipeId);
    const remixes = remixesRaw.map(remix => changeCreatedAtAttribute(remix));

    return res.status(200).json({remixes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId/reviews => { recipeReviews: [ {id, reviewAuthor, recipeName, title, content, createdAt}, ...] }
 * 
 * Endpoint for fetching information for all reviews of a particular recipe. Will be needed for page that displays all reviews for a recipe.
 * 
 * Authorization requried: Logged in.
 */
router.get("/:recipeId/reviews", ensureLoggedIn, async function(req, res, next) {
  try {
    const recipeReviewsRaw = await Recipe.getRecipeReviews(req.params.recipeId);
    const recipeReviews = recipeReviewsRaw.map(recipeReviews => changeCreatedAtAttribute(recipeReviews));

    return res.status(200).json({recipeReviews});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/:recipeId => { recipeDetails: {id, recipeAuthor, name, description, ingredients, directions, cookingTime, servings, 
 * (3 most recent) remixes: [ {id, name, description, imageUrl, createdAt}, ... ], mostRecentRecipeReview: {id, reviewAuthor, title, content, createdAt}, imageUrl, createdAt} }
 * 
 * Endpoint for fetching information for detailed information for a particular recipe, such as the ingredients, instructions, the user who created it, etc. 
 * All will be used on the page that displays a recipe's details. Also contains the 3 most recently created remixes of the recipe as well as the recipe's most recently added review.
 * 
 * Authorization required: Logged in.
 */
router.get("/:recipeId", ensureLoggedIn, async function(req, res, next) {
  try {
    const recipeDetailsRaw = await Recipe.getRecipeDetails(req.params.recipeId, 3, 1);

    //convert each recipe and remix object's createdAt attribute to a readable string.
    let rawRemixList = recipeDetailsRaw.remixes;
    const remixList = rawRemixList.map(remix => changeCreatedAtAttribute(remix));

    //if the recipe doesn't yet have any recipe reviews, recipeDetailsRaw.reviews will be an empty array.
    let mostRecentRecipeReview = {};
    if (recipeDetailsRaw.reviews.length > 0) {
      mostRecentRecipeReview = changeCreatedAtAttribute(recipeDetailsRaw.reviews[0]);
    }
    
    let createdAtRaw = recipeDetailsRaw.createdAt;
    const createdAt = convertToReadableDateTime(createdAtRaw);

    const recipeDetails = {...recipeDetailsRaw, remixes: remixList, mostRecentRecipeReview, createdAt};

    return res.status(200).json({recipeDetails});
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /recipes => { newRecipe: {id, name, description, ingredients, directions, cookingTime, servings, imageUrl} }
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
    return res.status(201).json({newRecipe});
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /recipes => { updatedRecipe: {id, name, description, ingredients, directions, cookingTime, servings, imageUrl}, success message }
 * 
 * Endpoint for updating a new recipe. Body is subject to the following constraints:
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
 *  - Unlike the POST route, no attribute is required in the body, BUT req.body can't be empty.
 *  - req.body cannot contain any attributes other than the 7 listed above.
 * 
 * Authorization required: Logged in AND the user sending the request must have created this recipe.
 */
router.patch("/:recipeId", ensureLoggedIn, ensureRecipeBelongsToCorrectUser, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, updateRecipeSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }
    
    const updatedRecipe = await Recipe.updateRecipe(req.params.recipeId, req.body);
    return res.status(200).json({updatedRecipe});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /recipes/reviews/:reviewId => { recipeReview: [ {id, reviewAuthor, title, content, createdAt}, ...] }
 * 
 * Endpoint for fetching information for a single review by fetching the review that has review id of reviewId.
 * 
 * Authorization requried: Logged in.
 */
router.get("/reviews/:reviewId", ensureLoggedIn, async function(req, res, next) {
  try {
    const recipeReviewRaw = await Recipe.getRecipeReview(req.params.reviewId);
    const recipeReview = changeCreatedAtAttribute(recipeReviewRaw);

    return res.status(200).json({recipeReview});
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /recipes/:recipeId/reviews => { newRecipeReview: {reviewId, userId, recipeId, title, content} }
 * 
 * Endpoint for adding a new recipe review. Body is subject to the following constraints:
 * 
 * req.body CONSTRAINTS:
 *  - title must be a string and must be 1-100 characters long.
 *  - content must be a string and can't be an empty string.
 * 
 *  - title and content attributes are required in req.body.
 *  - req.body cannot contain any attributes other than the 2 listed above.
 * 
 * Authorization required: Logged in.
 */
router.post("/:recipeId/reviews", ensureLoggedIn, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, addRecipeReviewSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }

    const newRecipeReview = await Recipe.addReview(res.locals.user.userId, req.params.recipeId, req.body);
    return res.status(201).json({newRecipeReview});
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /recipes/:recipeId/reviews/:reviewId => { updatedRecipeReview: {reviewId, userId, recipeId, title, content}, success message }
 * 
 * Endpoint for updating a new recipe review. Body is subject to the following constraints:
 * 
 * req.body CONSTRAINTS:
 *  - title must be a string and must be 1-100 characters long.
 *  - content must be a string and can't be an empty string.
 * 
 *  - Unlike the POST route, no attribute is required in the body, BUT req.body can't be empty.
 *  - req.body cannot contain any attributes other than the 2 listed above.
 * 
 * Authorization required: Logged in AND recipe review must belong to the user.
 */
router.patch("/:recipeId/reviews/:reviewId", ensureLoggedIn, ensureRecipeReviewBelongsToCorrectUser, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, updateRecipeReviewSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }

    const updatedRecipeReview = await Recipe.updateReview(req.params.reviewId, req.body);
    return res.status(200).json({updatedRecipeReview, message: `Successfully updated recipe review with id ${req.params.reviewId}.`});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;