const express = require("express");

const User = require("../models/user.js");

const router = express.Router();

router.get("/", async function(req, res, next) {
  try {
    const allUsers = await User.getAllUsers();
    return res.status(200).json({allUsers});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;