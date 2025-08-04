/* This is the file that contains the User model class and contains methods such as registering a new user (adding new user information to the database),
authenticating a user, fetching information on all users, updating a user, deleting a user, fetching a user's recipe reviews, etc. 
*/

const db = require("../db.js");
const bcrypt = require("bcrypt");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  
  /** Retrieves basic account information for all users.
   *
   * Returns [{ username, email }, ...]
   **/
  static async getAllUsers() {
    const allUsers = await db.query(
      `SELECT username, email
      FROM users
      ORDER BY username`,
    );

    return allUsers.rows;
  }
}

module.exports = User;