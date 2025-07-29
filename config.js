/*  Shared config file for application, contains configuration variables/secret keys that may be required in many places in the source code,
needed for connecting to the database, running the app, etc. 
*/

require("dotenv").config();
require("colors");

//using dotenv library, some process.env variables will be found in the .env file, if not then they'll be given a default value.
const SECRET_KEY = process.env.SECRET_KEY || "remix-secret-dev";

//by default, backend server runs on port 3001. 
//NOTE: + converts process.env.port to a number in case it's stored as a string.
const port = +process.env.port || 3001;

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



