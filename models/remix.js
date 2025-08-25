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
   *  Returns {id, reviewAuthor (username of user who created the review), title, content, createdAt} for each remix review.
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
      `SELECT rev.id, users.username AS "reviewAuthor", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM remix_reviews rev
       JOIN users ON rev.user_id = users.id
       WHERE rev.remix_id = $1
       ORDER BY rev.created_at DESC, rev.title` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return allReviews.rows;
  }

  /**   Returns detailed information of the remix with id of remixId in the database.
   *  Returns {id, remixAuthor (username of user who created the recipe), purpose, name, description, originalRecipe (name of original recipe), ingredients, directions, cookingTime, servings, imageUrl, createdAt, reviews (array of review detail objects)} for each remix.
   * 
   *  Throws a 404 NotFoundError if the remix with id of remixId was not found in the database.
   */
  static async getRemixDetails(remixId, limit = 0) {
    //first check to make sure the remix exists in database.
    const remix = await db.query(`SELECT name FROM remixes WHERE id = $1`, [remixId]);
    if (remix.rows.length == 0) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    const remixResult = await db.query(
      `SELECT rem.id, users.username AS "remixAuthor", rem.purpose, rem.name, rem.description, rec.name AS "originalRecipe", 
        rem.ingredients, rem.directions, rem.cooking_time AS "cookingTime", rem.servings, rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
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
   *  Returns {name, description, purpose, ingredients, directions, cookingTime, servings, imageUrl} for the newly created remix.
   * 
   *  CONSTRAINTS:
   *  Name of the remix must be between 1-100 characters long.
   *  Description of the remix must be between 1-255 characters long.
   *  Purpose of creating the remix must be at least 10 characters long.
   *  Ingredients and directions cannot be blank.
   *  Cooking time and servings must be >= 0.
   *  Throws a BadRequestError if any of the above constraints are violated.
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

    //Inconvenience about node-pg: DEFAULT keyword can't be passed as a parameter in the parametrized query, it must be part of the string itself,
    //which means I'll need to type out the query twice.
    let newRemixDetails;
    if (imageUrl) {
      newRemixDetails = await db.query(
        `INSERT INTO remixes (user_id, recipe_id, name, description, purpose, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING name, description, purpose, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl"`,
        [userId, originalRecipeId, name, description, purpose, ingredients, directions, cookingTime, servings, imageUrl]
      );
    } else {
      newRemixDetails = await db.query(
        `INSERT INTO remixes (user_id, recipe_id, name, description, purpose, ingredients, directions, cooking_time, servings, image_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, DEFAULT)
        RETURNING name, description, purpose, ingredients, directions, cooking_time AS "cookingTime", servings, image_url AS "imageUrl"`,
        [userId, originalRecipeId, name, description, purpose, ingredients, directions, cookingTime, servings]
      );
    }

    return newRemixDetails.rows[0];
  }
}

module.exports = Remix;