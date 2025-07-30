/*  Shared config file for application, contains configuration variables/secret keys that may be required in many places in the source code,
needed for connecting to the database, running the app, etc. 
*/

require("dotenv").config();
require("colors");

//using dotenv library, some process.env variables will be found in the .env file, if not then they'll be given a default value.
const SECRET_KEY = process.env.SECRET_KEY || "remix-secret-dev";

//by default, backend server runs on port 3001. 
//NOTE: + converts process.env.port to a number in case it's stored as a string.
const PORT = +process.env.port || 3001;

//Use dev database or testing database, according to whether you're running the app locally or running tests.
function getDatabaseUri() {
  if (process.env.NODE_ENV === "test") {
    console.log("Launching test database");
  } else {
    console.log("Launching dev database");
  }

  // console.log(`Database URL: ${process.env.DATABASE_URL}`);
  return (process.env.NODE_ENV === "test") ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
}

//Speed up bcrypt during tests, for dev/production set it to standard work factor of 12 hashing rounds.
const BCRYPT_WORK_FACTOR = process.env.NODE_ENV === "test" ? 1 : 12;

//print out configurations for current runtime instance on terminal.
//list of environmental variables of interest: SECRET_KEY, PORT, DATABASE_URL, TEST_DATABASE_URL, BCRYPT_WORK_FACTOR
console.log("RUNNING REMIX. CONFIGURATIONS: ".green);
console.log("SECRET KEY: ".yellow, SECRET_KEY);
console.log("Running on port ".yellow, PORT.toString());
console.log("Bcrypt work factor ".yellow, BCRYPT_WORK_FACTOR);
console.log("Currently using database with URI address ".yellow, getDatabaseUri());
console.log("-------------------------------------------------------------------------");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri
};
