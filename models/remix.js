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
  
}

module.exports = Remix;