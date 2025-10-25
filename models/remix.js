/** This is the file containing the Remix model and its methods that can be used to perform operations on and manipulate
 *  the part of the database that stores recipe remixes.
 *  Methods include getting details on a specific remix, adding a remix review, etc. 
 * 
 */

const db = require("../db.js");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");

const COOKING_TIME_DEFAULT = 0;
const SERVINGS_DEFAULT = 0;
const IMAGE_URL_DEFAULT = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

class Remix {
  /** Returns all the reviews for the remix with id of remixId, or the n most recent ones if a limit n is supplied.
   *  Reviews will be sorted by newest first, if multiple reviews were created at the same time, they'll be sorted by review title in alphabetical order.
   * 
   *  Returns {id, remixId, remixName reviewAuthor (username of user who created the review), title, content, createdAt} for each remix review.
   * 
   *  Throws a 404 NotFoundError if the remix with id of remixId was not found in the database.
   */
  static async getRemixReviews(remixId, limit = 0) {
    //first check to make sure the remix is in the database.
    const remix = await db.query(`SELECT name FROM remixes WHERE id = $1`, [remixId]);
    if (remix.rows.length == 0) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [remixId, limit] : [remixId];

    const allReviews = await db.query(
      `SELECT rev.id, rem.id AS "remixId", rem.name AS "remixName", users.username AS "reviewAuthor", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM remix_reviews rev
       JOIN users ON rev.user_id = users.id
       JOIN remixes rem ON rev.remix_id = rem.id
       WHERE rev.remix_id = $1
       ORDER BY rev.created_at DESC, rev.title` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return allReviews.rows;
  }

  /** Returns detailed information of the remix with id of remixId in the database.
   *  Returns {id, remixAuthor (username of user who created the recipe), purpose, name, description, originalRecipeId (id of original recipe), 
   *  originalRecipe (name of original recipe), ingredients, directions, cookingTime, servings, imageUrl, createdAt, reviews (array of review detail objects)} for each remix.
   * 
   *  Throws a 404 NotFoundError if the remix with id of remixId was not found in the database.
   */
  static async getRemixDetails(remixId, limit = 0) {
    //first check to make sure the remix exists in database.
    const remix = await db.query(`SELECT name FROM remixes WHERE id = $1`, [remixId]);
    if (remix.rows.length == 0) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    const remixResult = await db.query(
      `SELECT rem.id, users.username AS "remixAuthor", rem.purpose, rem.name, rem.description, rem.recipe_id AS "originalRecipeId", rec.name AS "originalRecipe", rem.ingredients, rem.directions, rem.cooking_time AS "cookingTime", rem.servings, rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
        FROM remixes rem
        JOIN users ON rem.user_id = users.id
        JOIN recipes rec ON rem.recipe_id = rec.id
        WHERE rem.id = $1`,
        [remixId]
    );

    const remixDetails = remixResult.rows[0];

    //add remix reviews
    const remixReviews = await Remix.getRemixReviews(remixId, limit);
    remixDetails.reviews = remixReviews;

    return remixDetails;
  }

  /** Adds a new remix for the recipe with id of recipeId by user with id of userId to the database and returns information about it.
   *  Returns {id, name, description, originalRecipe, purpose, ingredients, directions, cookingTime, servings, imageUrl, createdAt} for the newly created remix.
   * 
   *  CONSTRAINTS:
   *  Name of the remix must be between 1-100 characters long.
   *  Description of the remix must be between 1-255 characters long.
   *  Purpose of creating the remix must be at least 10 characters long.
   *  Ingredients and directions cannot be blank.
   *  Cooking time and servings must be >= 0.
   *  Throws a BadRequestError if any of the above constraints are violated.
   * 
   *  Also Throws NotFoundError if originalRecipeId doesn't exist in the database.
   */
  static async addRemix(userId, originalRecipeId, {name, description, purpose, ingredients, directions, cookingTime = COOKING_TIME_DEFAULT, servings = SERVINGS_DEFAULT, imageUrl = IMAGE_URL_DEFAULT}) {
    // first make sure the inputs all follow the proper format. name and description must be of a certain length, cookingTime and servings should already
    // be integers that are both >= 0. Ingredients and directions cannot be blank.
    if (name.length > 100 || name.length < 1) throw new BadRequestError("The name of the remix must be between 1 and 100 characters long.");
    if (description.length > 255 || description.length < 1) throw new BadRequestError("The remix description must be between 1 and 255 characters long.");
    if (purpose.length < 1) throw new BadRequestError("The remix purpose must be at least 10 characters long.");
    if (ingredients.length < 1) throw new BadRequestError("The ingredients for the remix cannot be blank.");
    if (directions.length < 1) throw new BadRequestError("The directions for the remix cannot be blank.");
    if (cookingTime < 0) throw new BadRequestError("The cooking time cannot be negative.");
    if (servings < 0) throw new BadRequestError("The servings cannot be negative.");
    //if image_url is left blank, automatically assign to it the default value.
    if (imageUrl.length < 1) imageUrl = IMAGE_URL_DEFAULT;

    const originalRecipe = await db.query(`SELECT name FROM recipes WHERE id = $1`, [originalRecipeId]);
    if (originalRecipe.rows.length == 0) throw new NotFoundError(`The recipe with id of ${originalRecipeId} was not found in the database.`);

    //Inconvenience about node-pg: DEFAULT keyword can't be passed as a parameter in the parametrized query, it must be part of the string itself,
    //which means I'll need to type out the query twice.
    let newRemixDetails;
    if (imageUrl) {
      newRemixDetails = await db.query(
        `INSERT INTO remixes (user_id, recipe_id, name, description, purpose, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, name, description, purpose, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`,
        [userId, originalRecipeId, name, description, purpose, ingredients, directions, cookingTime, servings, imageUrl]
      );
    } else {
      newRemixDetails = await db.query(
        `INSERT INTO remixes (user_id, recipe_id, name, description, purpose, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, DEFAULT)
        RETURNING id, name, description, purpose, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`,
        [userId, originalRecipeId, name, description, purpose, ingredients, directions, cookingTime, servings]
      );
    }

    const newRemix = newRemixDetails.rows[0];

    return {...newRemix, originalRecipe};
  }

  /**
   * Fetches the username of the user who created the remix with the id of remixId. Returns only the username.
   * 
   * Throws a NotFoundError if the remix with id of recipeId isn't found in the database.
   */
  static async getRemixAuthor(remixId) {
    //first check to make sure remix with id of recipeId is in the database.
    const remix = await db.query(`SELECT name FROM remixes WHERE id = $1`, [remixId]);
    if (remix.rows.length == 0) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    let remixAuthor = await db.query(`SELECT u.username FROM remixes JOIN users u ON remixes.user_id = u.id WHERE remixes.id = $1`, [remixId]);
    return remixAuthor.rows[0];
  }

  /** Partially updates a remix with a specific remixId in the database according to the attributes found in the updateData object.
   *  Values in updateData are checked to ensure the same constraints in addRemix method above are met, throws
   *  BadRequestError if any constraints are violated.
   * 
   *  Returns {id, name, description, originalRecipe, purpose, ingredients, directions, cookingTime, servings, imageUrl, createdAt} for the updated recipe.
   *  
   *  Throws a BadRequestError if the remix with id of remixId isn't found in the database.
   */
  static async updateRemix(remixId, updateData) {
    //check to make sure updateData only has the keys of the remix attributes that are allowed to be updated.
    const updateableProperties = ["name", "description", "purpose", "ingredients", "directions", "cookingTime", "servings", "imageUrl"];
    for (let key of Object.keys(updateData)) {
      if (!(updateableProperties.includes(key))) throw new BadRequestError("You can only update the following properties of a remix: Name, description, purpose, ingredients, directions, cookingTime, servings, and imageUrl."); 
    }

    //make sure all values in updateData still meet the database requirements.
    if (updateData.hasOwnProperty("name") && (updateData.name.length > 100 || updateData.name.length < 1)) throw new BadRequestError("The updated name of the remix must be between 1 and 100 characters long.");
    if (updateData.hasOwnProperty("description") && (updateData.description.length > 255 || updateData.description.length < 1)) throw new BadRequestError("The updated remix description must be between 1 and 255 characters long.");
    if (updateData.hasOwnProperty("purpose") && (updateData.purpose.length < 10)) throw new BadRequestError("The updated purpose of the remix must be at least 10 characters long.");
    if (updateData.hasOwnProperty("ingredients") && updateData.ingredients.length < 1) throw new BadRequestError("The updated ingredients for the remix cannot be blank.");
    if (updateData.hasOwnProperty("directions") && updateData.directions.length < 1) throw new BadRequestError("The updated directions for the remix cannot be blank.");
    if (updateData.hasOwnProperty("cookingTime") && updateData.cookingTime < 0) throw new BadRequestError("The updated cooking time cannot be negative.");
    if (updateData.hasOwnProperty("servings") && updateData.servings < 0) throw new BadRequestError("The updated servings cannot be negative.");
    //if image_url is left blank, automatically assign to it the default value.
    if (updateData.hasOwnProperty("imageUrl") && updateData.imageUrl.length < 1) updateData.imageUrl = IMAGE_URL_DEFAULT;

    const {setCols, values} = sqlForPartialUpdate(updateData, {"cookingTime": "cooking_time", "imageUrl": "image_url"});
    const remixIdParameterIndex = "$" + (values.length + 1);

    const sqlUpdateQuery = `UPDATE remixes
                            SET ${setCols}
                            WHERE id = ${remixIdParameterIndex}
                            RETURNING id, name, description, purpose, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl", created_at AS "createdAt"`;
    const updateResult = await db.query(sqlUpdateQuery, [...values, remixId]);
    const updatedRemix = updateResult.rows[0];

    if (!updatedRemix) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    const originalRecipe = await db.query(
      `SELECT rec.name AS "originalRecipe"
      FROM remixes rem
      JOIN recipes rec ON rem.recipe_id = rec.id
      WHERE rem.id = $1`, 
      [remixId]);
    
    const originalRecipeName = originalRecipe.rows[0].originalRecipe;

    return {...updatedRemix, originalRecipe: originalRecipeName};
  }

  /** Returns detailed information about a specific remix review in the database.
   * If successful, returns the information about the remix review in an object: {id, reviewAuthor, title, content, createdAt}
   * 
   * Throws a NotFoundError if the remix review with id of reviewId was not found in the database.
   */
  static async getRemixReview(reviewId) {
    const searchReviewRes = await db.query(
      `SELECT rev.id, users.username AS "reviewAuthor", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM remix_reviews rev
       JOIN users ON rev.user_id = users.id
       WHERE rev.id = $1`,
       [reviewId]
    );

    if (searchReviewRes.rows.length === 0) throw new NotFoundError(`The remix review with id of ${reviewId} was not found in the database.`);

    return searchReviewRes.rows[0];
  }

  /** Adds a review for the remix with id of remixId made by user with id of userId.
   *  Review must have title and content, both of which must be non-empty strings, otherwise a BadRequestError is thrown.
   * 
   *  If successful, returns new information about the review: {reviewId, remixId, remixName, title, content, createdAt}
   * 
   *  Throws a NotFoundError if the user with id of userId or remix with id of remixId are not found in the database.
   */
  static async addReview(userId, remixId, {title, content}) {
    if (title.length < 1 || title.length > 100) throw new BadRequestError("The title of the review must be between 1-100 characters long.");
    if (content.length < 1) throw new BadRequestError("The content of the review cannot be blank.");

    //check to make sure user exists.
    const fetchUser = await db.query(`SELECT username FROM users WHERE id = $1`, [userId]);
    if (fetchUser.rows.length == 0) throw new NotFoundError(`The user with id of ${userId} was not found in the database.`);
    const reviewAuthor = fetchUser.rows[0].username;

    //now check to make sure remix exists.
    const fetchRemix = await db.query(`SELECT name FROM remixes WHERE id = $1`, [remixId]);
    if (fetchRemix.rows.length == 0) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);
    const remixName = fetchRemix.rows[0].name;

    //now that inputs are valid and user/remix exists, review can be added.
    const addReviewResult = await db.query(
      `INSERT INTO remix_reviews (user_id, remix_id, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id AS "reviewId", remix_id AS "remixId", title, content, created_at AS "createdAt"`,
       [userId, remixId, title, content]
    );

    let newReviewDetails = addReviewResult.rows[0];
    newReviewDetails = {...newReviewDetails, remixName};
    return newReviewDetails;
  }

