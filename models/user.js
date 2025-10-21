/* This is the file that contains the User model class and contains methods such as registering a new user (adding new user information to the database),
authenticating a user, fetching information on all users, updating a user, deleting a user, fetching a user's recipe reviews, etc. 
*/

const db = require("../db.js");
const bcrypt = require("bcrypt");

const { sqlForPartialUpdate } = require("../helpers/sql.js");
const { NotFoundError, BadRequestError, UnauthorizedError } = require("../errors/errors.js");
const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
  /** Registers the user by adding it as a user to the database.
   * User information supplied must include username, email, and password.
   * Will check if username and email is of the proper length/format, then hash the password using bcrypt before adding the user to the database.
   * 
   * Returns { username, email } for the newly registered user if successful.
   * 
   * Throws a BadRequestError if email, username, and/or password doesn't meet the required length/format.
   * Throws a BadRequestError if the username is a duplicate of a username that already exists in the database.
  */
  static async registerNewUser({username, email, password}) {
    if (username.length < 5 || username.length > 30) {
      throw new BadRequestError("The username must be between 5-30 characters.");
    } else if (!(email.includes("@"))) {
      throw new BadRequestError("The email must have a valid format.");
    } else if (password.length < 8) {
      throw new BadRequestError("The password must be at least 8 characters.");
    }

    //check for duplicate username.
    const duplicate_username = await db.query(`SELECT username FROM users WHERE username = $1`, [username]);
    if (duplicate_username.rows[0]) {
      throw new BadRequestError(`The username ${username} is already taken. Please try another username.`);
    }

    //hash the password before using the new user information to the database.
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const registerResult = await db.query(
      `INSERT INTO users (username, email, hashed_password)
       VALUES ($1, $2, $3)
       RETURNING username, email`,
      [username, email, hashedPassword]
    );

    const newRegisteredUser = registerResult.rows[0];
    return newRegisteredUser;
  }

  /**
   * Authenticate/login a user by first checking to see if the username supplied exists in the database,
   * then comparing the password to the hashed password found in the database.
   * 
   * Upon successful authentication, returns {id, username, email} of the logged in user.
   * 
   * Throws an UnauthorizedError if username isn't found in the database or password doesn't match.
   */
  static async authenticateUser(username, password) {
    //make sure the user with the username exists in the database first.
    const userInDatabase = await db.query(
      `SELECT id, username, email, hashed_password AS password FROM users WHERE username = $1`,
      [username]
    );

    const userToAuthenticate = userInDatabase.rows[0];

    if (userToAuthenticate) {
      //hash inputted password and compare it with hashed password in database.
      const isPasswordValid = await bcrypt.compare(password, userToAuthenticate.password);
      if (isPasswordValid) {
        delete userToAuthenticate.password;
        return userToAuthenticate;
      }
    }

    throw new UnauthorizedError("Your username/password is incorrect. Please try again");
  }
  
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

  /** Retrieves basic account information (username and email) for a supplied username.
   * 
   * Returns {username, email}
   * 
   * Throws NotFoundError if username isn't found in the database.
   */
  static async getUserBasicInfo(username) {
    const user = await db.query(
      `SELECT username, email FROM users WHERE username = $1`,
      [username]
    );

    const userInfo = user.rows[0];
    if (!userInfo) {
      throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    }

    return userInfo;
  }

  /** Searches for users in the database whose usernames contain the search term and returns all matching usernames in alphabetical order.
   *  Returns all usernames if the search term is undefined or empty.
   * 
   *  Returns {username, email} for all matching users or for all users if searchTerm is empty.
   */
  static async searchUsers(searchTerm) {
    let searchResults;

    if (searchTerm) {
      let matchingUsers = await db.query(
      `SELECT username, email FROM users WHERE username ILIKE $1 ORDER BY username`,
      [`%${searchTerm}%`]
      );
      searchResults = matchingUsers.rows;
    } else {
      searchResults = await User.getAllUsers();
    } 

    //even if searchResults is empty, don't throw error, just return nothing.
    return searchResults;
  }

  /** Updates the user with the correct username's username and/or email.
   *  Users can not yet update the password, that may be a separate method in the future.
   *  Upon successful update, returns the user's updated username and email.
   * 
   *  Throws a BadRequestError if data to update contains anything other than username and/or email, OR if new username and/or email doesn't match database requirements.
   *  Throws a NotFoundError if user cannot be found in the database.
   *  Throws a BadRequestError if the new updated username is a duplicate of another username in the database.
   */
  static async updateUser(username, updateData) {
    //check to make sure updateData only has the keys of username and/or email.
    for (let key of Object.keys(updateData)) {
      if (key != "username" && key != "email") throw new BadRequestError("You can only update your username and/or email."); 
    }

    //updated username and email must still meet the database requirements.
    if (updateData.username && (updateData.username.length < 5 || updateData.username.length > 30)) {
      throw new BadRequestError("The new username must be between 5-30 characters.");
    }
    if (updateData.email && !(updateData["email"].includes("@"))) {
      throw new BadRequestError("The new email must be valid.");
    }

    //finally, make sure the updated username isn't a duplicate of an existing username in the database.
    const duplicateUsernameQuery = await db.query(`SELECT username FROM users WHERE username = $1`, [updateData.username]);
    const duplicateUserResult = duplicateUsernameQuery.rows[0];
    if (duplicateUserResult) throw new BadRequestError(`There is already a user with the username of ${updateData.username}. Please try another username.`);

    const {setCols, values} = sqlForPartialUpdate(updateData);
    const usernameParameterIndex = "$" + (values.length + 1);

    const sqlUpdateQuery = `UPDATE users
                            SET ${setCols}
                            WHERE username = ${usernameParameterIndex}
                            RETURNING username, email`;
    const updateResult = await db.query(sqlUpdateQuery, [...values, username]);
    const updatedUser = updateResult.rows[0];

    if (!updatedUser) throw new NotFoundError(`The user with username of ${username} was not found in the database.`);

    return updatedUser;
  }

  /** Fetches all original recipes (not remixes) created by the user matching the inputted username.
   *  If a limit n is supplied, fetches only the n most recently added recipes by that user, newest first.
   *  Returns {id, name, description, imageUrl, createdAt} for each recipe.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getRecipesFromUser(username, limit = 0) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;
    //if limit > 0, include the limit at end of sql query.
    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [userId, limit] : [userId];

    const recipesFromUser = await db.query(
      `SELECT id, name, description, image_url AS "imageUrl", created_at AS "createdAt" FROM recipes
       WHERE user_id = $1 
       ORDER BY created_at DESC, name` + parametrizedQueryAddition,
      parametrizedQueryValues 
    );

    return recipesFromUser.rows;
  }

  /** Fetches all remixes created by the user matching the inputted username.
   *  If a limit n is supplied, fetches only the n most recently added remixes by that user, newest first.
   *  Returns {id, name, description, originalRecipe, imageUrl, createdAt} for each remix.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getRemixesFromUser(username, limit = 0) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;
    //if limit ? 0, include the limit at the end of the sql query.
    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [userId, limit] : [userId];

    const remixesFromUser = await db.query(
      `SELECT rem.id, rem.name, rem.description, rec.name AS "originalRecipe", rem.image_url AS "imageUrl", rem.created_at AS "createdAt"
       FROM remixes rem
       JOIN recipes rec ON rem.recipe_id = rec.id
       WHERE rem.user_id = $1
       ORDER BY rem.created_at DESC, rem.name` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return remixesFromUser.rows;
  }

  /** Returns {id, name, description, imageUrl, createdAt} of each recipe currently listed in a specific user's favorite recipes,
   *  sorts favorite recipes by recipe name alphabetical order.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getUsersFavoriteRecipes(username) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const usersFavoriteRecipes = await db.query(
      `SELECT rec.id, rec.name, rec.description, rec.image_url AS "imageUrl", rec.created_at AS "createdAt"
       FROM recipe_favorites favs
       JOIN recipes rec ON favs.recipe_id = rec.id
       WHERE favs.user_id = $1
       ORDER BY rec.name`,
       [userId]
    );

    return usersFavoriteRecipes.rows;
  }

  /** Returns {id, name, description, originalRecipe, imageUrl, createdAt} of each remix currently listed in a specific user's favorite remixes,
   *  sorts by remix name in alphabetical order.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getUsersFavoriteRemixes(username) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const usersFavoriteRemixes = await db.query(
      `SELECT rem.id, rem.name, rem.description, rec.name AS "originalRecipe", rem.image_url AS "imageUrl", rec.created_at AS "createdAt"
       FROM remix_favorites favs
       JOIN remixes rem ON favs.remix_id = rem.id
       JOIN recipes rec ON rem.recipe_id = rec.id
       WHERE favs.user_id = $1
       ORDER BY rem.name`,
       [userId]
    );

    return usersFavoriteRemixes.rows;
  }

  /** Fetches and returns detailed information about the user that will be displayed on the user's main profile page.
   *  This includes user account information like their username and email, as well as up to 3 of their most recently
   *  created recipes and remixes, as well as their most recently created recipe review and remix review.
   * 
   *  Returns {username, email, recipes: [ {id, name, description, imageUrl, createdAt}... ], remixes: [ {id, name, description, originalRecipe, imageUrl, createdAt}... ],
   *           recipeReview: {recipeId, recipeName, title, content, createdAt}, remixReivew: {remixId, remixName, title, content, createdAt} }
   */
  static async getUsersDetailedInfo(username) {
    let userInfo = await User.getUserBasicInfo(username);
    let userRecentRecipes = await User.getRecipesFromUser(username, 3);
    let userRecentRemixes = await User.getRemixesFromUser(username, 3);
    let userRecentRecipeReview = await User.getUsersMostRecentRecipeReview(username);
    let userRecentRemixReview = await User.getUsersMostRecentRemixReview(username);

    userInfo = {...userInfo, recipes: userRecentRecipes, remixes: userRecentRemixes, recipeReview: userRecentRecipeReview, remixReview: userRecentRemixReview};
    return userInfo;
  }

  /** Fetches and returns all recipe reviews belonging to a specific user, newest ones first.
   *  Returns {id, recipeId, recipeName, title, content, createdAt } for each review.
   * 
   *  If a limit n is supplied, fetches only the n most recently added recipe reviews by that user, newest first.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getUsersRecipeReviews(username, limit = 0) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;
    //if limit ? 0, include the limit at the end of the sql query.
    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [userId, limit] : [userId];

    const usersRecipeReviews = await db.query(
      `SELECT rev.id, rev.recipe_id AS "recipeId", rec.name AS "recipeName", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM recipe_reviews rev
       JOIN recipes rec ON rev.recipe_id = rec.id
       WHERE rev.user_id = $1
       ORDER BY rev.created_at DESC, rev.title`+ parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return usersRecipeReviews.rows;
  }

  /** Fetches and returns the most recently added recipe review added by the user with the specified username.
   *  Returns either the review {recipeId, recipeName, title, content, createdAt } or an empty object if the user has no recipe reviews.
   */
  static async getUsersMostRecentRecipeReview(username) {
    const mostRecentRecipeReview = await User.getUsersRecipeReviews(username, 1);
    if (mostRecentRecipeReview.length) {
      return mostRecentRecipeReview[0];
    } else {
      return {};
    }
  }

  /** Fetches and returns all remix reviews belonging to a specific user, newest ones first.
   *  Returns {id, remixId, remixName, title, content, createdAt } for each review.
   * 
   *  If a limit n is supplied, fetches only the n most recently added remix reviews by that user, newest first.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   */
  static async getUsersRemixReviews(username, limit = 0) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;
    //if limit ? 0, include the limit at the end of the sql query.
    const parametrizedQueryAddition = (limit > 0) ? ` LIMIT $2` : ``;
    const parametrizedQueryValues = (limit > 0) ? [userId, limit] : [userId];

    const usersRemixReviews = await db.query(
      `SELECT rev.id, rev.remix_id AS "remixId", rem.name AS "remixName", rev.title, rev.content, rev.created_at AS "createdAt"
       FROM remix_reviews rev
       JOIN remixes rem ON rev.remix_id = rem.id
       WHERE rev.user_id = $1
       ORDER BY rev.created_at DESC, rev.title` + parametrizedQueryAddition,
       parametrizedQueryValues
    );

    return usersRemixReviews.rows;
  }

  /** Fetches and returns the most recently added remix review added by the user with the specified username.
   *  Returns either the review {remixId, remixName, title, content, createdAt } or an empty object if the user has no remix reviews.
   */
  static async getUsersMostRecentRemixReview(username) {
    const mostRecentRemixReview = await User.getUsersRemixReviews(username, 1);
    if (mostRecentRemixReview.length) {
      return mostRecentRemixReview[0];
    } else {
      return {};
    }
  }

  /** Adds the recipe with id of recipeId to the favorite recipes list of a user.
   *  Does not return anything upon successful addition.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   *  Throws a NotFoundError if the recipeId supplied doesn't belong to any recipe in the database.
   *  Throws a BadRequestError if the recipe with id recipeId is already in the username's favorites.
   */
  static async addRecipeToFavorites(username, recipeId) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const recipe = await db.query(`SELECT name FROM recipes where id = $1`, [recipeId]);
    const recipeInfo = recipe.rows[0];

    if (!recipeInfo) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    //check to make sure recipeId isn't already in the user's favorites.
    const favoritesCheck = await db.query(
      `SELECT user_id, recipe_id FROM recipe_favorites 
       WHERE user_id = $1 AND recipe_id = $2`,
      [userId, recipeId]
    );
    if (favoritesCheck.rows.length > 0) throw new BadRequestError(`Recipe id ${recipeId} is already a favorite of ${username}.`);

    await db.query(`INSERT INTO recipe_favorites (user_id, recipe_id) VALUES ($1, $2)`, [userId, recipeId]);
  }

  /** Removes the recipe with id of recipeId from the favorite recipes list of a user.
   *  Does not return anything upon successful deletion.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   *  Throws a NotFoundError if the recipeId supplied doesn't belong to any recipe in the database.
   *  Throws a BadRequestError if the recipe with id recipeId is already not the username's favorites.
   */
  static async removeRecipeFromFavorites(username, recipeId) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const recipe = await db.query(`SELECT name FROM recipes where id = $1`, [recipeId]);
    const recipeInfo = recipe.rows[0];

    if (!recipeInfo) throw new NotFoundError(`The recipe with id of ${recipeId} was not found in the database.`);

    //check to make sure recipeId is actually in the user's favorites.
    const favoritesCheck = await db.query(
      `SELECT user_id, recipe_id FROM recipe_favorites
       WHERE user_id = $1 AND recipe_id = $2`,
       [userId, recipeId]
    );
    if (favoritesCheck.rows.length == 0) throw new BadRequestError(`Recipe id ${recipeId} is already not a favorite of ${username}.`);

    await db.query(
      `DELETE FROM recipe_favorites
       WHERE user_id = $1 AND recipe_id = $2`,
       [userId, recipeId]
    );
  }

  /** Adds the remix with id of remixId to the favorite remixes list of a user.
   *  Does not return anything upon successful addition.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   *  Throws a NotFoundError if the remixId supplied doesn't belong to any remix in the database.
   *  Throws a BadRequestError if the remix with id remixId is already in the username's favorites.
   */
  static async addRemixToFavorites(username, remixId) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const remix = await db.query(`SELECT name FROM remixes where id = $1`, [remixId]);
    const remixInfo = remix.rows[0];

    if (!remixInfo) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    //check to make sure remixId isn't already in the user's favorites.
    const favoritesCheck = await db.query(
      `SELECT user_id, remix_id FROM remix_favorites 
       WHERE user_id = $1 AND remix_id = $2`,
      [userId, remixId]
    );
    if (favoritesCheck.rows.length > 0) throw new BadRequestError(`Remix id ${remixId} is already a favorite of ${username}.`);

    await db.query(`INSERT INTO remix_favorites (user_id, remix_id) VALUES ($1, $2)`, [userId, remixId]);
  }

  /** Removes the remix with id of remixId from the favorite remixes list of a user.
   *  Does not return anything upon successful deletion.
   * 
   *  Throws a NotFoundError if the username supplied doesn't belong to any user in the database.
   *  Throws a NotFoundError if the remixId supplied doesn't belong to any remix in the database.
   *  Throws a BadRequestError if the remix with id remixId is already not the username's favorites.
   */
  static async removeRemixFromFavorites(username, remixId) {
    //make sure username supplied exists in the database.
    const user = await db.query(`SELECT id, username FROM users WHERE username = $1`, [username]);
    const userInfo = user.rows[0];

    if (!userInfo) throw new NotFoundError(`The user with username ${username} was not found in the database.`);
    const userId = userInfo.id;

    const remix = await db.query(`SELECT name FROM remixes where id = $1`, [remixId]);
    const remixInfo = remix.rows[0];

    if (!remixInfo) throw new NotFoundError(`The remix with id of ${remixId} was not found in the database.`);

    //check to make sure recipeId is actually in the user's favorites.
    const favoritesCheck = await db.query(
      `SELECT user_id, remix_id FROM remix_favorites
       WHERE user_id = $1 AND remix_id = $2`,
       [userId, remixId]
    );
    if (favoritesCheck.rows.length == 0) throw new BadRequestError(`Remix id ${remixId} is already not a favorite of ${username}.`);

    await db.query(
      `DELETE FROM remix_favorites
       WHERE user_id = $1 AND remix_id = $2`,
       [userId, remixId]
    );
  }
}

module.exports = User;