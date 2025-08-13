/** This is the file for the recipe model and contains operations regarding manipulating the recipe data found in the Remix database.
 * Operations include fetching information on all recipes, adding a recipe, updating a recipe, and fetching detailed information 
 * on a specific recipe such as ingredients, directions, and reviews.
 * 
 */

const db = require("../db.js");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");

class Recipe {
  /** Fetches basic information of all recipes (NOT remixes) in the database and returns them by recipe name in alphabetical order.
   *  Returns {name, description, imageUrl, createdAt } for each recipe.
   */
  static async getAllRecipesBasicInfo() {
    const allRecipesBasicInfo = await db.query(
      `SELECT name, description, image_url AS "imageUrl", created_at AS "createdAt"
       FROM recipes
       ORDER BY name`
    );
    
    return allRecipesBasicInfo.rows;
  }

  /** Searches for users in the database whose usernames contain the search term and returns all matching usernames in alphabetical order.
   *  Returns all usernames if the search term is undefined or empty.
   */
  static async searchRecipes(searchTerm) {
    let matchingRecipes;

    if (searchTerm) {
      matchingRecipes = await db.query(
      `SELECT name, description, image_url AS "imageUrl", created_at AS "createdAt"
       FROM recipes
       WHERE name ILIKE $1
       ORDER BY name`,
      [`%${searchTerm}%`]
      );
    } else {
      matchingRecipes = await db.query(
        `SELECT name, description, image_url AS "imageUrl", created_at AS "createdAt"
         FROM recipes
         ORDER BY name`
      );
    } 

    //even if searchResults is empty, don't throw error, just return nothing.
    const searchResults = matchingRecipes.rows;
    return searchResults;
  }
}

module.exports = Recipe;