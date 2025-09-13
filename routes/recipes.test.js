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

/************************************** GET /recipes/:recipeId/remixes */
describe("GET /recipes/:recipeId/remixes works as intended", function() {
  test("Successfully fetches both remixes of recipe 2.1, with user1 logged in, most recently added remix should be returned first", async function() {
    const resp = await request(app).get("/recipes/3/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(2);
    expect(resp.body.remixes[0].name).toEqual("recipe 2.1 remix 2");
    expect(resp.body.remixes[0].description).toContain("second remix");
    expect(resp.body.remixes[0].imageUrl).toEqual(expect.any(String));
    expect(resp.body.remixes[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.remixes[1].name).toEqual("recipe 2.1 remix 1");
  });

  test("Throws NotFoundError if recipe with id of recipeId isn't found in the database", async function() {
    const resp = await request(app).get("/recipes/100/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("The recipe with id of 100 was not found in the database.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app).get("/recipes/3/remixes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /recipes/:recipeId/reviews */
describe("GET /recipes/:recipeId/reviews works as intended", function() {
  test("Successfully fetches both reviews of recipe 2.1, with user1 logged in, most recently added review should be returned first", async function() {
    const resp = await request(app).get("/recipes/3/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.recipeReviews.length).toEqual(2);
    expect(resp.body.recipeReviews[0].title).toEqual("My second favorite!");
    expect(resp.body.recipeReviews[0].content).toEqual("I like this recipe the second best!");
    expect(resp.body.recipeReviews[0].reviewAuthor).toEqual("user2");
    expect(resp.body.recipeReviews[0].id).toEqual(expect.any(Number));
    expect(resp.body.recipeReviews[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.recipeReviews[1].title).toEqual("Another delicious recipe!");
  });

  test("Throws NotFoundError if recipe with id of recipeId isn't found in the database", async function() {
    const resp = await request(app).get("/recipes/100/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("The recipe with id of 100 was not found in the database.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app).get("/recipes/3/reviews");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /recipes/:recipeId */
describe("GET /recipes/:recipeId works as intended", function() {
  test("Successfully fetches detailed information of recipe 2.1, including both of its remixes and both of its reviews", async function() {
    const resp = await request(app).get("/recipes/3").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    
    const recipe = resp.body.recipeDetails;
    expect(recipe.recipeAuthor).toEqual("user2");
    expect(recipe.name).toEqual("recipe 2.1");
    expect(recipe.ingredients).toContain("beef");
    expect(recipe.directions).toContain("oven");
    expect(recipe.cookingTime).toEqual(120);
    expect(recipe.servings).toEqual(3);
    expect(recipe.imageUrl).toEqual(expect.any(String));
    expect(recipe.createdAt).toEqual(expect.any(String));

    const recipeRemixes = recipe.remixes;
    expect(recipeRemixes.length).toEqual(2);
    //most recently added remix should be first.
    expect(recipeRemixes[0].name).toEqual("recipe 2.1 remix 2");
    expect(recipeRemixes[1].name).toEqual("recipe 2.1 remix 1");

    const recipeReviews = recipe.reviews;
    expect(recipeReviews.length).toEqual(2);
    //most recently added review should be first.
    expect(recipeReviews[0].title).toEqual("My second favorite!");
    expect(recipeReviews[1].title).toEqual("Another delicious recipe!");
  });

  test("Throws NotFoundError if recipe with id of recipeId isn't found in the database", async function() {
    const resp = await request(app).get("/recipes/100").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("The recipe with id of 100 was not found in the database.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app).get("/recipes/3");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** POST /recipes*/

describe("POST /recipes works as intended", function() {
  test("user1 successfully adds another recipe with req.body meeting the correct specifications", async function() {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          email: "user1update@gmail.com"
        })
        .set("authorization", `${user1Token}`);
  });
});