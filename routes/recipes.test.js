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

/************************************** GET /recipes */

describe("GET /recipes works for intended", function () {
  test("works for logged in user1 with 1.1 as the search term, should only return information on recipe 1.1", async function() {
    const resp = await request(app).get("/recipes?recipeName=1.1").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.recipeSearchResults.length).toEqual(1);
    expect(resp.body.recipeSearchResults[0].id).toEqual(expect.any(Number));
    expect(resp.body.recipeSearchResults[0].name).toEqual("recipe 1.1");
    expect(resp.body.recipeSearchResults[0].description).toEqual("The first recipe by user 1");
    expect(resp.body.recipeSearchResults[0].imageUrl).toEqual(expect.any(String));
    expect(resp.body.recipeSearchResults[0].createdAt).toEqual(expect.any(String));
  });

  test("works for logged in user2 with search term being recipe, should return all 3 recipes, search results shold be case-insensitive", async function() {
    const resp = await request(app).get("/recipes?recipeName=RECIPE").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.recipeSearchResults.length).toEqual(3);
    expect(resp.body.recipeSearchResults[0].name).toEqual("recipe 1.1");
    expect(resp.body.recipeSearchResults[1].name).toEqual("recipe 1.2");
    expect(resp.body.recipeSearchResults[2].name).toEqual("recipe 2.1");
  });

  test("works for logged in user1 without query string, returns both all 3 recipes", async function () {
    const resp = await request(app)
        .get("/recipes")
        .set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.recipeSearchResults.length).toEqual(3);
    expect(resp.body.recipeSearchResults[0].name).toEqual("recipe 1.1");
    expect(resp.body.recipeSearchResults[1].name).toEqual("recipe 1.2");
    expect(resp.body.recipeSearchResults[2].name).toEqual("recipe 2.1");
  });

  test("Throws BadRequestError if query string contains properties other than recipeName", async function() {
    const resp = await request(app).get("/recipes?recipeName=1.1&ingredients=cucumbers").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("The query string must only contain the non-empty property 'recipeName'.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app)
        .get("/recipes?recipeName=RECIPE");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});