/** This file contains unit tests/integration tests for testing users-related routes such as updating a user's profile information. */

const request = require("supertest");

const db = require("../db.js");
const app = require("../app.js");
const User = require("../models/user.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  user1Token,
  user2Token,
} = require("./_testCommon");
const { getAllRecipesBasicInfo } = require("../models/recipe.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /users */

describe("GET /users works for intended", function () {
  test("works for logged in user1 with query string username = user2, should only return user2 information", async function() {
    const resp = await request(app).get("/users?username=user2").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUsers.length).toEqual(1);
    expect(resp.body.allUsers[0].username).toEqual("user2");
    expect(resp.body.allUsers[0].email).toEqual("user2@gmail.com");
  });

  test("works for logged in user2 with query string username = USER, should return both users, search results shold be case-insensitive", async function() {
    const resp = await request(app).get("/users?username=USER").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUsers.length).toEqual(2);
    expect(resp.body.allUsers[0].username).toEqual("user1");
    expect(resp.body.allUsers[1].username).toEqual("user2");
  });

  test("works for logged in user1 without query string, returns both users", async function () {
    const resp = await request(app)
        .get("/users")
        .set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUsers.length).toEqual(2);
    expect(resp.body.allUsers[0]).toEqual({
      username: "user1",
      email: "user1@gmail.com"
    });
    expect(resp.body.allUsers[1]).toEqual({
      username: "user2",
      email: "user2@gmail.com"
    });
  });

  test("Throws BadRequestError if query string contains properties other than username", async function() {
    const resp = await request(app).get("/users?username=user2&age=30").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("The query string must only contain the non-empty property 'username'.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app)
        .get("/users");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** PATCH /users/:username */

describe("PATCH /users/:username works as expected", function () {
  test("user1, logged in, is able to successfully update their email without issue", async function () {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          email: "user1update@gmail.com"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.updatedUser.username).toEqual("user1");
    expect(resp.body.updatedUser.email).toEqual("user1update@gmail.com");
  });

  test("Can't update user1's profile information if user sending request isn't logged in", async function () {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          email: "user1update@gmail.com"
        });
    
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });

  test("user2 can't update user1's profile information", async function() {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          email: "user1update@gmail.com"
        })
        .set("authorization", `${user2Token}`);

    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You can only edit/delete your own");
  });

  test("Throws BadRequestError if body is empty, req.body must contain at least one attribute", async function () {
    const resp = await request(app)
        .patch("/users/user1")
        .send({})
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("does not meet minimum property length of 1");
  });

  test("Throws BadRequestError if body contains attributes to update other than username and email", async function() {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          email: "user1update@gmail.com",
          title: "The new user 1"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("not allowed to have the additional property");
    expect(resp.error.text).toContain("title");
  });

  test("Throws BadRequestError if username and/or email to update isn't validated/has the wrong length/format", async function() {
    const resp = await request(app)
        .patch("/users/user1")
        .send({
          username: ""
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.username does not meet minimum length of 5");
  });
});

/************************************** GET /users/:username/recipes */

