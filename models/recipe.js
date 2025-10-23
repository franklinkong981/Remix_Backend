/** This is the file for the recipe model and contains operations regarding manipulating the recipe data found in the Remix database.
 * Operations include fetching information on all recipes, adding a recipe, updating a recipe, and fetching detailed information 
 * on a specific recipe such as ingredients, directions, and reviews.
 * 
 */

const db = require("../db.js");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");

const COOKING_TIME_DEFAULT = 0;
const SERVINGS_DEFAULT = 0;
const IMAGE_URL_DEFAULT = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

class Recipe {
  /** Fetches basic information of all recipes (NOT remixes) in the database and returns them by recipe name in alphabetical order.
   *  Returns {id, name, recipeAuthor, description, imageUrl, createdAt } for each recipe.
   */
  static async getAllRecipesBasicInfo() {
    const allRecipesBasicInfo = await db.query(
      `SELECT rec.id, rec.name, users.username AS "recipeAuthor", rec.description, rec.image_url AS "imageUrl", rec.created_at AS "createdAt"
       FROM recipes rec
       JOIN users ON rec.user_id = users.id
       ORDER BY name`
    );
    
    return allRecipesBasicInfo.rows;
  }

  /** Searches for recipes in the database whose recipe names contain the search term and returns all matching recipes in alphabetical order.
   *  Returns all recipes if the search term is undefined or empty.
   * 
   *  Returns {id, name, recipeAuthor, description, imageUrl, createdAt} for each recipe.
   */
  static async searchRecipes(searchTerm) {
    let searchResults;

    if (searchTerm) {
      let matchingRecipes = await db.query(
      `SELECT rec.id, rec.name, users.username AS "recipeAuthor", rec.description, rec.image_url AS "imageUrl", rec.created_at AS "createdAt"
       FROM recipes rec
       JOIN users ON rec.user_id = users.id
       WHERE name ILIKE $1
       ORDER BY name`,
      [`%${searchTerm}%`]
      );
      searchResults = matchingRecipes.rows;
    } else {
      searchResults = await Recipe.getAllRecipesBasicInfo();
    } 

    //even if searchResults is empty, don't throw error, just return nothing.
    return searchResults;
  }

