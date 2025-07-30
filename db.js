/* When the Remix is run, this file finds the correct database based on whether the app is in dev mode or test mode and connects to it.*/

const { Client } = require("pg");
const { getDatabaseUri } = require("./config.js");

let db;

//if in test mode, connect to the test database uri. If in production mode, connect to regular database uri.
if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false
    }
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri()
  });
}

db.connect();

module.exports = db;