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
}

module.exports = Remix;