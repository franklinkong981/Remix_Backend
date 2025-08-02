/* This is the main Express file of Remix that runs the backend server. 
*/

const express = require("express");
const morgan = require("morgan");

//errors imports here
const { NotFoundError }= require("./errors/errors.js");
const { errorMonitor } = require("supertest/lib/test");

//middleware imports here

//routes imports here
const usersRoutes = require("./routes/users.js");

const app = express();

//allow form-encoded and json-encoded parsing.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//use middleware here

//use the morgan middleware logging library, this prints information about each request sent to the server on the terminal/console.
app.use(morgan('dev'));

//prevents printing favicon.ico error to terminal/console.
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

//app.use route files here
app.use("/users", usersRoutes);

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
