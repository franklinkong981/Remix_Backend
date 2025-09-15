/* The routes in this app that have to do with remixes, updating a remix, etc. */

const express = require("express");
const router = new express.Router();

const {BadRequestError, UnauthorizedError, NotFoundError} = require("../errors/errors.js");
const Remix = require("../models/remix.js");
const {ensureLoggedIn, 
  ensureIsCorrectUser,
  ensureRemixBelongsToCorrectUser,
  ensureRemixReviewBelongsToCorrectUser
} = require("../middleware/auth.js");

const jsonschema = require("jsonschema");




module.exports = router;