describe("GET /users/:username/recipes works as intended", function () {
  test("returns correct information for both recipes created by user1 with user2 logged in, returning recipe 1.2 first since it was created more recently", async function() {
    const resp = await request(app).get("/users/user1/recipes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUserRecipes.length).toEqual(2);
    expect(resp.body.allUserRecipes[1].name).toEqual("recipe 1.1");
    expect(resp.body.allUserRecipes[1].description).toContain("first recipe by user 1");
    expect(resp.body.allUserRecipes[1].imageUrl).toEqual(expect.any(String));
    //expect createdAt to become String, becuase JSON doesn't have a native Date data type.
    expect(resp.body.allUserRecipes[1].createdAt).toEqual(expect.any(String));
    expect(resp.body.allUserRecipes[0].name).toEqual("recipe 1.2");
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/recipes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/recipes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username/remixes */

describe("GET /users/:username/remixes works as intended", function () {
  test("returns correct information for both recipes created by user2 with user1 logged in and returns remixes in chronological order", async function() {
    const resp = await request(app).get("/users/user2/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUserRemixes.length).toEqual(3);
    expect(resp.body.allUserRemixes[0].name).toEqual("recipe 1.2 remix");
    expect(resp.body.allUserRemixes[0].description).toEqual("The remix of recipe 1.2 by user 2");
    expect(resp.body.allUserRemixes[0].originalRecipe).toEqual("recipe 1.2");
    //expect createdAt to become String, becuase JSON doesn't have a native Date data type.
    expect(resp.body.allUserRemixes[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.allUserRemixes[1].name).toEqual("recipe 1.1 remix");
    expect(resp.body.allUserRemixes[2].name).toEqual("recipe 2.1 remix 2");
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/remixes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username/favorites/recipes */

describe("GET /users/:username/favorites/recipes works as intended", function () {
  test("returns correct information for both recipes favorited by user1 with user2 logged in, returning results in alphabetical order", async function() {
    const resp = await request(app).get("/users/user1/favorites/recipes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUserFavoriteRecipes.length).toEqual(2);
    expect(resp.body.allUserFavoriteRecipes[0].name).toEqual("recipe 1.1");
    expect(resp.body.allUserFavoriteRecipes[1].name).toEqual("recipe 2.1");
    expect(resp.body.allUserFavoriteRecipes[0].description).toEqual(expect.any(String));
    expect(resp.body.allUserFavoriteRecipes[0].imageUrl).toEqual(expect.any(String));
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/favorites/recipes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/favorites/recipes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username/favorites/remixes */

describe("GET /users/:username/favorites/remixes works as intended", function () {
  test("returns correct information for both remixes favorited by user2 with user1 logged in, returning results in alphabetical order", async function() {
    const resp = await request(app).get("/users/user2/favorites/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.allUserFavoriteRemixes.length).toEqual(2);
    expect(resp.body.allUserFavoriteRemixes[0].name).toEqual("recipe 2.1 remix 1");
    expect(resp.body.allUserFavoriteRemixes[1].name).toEqual("recipe 2.1 remix 2");
    expect(resp.body.allUserFavoriteRemixes[0].description).toEqual(expect.any(String));
    expect(resp.body.allUserFavoriteRemixes[0].originalRecipe).toEqual("recipe 2.1");
    expect(resp.body.allUserFavoriteRemixes[0].imageUrl).toEqual(expect.any(String));
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/favorites/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/favorites/remixes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username */

describe("GET /users/:username works as expected", function () {
  test("Returns all correct information about user1 even though user2 is logged in", async function() {
    const resp = await request(app).get("/users/user1").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);

    const user1Details = resp.body.userDetails;
    expect(user1Details.username).toEqual("user1");
    expect(user1Details.email).toEqual("user1@gmail.com");
    expect(user1Details.recipes.length).toEqual(2);
    expect(user1Details.remixes.length).toEqual(1);
    //recipes should be listed in createdAt descending order, most recent first.
    expect(user1Details.recipes[0].name).toEqual("recipe 1.2");
    expect(user1Details.recipes[1].name).toEqual("recipe 1.1");

    const resp2 = await request(app).get("/users/user2").set("authorization", `${user2Token}`);
    expect(resp2.statusCode).toEqual(200);

    const user2Details = resp2.body.userDetails;
    //remixes should be listed most recent first.
    expect(user2Details.remixes.length).toEqual(3);
    expect(user2Details.remixes[0].name).toEqual("recipe 1.2 remix");
    expect(user2Details.remixes[1].name).toEqual("recipe 1.1 remix");
    expect(user2Details.remixes[2].name).toEqual("recipe 2.1 remix 2");
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username/reviews/recipes */

describe("GET /users/:username/reviews/recipes works as expected", function () {
  test("Returns all original recipe reviews from user1 with user2 logged in, most recently created recipe reviews first", async function() {
    const resp = await request(app).get("/users/user1/reviews/recipes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);

    expect(resp.body.userRecipeReviews.length).toEqual(2);
    expect(resp.body.userRecipeReviews[0].recipeId).toEqual(expect.any(Number));
    expect(resp.body.userRecipeReviews[0].recipeName).toEqual("recipe 2.1");
    expect(resp.body.userRecipeReviews[0].title).toEqual("Another delicious recipe!");
    expect(resp.body.userRecipeReviews[0].content).toEqual("I make this all the time!");
    expect(resp.body.userRecipeReviews[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.userRecipeReviews[1].recipeName).toEqual("recipe 1.1");
    expect(resp.body.userRecipeReviews[1].title).toEqual("Yum!");
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/reviews/recipes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/reviews/recipes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /users/:username/reviews/remixes */

describe("GET /users/:username/reviews/remixes works as expected", function () {
  test("Returns all remix reviews from user1 with user2 logged in, most recently created remixes reviews first", async function() {
    const resp = await request(app).get("/users/user1/reviews/remixes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);

    expect(resp.body.userRemixReviews.length).toEqual(2);
    expect(resp.body.userRemixReviews[0].remixId).toEqual(expect.any(Number));
    expect(resp.body.userRemixReviews[0].remixName).toEqual("recipe 2.1 remix 1");
    expect(resp.body.userRemixReviews[0].title).toEqual("New meat is good");
    expect(resp.body.userRemixReviews[0].content).toEqual("I really enjoy this new recipe that adds a meat");
    expect(resp.body.userRemixReviews[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.userRemixReviews[1].remixName).toEqual("recipe 1.1 remix");
    expect(resp.body.userRemixReviews[1].title).toEqual("I love vegetables!");
  });

  test("Throws NotFoundError if username supplied isn't found in the database", async function() {
    const resp = await request(app).get("/users/user100/reviews/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("username user100 was not found in the database.");
  });

  test("Throws UnauthorizedError if user sending request is not logged in", async function () {
    const resp = await request(app).get("/users/user1/reviews/remixes");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});




