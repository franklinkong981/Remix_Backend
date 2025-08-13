/** This is the file for the recipe model and contains operations regarding manipulating the recipe data found in the Remix database.
 * Operations include fetching information on all recipes, adding a recipe, updating a recipe, and fetching detailed information 
 * on a specific recipe such as ingredients, directions, and reviews.
 * 
 */

const db = require("../db.js");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");

class Recipe {

}

module.exports = Recipe;