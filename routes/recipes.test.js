/** This file contains unit tests/integration tests for testing recipe-related routes such as updating a recipe. */

const request = require("supertest");

const db = require("../db.js");
const app = require("../app.js");
const Recipe = require("../models/recipe.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);