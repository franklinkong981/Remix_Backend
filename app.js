/* This is the main Express file of Remix that runs the backend server. 
*/

const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

//errors imports here
const { NotFoundError }= require("./errors/errors.js");

//middleware imports here
const { authenticateJwt } = require("./middleware/auth");

//routes imports here
const authRoutes = require("./routes/auth.js");
const userRoutes = require("./routes/users.js");
const recipeRoutes = require("./routes/recipes.js");
const remixRoutes = require("./routes/remixes.js");

const app = express();

//DON'T DELETE THIS, you won't be able to send requests without cors.
app.use(cors());

//allow form-encoded and json-encoded parsing.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//use middleware here. This ensures that before each request, if user is logged in their token will be present in response object.
app.use(authenticateJwt);

//use the morgan middleware logging library, this prints information about each request sent to the server on the terminal/console.
app.use(morgan('dev'));

//prevents printing favicon.ico error to terminal/console.
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

//app.use route files here
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/recipes", recipeRoutes);
app.use("/remixes", remixRoutes);

//Handle 404 errors passed from Express here.
app.use(function(req, res, next) {
  return next(new NotFoundError());
});

//Generic error handler, could be a specific error from errors.js passed from Express or generic unhandled error (default 500).
app.use(function(err, req, res, next) {
  //print error trace/stack if in production/dev mode.
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message || "An error has occurred";

  return res.status(status).json({
    error: {status, message}
  });
});

module.exports = app;
