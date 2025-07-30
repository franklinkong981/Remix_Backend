const { Result } = require("pg");
const db = require("../db.js");
const bcrypt = require("bcrypt");

class User {
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