/* The routes in this app that have to do with remixes, updating a remix, etc. */

const express = require("express");
const router = new express.Router();

const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const Remix = require("../models/remix.js");
const {ensureLoggedIn, 
  ensureIsCorrectUser,
  ensureRemixBelongsToCorrectUser,
  ensureRemixReviewBelongsToCorrectUser
} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
const addRemixSchema = require("../schemas/remixNew.json");
const updateRemixSchema = require("../schemas/remixUpdate.json");
const addRemixReviewSchema = require("../schemas/remixReviewNew.json");

/**
 * GET /remixes/:remixId/reviews => { remixReviews: [ {id, reviewAuthor, title, content, createdAt}, ...] }
 * 
 * Endpoint for fetching information for all reviews of a particular remix. Will be needed for page that displays all reviews for a remix.
 * 
 * Authorization requried: Logged in.
 */
router.get("/:remixId/reviews", ensureLoggedIn, async function(req, res, next) {
  try {
    const remixReviews = await Remix.getRemixReviews(req.params.remixId);
    return res.status(200).json({remixReviews});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /remixes/:remixId => { remixDetails: [ {id, remixAuthor, purpose, name, description, originalRecipe, ingredients, directions, cookingTime, servings, reviews: [ {id, reviewAuthor, title, content, createdAt}, ... ], imageUrl, createdAt}, ...] }
 * 
 * Endpoint for fetching information for detailed information for a particular recipe, such as the ingredients, instructions, the user who created it, etc. All will be used on the page that displays a recipe's details.
 * 
 * Authorization required: Logged in.
 */
router.get("/:remixId", ensureLoggedIn, async function(req, res, next) {
  try {
    const remixDetails = await Remix.getRemixDetails(req.params.remixId, 3);
    return res.status(200).json({remixDetails});
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /remixes => { newRemix: {name, description, purpose, ingredients, directions, cookingTime, servings, imageUrl}, success message }
 * 
 * Endpoint for adding a new remix. Body is subject to the following constraints:
 * 
 * req.body CONSTRAINTS:
 *  - name must be of type string, 1-100 characters.
 *  - description must be of type string, 1-255 characters.
 *  - purpose must be of type string, 10-255 characters.
 *  - originalRecipeId must be a number, AND it must equal the id of a recipe found in the database.
 *  - ingredients must be of type string, cannot be empty.
 *  - directions must be of type string, cannot be empty.
 *  - cookingTime is optional, but if present, must be of type number and can't be negative.
 *  - servings is optional, but if present, must be of type number and can't be negative.
 *  - imageUrl is optional, but if present, must be of type string.
 * 
 *  - name, description, purpose, originalRecipeId, ingredients, and directions are required in the body of the request.
 *  - req.body cannot contain any attributes other than the 9 listed above.
 * 
 * Authorization required: Logged in.
 */
router.post("/", ensureLoggedIn, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, addRemixSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }

    const newRemix = await Remix.addRemix(res.locals.user.userId, req.body.originalRecipeId, req.body);
    return res.status(201).json({newRemix, message: `Successfully added new remix of recipe with id of ${req.body.originalRecipeId}`});
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /remixes => { updatedRecipe: {name, description, purpose, ingredients, directions, cookingTime, servings, imageUrl}, success message }
 * 
 * Endpoint for updating a new remix. Body is subject to the following constraints:
 * 
 * req.body CONSTRAINTS:
 *  - name must be of type string, 1-100 characters.
 *  - description must be of type string, 1-255 characters.
 *  - purpose must be of type string, 10-255 characters.
 *  - ingredients must be of type string, cannot be empty.
 *  - directions must be of type string, cannot be empty.
 *  - cookingTime is optional, but if present, must be of type number and can't be negative.
 *  - servings is optional, but if present, must be of type number and can't be negative.
 *  - imageUrl is optional, but if present, must be of type string.
 * 
 *  - Unlike the POST route, no attribute is required in the body, BUT req.body can't be empty.
 *  - req.body cannot contain any attributes other than the 8 listed above.
 * 
 * Authorization required: Logged in AND the user sending the request must have created this remix.
 */
router.patch("/:remixId", ensureLoggedIn, ensureRemixBelongsToCorrectUser, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, updateRemixSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }
    
    const updatedRemix = await Remix.updateRemix(req.params.remixId, req.body);
    return res.status(200).json({updatedRemix, message: `Successfully updated the remix with id ${req.params.remixId}`});
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /remixes/reviews => { newRecipeReview: {reviewId, userId, remixId, title, content, createdAt}, success message }
 * 
 * Endpoint for adding a new remix review. Body is subject to the following constraints:
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
router.post("/:remixId/reviews", ensureLoggedIn, async function(req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, addRemixReviewSchema);
    if (!(inputValidator.valid)) {
      const inputErrors = inputValidator.errors.map(err => err.stack);
      throw new BadRequestError(inputErrors);
    }

    const newRemixReview = await Remix.addReview(res.locals.user.userId, req.params.remixId, req.body);
    return res.status(201).json({newRemixReview, message: `Successfully added new review for remix with id ${req.params.remixId}.`});
  } catch (err) {
    return next(err);
  }
});


module.exports = router;