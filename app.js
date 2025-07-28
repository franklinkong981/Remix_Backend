/* This is the main file of Remix that runs the website.
*/

const express = require("express");
const morgan = require("morgan");

//errors imports here

//middleware imports here

//routes imports here

const app = express();

//allow form-encoded and json-encoded parsing.
app.use(express.json());
app.use(express.urlencoded({extended: true}));

//use the morgan middleware logging library, this prints information about each request sent to the server on the terminal/console.
app.use(morgan('dev'));

//prevents printing favicon.ico error to terminal/console.
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

//app.use route files here

//404 error handler here

//generic error handler here

module.exports = app;
