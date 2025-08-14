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
      `SELECT rem.id, rem.name, rem.description, rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
       FROM recipes rec
       JOIN remixes rem ON rem.recipe_id = rec.id
       WHERE rec.id = $1
       ORDER BY rem.created_at DESC, rem.name`,
       [recipeId]
    );

    return allRemixes.rows;
  }

  /** Returns all the reviews for the recipe with id of recipeId, or the n most recent ones if a limit n is supplied.
   *  Reviews will be sorted by newest first, if multiple reviews were created at the same time, they'll be sorted by review title in alphabetical order.
   * 
   *  Returns {id, reviewAuthor (username of user who created the review), title, content, createdAt} for each recipe review.
   * 
   *  Throws a 404 NotFoundError if the recipe with id of recipeId was not found in the database.
   */
  static async getRecipeReviews(recipeId, limit = 0) {
    //first check to make sure recipe is in database.
    const recipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (recipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [recipeId, limit] : [recipeId];

    const allReviews = await db.query(
      `SELECT rev.id, users.username AS "reviewAuthor", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM recipe_reviews rev
       JOIN users ON rev.user_id = users.id
       WHERE rev.recipe_id = $1
       ORDER BY rev.created_at DESC, rev.title` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return allReviews.rows;
  }

  /** Returns detailed information of a recipe with the id of recipeId. 
   *  Returns {id, recipeAuthor (username of user who created the recipe), name, description, ingredients, directions, cooking_time, servings, image_url, created_at} for each recipe.
   * 
   *  Throws a 404 NotFoundError if the recipe with id of recipeId was not found in the database.
   */
  static async getRecipeDetails(recipeId, limit = 0) {
    //first check to make sure recipe is in database.
    const recipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (recipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    const recipeResult = await db.query(
      `SELECT rec.id, users.username AS "recipeAuthor", rec.name, rec.description, rec.ingredients, rec.directions, 
       rec.cooking_time AS "cookingTime", rec.servings, rec.image_url AS "imageUrl", rec.created_at AS "createdAt"
       FROM recipes rec
       JOIN users ON rec.user_id = users.id
       WHERE rec.id = $1`,
       [recipeId]
    );

    const recipeDetails = recipeResult.rows[0];

    //add remixes
    const recipeRemixes = await Recipe.getRemixes(recipeId);
    recipeDetails.remixes = recipeRemixes;

    //add reviews
    const recipeReviews = await Recipe.getRecipeReviews(recipeId, limit);
    recipeDetails.reviews = recipeReviews;

    return recipeDetails;
  }
}

module.exports = Recipe;