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
   *  Returns {id, name, description, imageUrl, createdAt } for each recipe.
   */
  static async getAllRecipesBasicInfo() {
    const allRecipesBasicInfo = await db.query(
      `SELECT id, name, description, image_url AS "imageUrl", created_at AS "createdAt"
       FROM recipes
       ORDER BY name`
    );
    
    return allRecipesBasicInfo.rows;
  }

  /** Searches for recipes in the database whose recipe names contain the search term and returns all matching recipes in alphabetical order.
   *  Returns all recipes if the search term is undefined or empty.
   * 
   *  Returns {id, name, description, imageUrl, createdAt} for each recipe.
   */
  static async searchRecipes(searchTerm) {
    let matchingRecipes;

    if (searchTerm) {
      matchingRecipes = await db.query(
      `SELECT id, name, description, image_url AS "imageUrl", created_at AS "createdAt"
       FROM recipes
       WHERE name ILIKE $1
       ORDER BY name`,
      [`%${searchTerm}%`]
      );
    } else {
      matchingRecipes = await db.query(
        `SELECT id, name, description, image_url AS "imageUrl", created_at AS "createdAt"
         FROM recipes
         ORDER BY name`
      );
    } 

    //even if searchResults is empty, don't throw error, just return nothing.
    const searchResults = matchingRecipes.rows;
    return searchResults;
  }

  /** Returns all remixes for the recipe with id of recipeId and sorts them by most recent first.
   *  Returns {id, name, description, original recipe name, image_url, created_at} for each remix.
   * 
   *  Throws a NotFoundError if the recipe with id of recipeId isn't found in the database. 
   */
  static async getRemixes(recipeId) {
    //first check to make sure recipe is in database.
    const recipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (recipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    const allRemixes = await db.query(
      `SELECT rem.id, rem.name, rem.description, rec.name AS "originalRecipe", rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
       FROM recipes rec
       JOIN remixes rem ON rem.recipe_id = rec.id
       WHERE rec.id = $1
       ORDER BY rem.created_at DESC, rem.name`,
       [recipeId]
    );

    return allRemixes.rows;
  }
}

module.exports = Recipe;