  /**
   * Fetches the username of the user who created the remix review with the id of reviewId. Returns only the username.
   * 
   * Throws a NotFoundError if the remix review with id of reviewId isn't found in the database.
   */
  static async getReviewAuthor(reviewId) {
    //first check to make sure remix review with id of recviewId is in the database.
    const remixReview = await db.query(`SELECT title FROM remix_reviews WHERE id = $1`, [reviewId]);
    if (remixReview.rows.length == 0) throw new NotFoundError(`The remix review with id of ${reviewId} was not found in the database.`);

    let reviewAuthor = await db.query(`SELECT u.username FROM remix_reviews JOIN users u ON remix_reviews.user_id = u.id WHERE remix_reviews.id = $1`, [reviewId]);
    return reviewAuthor.rows[0];
  }

  /** Partially updates a remix review with the id of reviewId in the database according to the attributes found in the updateData object.
   *  Values in updateData are checked to ensure the same constraints in addReview method above are met, throws
   *  BadRequestError if any constraints are violated.
   * 
   *  Returns {reviewId, remixId, remixName, title, content, createdAt} for the updated remix review.
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

    const sqlUpdateQuery = `UPDATE remix_reviews
                            SET ${setCols}
                            WHERE id = ${reviewIdParameterIndex}
                            RETURNING id AS "reviewId", remix_id AS "remixId", title, content, created_at AS "createdAt"`;
    const updateResult = await db.query(sqlUpdateQuery, [...values, reviewId]);
    const updatedReview = updateResult.rows[0];

    if (!updatedReview) throw new NotFoundError(`The remix review of id ${reviewId} was not found in the database.`);

    const reviewRemix = await db.query(
      `SELECT rem.name AS "remixName"
      FROM remix_reviews rev
      JOIN remixes rem ON rev.remix_id = rem.id
      WHERE rev.id = $1`, 
      [reviewId]);
    
    const reviewRemixName = reviewRemix.rows[0].remixName;


    return {...updatedReview, remixName: reviewRemixName};
  }
}

module.exports = Remix;