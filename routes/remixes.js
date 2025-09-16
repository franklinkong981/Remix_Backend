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


module.exports = router;