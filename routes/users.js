/* The routes in this app that have to do with users, such as updating a user's profile, viewing information on a specific user, etc. */

const express = require("express");
const router = new express.Router();

const {createToken} = require("../helpers/token.js");
const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const User = require("../models/user.js");
const {ensureLoggedIn, ensureIsCorrectUser} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");
const userUpdateSchema = require("../schemas/userUpdate.json");

/** Helper function that validates the user search query in the request query string for GET /users. There should only be one attribute: Username. Throws BadRequestError otherwise. */
function validateUserSearchQuery(query) {
  for (const key of Object.keys(query)) {
    if (key !== "username") {
      throw new BadRequestError("The query string must only contain the non-empty property 'username'.");
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
  let allUsers;
  try {
    if (Object.keys(req.query).length === 0) {
      allUsers = await User.getAllUsers();
    } else {
      validateUserSearchQuery(req.query);

      allUsers = await User.searchUsers(req.query.username);
    }

    return res.status(200).json({allUsers});
  } catch (err) {
    return next(err);
  }
});

/** PATCH /users/[username] { username, email } => { updatedUser: {username, email} }
 * 
 *  Endpoint where a logged in user can update their information. 
 * 
 *  CONSTRAINTS:
 *  - req.body must include AT LEAST one attribute: Username or email.
 *  - Can't have attributes other than username and email.
 *  - Updated username must be between 5-30 characters.
 *  - Updated email has to be proper email format.
 * 
 *  Returns newly updated username and email in updatedUser object.
 *
 * Authorization required: logged in and username must match.
 **/

router.patch("/:username", ensureLoggedIn, ensureIsCorrectUser, async function (req, res, next) {
  try {
    const inputValidator = jsonschema.validate(req.body, userUpdateSchema);
    if (!inputValidator.valid) {
      const inputErrors = inputValidator.errors.map(e => e.stack);
      throw new BadRequestError(inputErrors);
    }

    const user = await User.updateUser(req.params.username, req.body);
    return res.status(200).json({ updatedUser: user });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/recipes => {allUserRecipes: [{id, name, description, imageUrl, createdAt}, ...]}
 * 
 * Endpoint that allows retrieval of basic detais such as name and description of all recipes created by a specific user.
 * 
 * Authorization required: Logged in.
 */
router.get("/:username/recipes", ensureLoggedIn, async function (req, res, next) {
  try {
    const allUserRecipes = await User.getRecipesFromUser(req.params.username);
    return res.status(200).json({allUserRecipes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/remixes => {allUserRemixes: [{id, name, description, originalRecipe, imageUrl, createdAt}, ...]}
 * 
 * Endpoint that allows retrieval of basic detais such as name and description, and original recipe name of all remixes created by a specific user.
 * 
 * Authorization required: Logged in.
 */
router.get("/:username/remixes", ensureLoggedIn, async function (req, res, next) {
  try {
    const allUserRemixes = await User.getRemixesFromUser(req.params.username);
    return res.status(200).json({allUserRemixes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/favorites/recipes => {allUserFavoriteRecipes: [{id, name, description, imageUrl}, ...] }
 * 
 * Endpoint that allows retrieval of a specific user's favorite recipes. Gives basic info such as recipe id, name, description, and image.
 * 
 * Authorization required: Logged in. NOTE that other logged in users are allowed to see a specific user's favorite recipes.
 */
router.get("/:username/favorites/recipes", ensureLoggedIn, async function (req, res, next) {
  try {
    const allUserFavoriteRecipes = await User.getUsersFavoriteRecipes(req.params.username);
    return res.status(200).json({allUserFavoriteRecipes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/favorites/remixes => {allUserFavoriteRemixes: [{id, name, description, originalRecipe, imageUrl}, ...] }
 * 
 * Endpoint that allows retrieval of a specific user's favorite remixes. Gives basic info.
 * 
 * Authorization required: Logged in. NOTE that other logged in users are allowed to see a specific user's favorite remixes.
 */
router.get("/:username/favorites/remixes", ensureLoggedIn, async function (req, res, next) {
  try {
    const allUserFavoriteRemixes = await User.getUsersFavoriteRemixes(req.params.username);
    return res.status(200).json({allUserFavoriteRemixes});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username => { userDetails: {username, email, recipes: [ {id, name, description, imageUrl}, ... ], remixes: [ {id, name, description, originalRecipe, imageUrl}, ... ] } }
 * 
 * Endpoint for fetching detailed information about a specific user, fetches all information that will be displayed on the user's profile page.
 * 
 * Authorization required: Logged in. NOTE that other logged in users are allowed to see any user's profile page.
 */
router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const userDetails = await User.getUsersDetailedInfo(req.params.username);
    return res.status(200).json({userDetails});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/reviews/recipes => { userRecipeReviews: [ {recipeId, recipeName, title, content, createdAt}, ... ] }
 * 
 * Endpoint for fetching information on all original recipe reviews by a specific user, as well as the name and id of the recipe of each review is on.
 * 
 * Authorization required: Logged in. NOTE that other logged in users are allowed to see any user's list of recipe reviews.
 */
router.get("/:username/reviews/recipes", ensureLoggedIn, async function (req, res, next) {
  try {
    const userRecipeReviews = await User.getUsersRecipeReviews(req.params.username);
    return res.status(200).json({userRecipeReviews});
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /users/:username/reviews/remixes => { userRemixReviews: [ {remixId, remixName, title, content, createdAt}, ... ] }
 * 
 * Endpoint for fetching information on all remix reviews by a specific user, as well as the name and id of the remix of each review is on.
 * 
 * Authorization required: Logged in. NOTE that other logged in users are allowed to see any user's list of remix reviews.
 */
router.get("/:username/reviews/remixes", ensureLoggedIn, async function (req, res, next) {
  try {
    const userRemixReviews = await User.getUsersRemixReviews(req.params.username);
    return res.status(200).json({userRemixReviews});
  } catch (err) {
    return next(err);
  }
});

/** 
 * POST /users/favorites/recipes/:recipeId => { Success message if successful. }
 * 
 * Adds the recipe with id of recipeId to the currently logged in user's list of favorite recipes.
 * 
 * Authorization required: Logged in.
 */
router.post("/favorites/recipes/:recipeId", ensureLoggedIn, async function (req, res, next) {
  try {
    const loggedInUsername = res.locals.user.username;
    await User.addRecipeToFavorites(loggedInUsername, req.params.recipeId);
    return res.status(201).json({result: `Successfully added recipe with id of ${req.params.recipeId} to ${loggedInUsername}'s favorite recipes.`});
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /users/favorites/recipes/:recipeId => { Success message if successful. }
 * 
 * Removes the recipe with id of recipeId from currently logged in user's list of favorite recipes.
 * 
 * Authorization required: Logged in.
 */
router.delete("/favorites/recipes/:recipeId", ensureLoggedIn, async function (req, res, next) {
  try {
    const loggedInUsername = res.locals.user.username;
    await User.removeRecipeFromFavorites(loggedInUsername, req.params.recipeId);
    return res.json({result: `Successfully deleted recipe with id of ${req.params.recipeId} from ${loggedInUsername}'s favorite recipes.`});
  } catch (err) {
    return next(err);
  }
});

/** 
 * POST /users/favorites/remixes/:remixId => { Success message if successful. }
 * 
 * Adds the remix with id of remixId to the currently logged in user's list of favorite remixes.
 * 
 * Authorization required: Logged in.
 */
router.post("/favorites/remixes/:remixId", ensureLoggedIn, async function (req, res, next) {
  try {
    const loggedInUsername = res.locals.user.username;
    await User.addRemixToFavorites(loggedInUsername, req.params.remixId);
    return res.status(201).json({result: `Successfully added remix with id of ${req.params.remixId} to ${loggedInUsername}'s favorite remixes.`});
  } catch (err) {
    return next(err);
  }
});

/** 
 * DELETE /users/favorites/remixes/:remixId => { Success message if successful. }
 * 
 * Removes the remix with id of remixId from currently logged in user's list of favorite remixes.
 * 
 * Authorization required: Logged in.
 */
router.delete("/favorites/remixes/:remixId", ensureLoggedIn, async function (req, res, next) {
  try {
    const loggedInUsername = res.locals.user.username;
    await User.removeRemixFromFavorites(loggedInUsername, req.params.remixId);
    return res.json({result: `Successfully deleted remix with id of ${req.params.remixId} from ${loggedInUsername}'s favorite remixes.`});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;