  /** Returns all remixes for the recipe with id of recipeId and sorts them by most recent first.
   *  Returns {id, name, description, remixAuthor (username of user who created the remix), image_url, created_at} for each remix.
   * 
   *  If a limit n is supplied, returns the n first remixes listed.
   * 
   *  Throws a NotFoundError if the recipe with id of recipeId isn't found in the database. 
   */
  static async getRemixes(recipeId, limit=0) {
    //first check to make sure recipe is in database.
    const recipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (recipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [recipeId, limit] : [recipeId];

    const allRemixes = await db.query(
      `SELECT rem.id, rem.name, users.username AS "remixAuthor", rem.description, rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
       FROM recipes rec
       JOIN remixes rem ON rem.recipe_id = rec.id
       JOIN users ON rem.user_id = users.id
       WHERE rec.id = $1
       ORDER BY rem.created_at DESC, rem.name` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return allRemixes.rows;
  }

  /** Returns all the reviews for the recipe with id of recipeId, or the n most recent ones if a limit n is supplied.
   *  Reviews will be sorted by newest first, if multiple reviews were created at the same time, they'll be sorted by review title in alphabetical order.
   * 
   *  If a limit n is supplied, returns the first n reviews listed.
   * 
   *  Returns {id, reviewAuthor (username of user who created the review), recipeId, recipeName, title, content, createdAt} for each recipe review.
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
      `SELECT rev.id, users.username AS "reviewAuthor", rec.id AS "recipeId", rec.name AS "recipeName", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM recipe_reviews rev
       JOIN users ON rev.user_id = users.id
       JOIN recipes rec ON rev.recipe_id = rec.id
       WHERE rev.recipe_id = $1
       ORDER BY rev.created_at DESC, rev.title` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return allReviews.rows;
  }

  /** Returns detailed information of a recipe with the id of recipeId. 
   *  Returns {id, recipeAuthor (username of user who created the recipe), name, description, ingredients, directions, cookingTime, servings, imageUrl, createdAt, 
   *  (remixLimit most recent) remixes: [ {id, name, description, imageUrl, createdAt}, ... ], (reviewsLimit most recent) reviews: [ {id, reviewAuthor, title, content, createdAt}, ... ], imageUrl, createdAt}, ...] } for each recipe.
   *  
   *  Throws a 404 NotFoundError if the recipe with id of recipeId was not found in the database.
   */
  static async getRecipeDetails(recipeId, remixLimit = 0, reviewsLimit = 0) {
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
    const recipeRemixes = await Recipe.getRemixes(recipeId, remixLimit);
    recipeDetails.remixes = recipeRemixes;

    //add reviews
    const recipeReviews = await Recipe.getRecipeReviews(recipeId, reviewsLimit);
    recipeDetails.reviews = recipeReviews;

    return recipeDetails;
  }

  /** Adds a new recipe to the database and returns information about it.
   *  Returns {id, name, description, ingredients, directions, cookingTime, servings, imageUrl, createdAt} for the newly created recipe.
   *  
   *  CONSTRAINTS:
   *  Name of the recipe must be between 1-100 characters long.
   *  Description of the recipe must be between 1-255 characters long.
   *  Ingredients and directions cannot be blank.
   *  Cooking time and servings must be >= 0.
   *  Throws a BadRequestError if any of the above constraints are violated.
   */
  static async addRecipe(userId, {name, description, ingredients, directions, cookingTime = COOKING_TIME_DEFAULT, servings = SERVINGS_DEFAULT, imageUrl = IMAGE_URL_DEFAULT}) {
    // first make sure the inputs all follow the proper format. name and description must be of a certain length, cookingTime and servings should already
    // be integers that are both >= 0. Ingredients and directions cannot be blank.
    if (name.length > 100 || name.length < 1) throw new BadRequestError("The name of the recipe must be between 1 and 100 characters long.");
    if (description.length > 255 || description.length < 1) throw new BadRequestError("The recipe description must be between 1 and 255 characters long.");
    if (ingredients.length < 1) throw new BadRequestError("The ingredients for the recipe cannot be blank.");
    if (directions.length < 1) throw new BadRequestError("The directions for the recipe cannot be blank.");
    if (cookingTime < 0) throw new BadRequestError("The cooking time cannot be negative.");
    if (servings < 0) throw new BadRequestError("The servings cannot be negative.");
    //if image_url is left blank, automatically assign to it the default value.
    if (imageUrl.length < 1) imageUrl = IMAGE_URL_DEFAULT;

    //Inconvenience about node-pg: DEFAULT keyword can't be passed as a parameter in the parametrized query, it must be part of the string itself,
    //which means I'll need to type out the query twice.
    let newRecipeDetails;
    if (imageUrl) {
      newRecipeDetails = await db.query(
        `INSERT INTO recipes (user_id, name, description, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, name, description, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`,
        [userId, name, description, ingredients, directions, cookingTime, servings, imageUrl]
      );
    } else {
      newRecipeDetails = await db.query(
        `INSERT INTO recipes (user_id, name, description, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, DEFAULT)
        RETURNING id, name, description, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`,
        [userId, name, description, ingredients, directions, cookingTime, servings]
      );
    }

    return newRecipeDetails.rows[0];
  }

  /**
   * Fetches the username of the user who created the recipe with the id of recipeId. Returns only the username.
   * 
   * Throws a NotFoundError if the recipe with id of recipeId isn't found in the database.
   */
  static async getRecipeAuthor(recipeId) {
    //first check to make sure recipe with id of recipeId is in the database.
    const recipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (recipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    let recipeAuthor = await db.query(`SELECT u.username FROM recipes JOIN users u ON recipes.user_id = u.id WHERE recipes.id = $1`, [recipeId]);
    return recipeAuthor.rows[0];
  }

  /** Partially updates a recipe with a specific recipeId in the database according to the attributes found in the updateData object.
   *  Values in updateData are checked to ensure the same constraints in addRecipe method above are met, throws
   *  BadRequestError if any constraints are violated.
   * 
   *  Returns {id, name, description, ingredients, directions, cookingTime, servings, imageUrl, createdAt} for the updated recipe.
   *  
   *  Throws a BadRequestError if the recipe with id of recipeId isn't found in the database.
   */
  static async updateRecipe(recipeId, updateData) {
    //check to make sure updateData only has the keys of the recipe attributes that are allowed to be updated.
    const updateableProperties = ["name", "description", "ingredients", "directions", "cookingTime", "servings", "imageUrl"];
    for (let key of Object.keys(updateData)) {
      if (!(updateableProperties.includes(key))) throw new BadRequestError("You can only update the following properties of a recipe: Name, description, ingredients, directions, cookingTime, servings, and imageUrl."); 
    }

    //make sure all values in updateData still meet the database requirements.
    if (updateData.hasOwnProperty("name") && (updateData.name.length > 100 || updateData.name.length < 1)) throw new BadRequestError("The updated name of the recipe must be between 1 and 100 characters long.");
    if (updateData.hasOwnProperty("description") && (updateData.description.length > 255 || updateData.description.length < 1)) throw new BadRequestError("The updated recipe description must be between 1 and 255 characters long.");
    if (updateData.hasOwnProperty("ingredients") && updateData.ingredients.length < 1) throw new BadRequestError("The updated ingredients for the recipe cannot be blank.");
    if (updateData.hasOwnProperty("directions") && updateData.directions.length < 1) throw new BadRequestError("The updated directions for the recipe cannot be blank.");
    if (updateData.hasOwnProperty("cookingTime") && updateData.cookingTime < 0) throw new BadRequestError("The updated cooking time cannot be negative.");
    if (updateData.hasOwnProperty("servings") && updateData.servings < 0) throw new BadRequestError("The updated servings cannot be negative.");
    //if image_url is left blank, automatically assign to it the default value.
    if (updateData.hasOwnProperty("imageUrl") && updateData.imageUrl.length < 1) updateData.imageUrl = IMAGE_URL_DEFAULT;

    const {setCols, values} = sqlForPartialUpdate(updateData, {"cookingTime": "cooking_time", "imageUrl": "image_url"});
    const recipeIdParameterIndex = "$" + (values.length + 1);

    const sqlUpdateQuery = `UPDATE recipes
                            SET ${setCols}
                            WHERE id = ${recipeIdParameterIndex}
                            RETURNING id, name, description, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`;
    const updateResult = await db.query(sqlUpdateQuery, [...values, recipeId]);
    const updatedRecipe = updateResult.rows[0];

    if (!updatedRecipe) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    return updatedRecipe;
  }

  /** Returns detailed information about a specific recipe review in the database.
   * If successful, returns the information about the recipe review in an object: {id, reviewAuthor, title, content, createdAt}
   * 
   * Throws a NotFoundError if the recipe review with id of reviewId was not found in the database.
   */
  static async getRecipeReview(reviewId) {
    const searchReviewRes = await db.query(
      `SELECT rev.id, users.username AS "reviewAuthor", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM recipe_reviews rev
       JOIN users ON rev.user_id = users.id
       WHERE rev.id = $1`,
       [reviewId]
    );

    if (searchReviewRes.rows.length === 0) throw new NotFoundError(`The recipe review with id of ${reviewId} was not found in the database.`);

    return searchReviewRes.rows[0];
  }

  /** Adds a review for the recipe with id of recipeId made by user with id of userId.
   *  Review must have title and content, both of which must be non-empty strings, otherwise a BadRequestError is thrown.
   * 
   *  If successful, returns new information about the review: {reviewId, userId, recipeId, title, content}
   * 
   *  Throws a NotFoundError if the user with id of userId or recipe with id of recipeId are not found in the database.
   */
  static async addReview(userId, recipeId, {title, content}) {
    if (title.length < 1 || title.length > 100) throw new BadRequestError("The title of the review must be between 1-100 characters long.");
    if (content.length < 1) throw new BadRequestError("The content of the review cannot be blank.");

    //check to make sure user exists.
    const fetchUser = await db.query(`SELECT username FROM users WHERE id = $1`, [userId]);
    if (fetchUser.rows.length == 0) throw new NotFoundError(`The user with id of ${userId} was not found in the database.`);
    const reviewAuthor = fetchUser.rows[0].username;

    //now check to make sure recipe exists.
    const fetchRecipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [recipeId]);
    if (fetchRecipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);
    const recipeName = fetchRecipe.rows[0].name;

    //now that inputs are valid and user/recipe exists, review can be added.
    const addReviewResult = await db.query(
      `INSERT INTO recipe_reviews (user_id, recipe_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id AS "reviewId", user_id AS "userId", recipe_id AS "recipeId", title, content`,
       [userId, recipeId, title, content]
    );

    let newReviewDetails = addReviewResult.rows[0];
    newReviewDetails = {...newReviewDetails, reviewAuthor, recipeName};
    return newReviewDetails;
  }

  /**
   * Fetches the username of the user who created the recipe review with the id of reviewId. Returns only the username.
   * 
   * Throws a NotFoundError if the recipe review with id of reviewId isn't found in the database.
   */
  static async getReviewAuthor(reviewId) {
    //first check to make sure recipe review with id of recviewId is in the database.
    const recipeReview = await db.query(`SELECT title FROM recipe_reviews WHERE id = $1`, [reviewId]);
    if (recipeReview.rows.length == 0) throw new NotFoundError(`The recipe review with id of ${reviewId} was not found in the database.`);

    let reviewAuthor = await db.query(`SELECT u.username FROM recipe_reviews JOIN users u ON recipe_reviews.user_id = u.id WHERE recipe_reviews.id = $1`, [reviewId]);
    return reviewAuthor.rows[0];
  }

  /** Partially updates a review with the id of reviewId in the database according to the attributes found in the updateData object.
   *  Values in updateData are checked to ensure the same constraints in addReview method above are met, throws
   *  BadRequestError if any constraints are violated.
   * 
   *  Returns {reviewId, userId, recipeId, title, content} for the updated recipe review.
   *  
   *  Throws a BadRequestError if the review of reviewId isn't found in the database.
   */
  static async updateReview(reviewId, updateData) {
    //check to make sure updateData only has the keys of title and/or content, the attributes of the review that are allowed to be updated.
    const updateableProperties = ["title", "content"];
    for (let key of Object.keys(updateData)) {
      if (!(updateableProperties.includes(key))) throw new BadRequestError("You can only update the following properties of a review: Title, content."); 
    }

    //make sure all values in updateData still meet the database requirements.
    if (updateData.hasOwnProperty("title") && (updateData.title.length < 1)) throw new BadRequestError("The updated title of the review cannot be blank.");
    if (updateData.hasOwnProperty("content") && (updateData.content.length < 1)) throw new BadRequestError("The updated content of the review cannot be blank.");

    const {setCols, values} = sqlForPartialUpdate(updateData);
    const reviewIdParameterIndex = "$" + (values.length + 1);

    const sqlUpdateQuery = `UPDATE recipe_reviews
                            SET ${setCols}
                            WHERE id = ${reviewIdParameterIndex}
                            RETURNING id AS "reviewId", user_id AS "userId", recipe_id AS "recipeId", title, content`;
    const updateResult = await db.query(sqlUpdateQuery, [...values, reviewId]);
    const updatedReview = updateResult.rows[0];

    if (!updatedReview) throw new NotFoundError(`The recipe review of id ${reviewId} was not found in the database.`);

    return updatedReview;
  }
}

module.exports = Recipe;