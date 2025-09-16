/** This file contains unit tests/integration tests for testing remix-related routes such as updating a remix. */

const request = require("supertest");

const db = require("../db.js");
const app = require("../app.js");

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

/************************************** GET /remixes/:remixId/reviews */
describe("GET /remixes/:remixId/reviews works as intended", function() {
  test("Successfully fetches both reviews of recipe 2.1 remix 1 (id 1), with user1 logged in, most recently added review should be returned first", async function() {
    const resp = await request(app).get("/remixes/1/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixReviews.length).toEqual(2);
    expect(resp.body.remixReviews[0].title).toEqual("I love meat!");
    expect(resp.body.remixReviews[0].content).toEqual("I'm going to add another meat to this remix later.");
    expect(resp.body.remixReviews[0].reviewAuthor).toEqual("user2");
    expect(resp.body.remixReviews[0].id).toEqual(expect.any(Number));
    expect(resp.body.remixReviews[0].createdAt).toEqual(expect.any(String));
    expect(resp.body.remixReviews[1].title).toEqual("New meat is good");
  });

  test("Throws NotFoundError if remix with id of remixId isn't found in the database", async function() {
    const resp = await request(app).get("/remixes/100/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("The remix with id of 100 was not found in the database.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app).get("/remixes/1/reviews");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** GET /remixes/:remixId */
describe("GET /remixes/:remixId works as intended", function() {
  test("Successfully fetches detailed information of recipe 2.1 remix 1 (id 1), including both of its reviews, with user1 logged in", async function() {
    const resp = await request(app).get("/remixes/1").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    
    const remix = resp.body.remixDetails;
    expect(remix.remixAuthor).toEqual("user1");
    expect(remix.name).toEqual("recipe 2.1 remix 1");
    expect(remix.ingredients).toContain("mutton");
    expect(remix.directions).toContain("oven");
    expect(remix.cookingTime).toEqual(0);
    expect(remix.servings).toEqual(5);
    expect(remix.imageUrl).toEqual(expect.any(String));
    expect(remix.createdAt).toEqual(expect.any(String));

    const remixReviews = remix.reviews;
    expect(remixReviews.length).toEqual(2);
    //most recently added review should be first.
    expect(remixReviews[0].title).toEqual("I love meat!");
    expect(remixReviews[1].title).toEqual("New meat is good");
  });

  test("Throws NotFoundError if remix with id of remixId isn't found in the database", async function() {
    const resp = await request(app).get("/remixes/100").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(404);
    expect(resp.error.text).toContain("The remix with id of 100 was not found in the database.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app).get("/remixes/1");
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** POST /remixes */

describe("POST /remixes works as intended", function() {
  test("user1 successfully adds another remix of recipe 1.1 with req.body meeting the correct specifications", async function() {
    let resp = await request(app).get("/recipes/1/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(1);

    resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          purpose: "To add more vegetables",
          originalRecipeId: 1,
          cookingTime: 35,
          servings: 5,
          imageUrl: "http://pepperscorn.img"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.newRemix.name).toEqual("New remix");
    expect(resp.body.newRemix.description).toContain("Here's some more vegetables to add");
    expect(resp.body.newRemix.purpose).toContain("more vegetables");
    expect(resp.body.newRemix.ingredients).toContain("peppers, corn");
    expect(resp.body.newRemix.directions).toContain("stir fry");
    expect(resp.body.newRemix.cookingTime).toEqual(35);
    expect(resp.body.newRemix.servings).toEqual(5);
    expect(resp.body.newRemix.imageUrl).toEqual(expect.any(String));
    expect(resp.body.message).toEqual("Successfully added new remix of recipe with id of 1");

    resp = await request(app).get("/recipes/1/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(2);
    expect(resp.body.remixes[0].name).toEqual("New remix");
  });

  test("Creates a new remix with just name, description, purpose, originalRecipeId, ingredients, and directions in the request body", async function() {
    let resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          purpose: "To add more vegetables",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          originalRecipeId: 1
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.newRemix.cookingTime).toEqual(0);
    expect(resp.body.newRemix.servings).toEqual(0);
    expect(resp.body.newRemix.imageUrl).toEqual(expect.any(String));

    resp = await request(app).get("/recipes/1/remixes").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(2);
    expect(resp.body.remixes[0].name).toEqual("New remix");
  });

  test("Throws BadRequestError if empty body is passed in", async function() {
    const resp = await request(app)
        .post("/remixes")
        .send({})
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance requires property");
    expect(resp.error.text).toContain("name");
    expect(resp.error.text).toContain("description");
    expect(resp.error.text).toContain("purpose");
    expect(resp.error.text).toContain("originalRecipeId");
    expect(resp.error.text).toContain("ingredients");
    expect(resp.error.text).toContain("directions");
  });

  test("Throws BadRequestError if certain strings don't meet proper requirements", async function() {
    let resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          purpose: "",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          originalRecipeId: 1
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.purpose does not meet minimum length of 10");
  });

  test("Throws BadRequestError if cookingTime and/or servings is negative", async function() {
    let resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          purpose: "To add more vegetables",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          originalRecipeId: 1,
          cookingTime: -36,
          servings: 5
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.cookingTime must be greater than or equal to 0");
  });

  test("Throws BadRequestError if request body contains attributes outside of the allowed attributes", async function() {
    let resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          purpose: "To add more vegetables",
          originalRecipeId: 1,
          rating: 5,
          cookingTime: 35,
          servings: 5,
          imageUrl: "http://pepperscorn.img"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("not allowed to have the additional property");
    expect(resp.error.text).toContain("rating");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    let resp = await request(app)
        .post("/remixes")
        .send({
          name: "New remix",
          description: "Here's some more vegetables to add",
          ingredients: "Onions, celery, garlic, peppers, corn",
          directions: "Pour everything into a pan and stir fry it!",
          purpose: "To add more vegetables",
          originalRecipeId: 1,
          rating: 5,
          cookingTime: 35,
          servings: 5,
          imageUrl: "http://pepperscorn.img"
        });
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** PATCH /remixes/:remixId */

describe("PATCH /remixes/:remixId works as intended", function() {
  test("user2 successfully updates their recipe 1.1 remix (id 3) with req.body meeting the correct specifications", async function() {
    let resp = await request(app).get("/recipes/1/remixes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(1);

    resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "Add 2 new vegetables",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          imageUrl: ""
        })
        .set("authorization", `${user2Token}`);
    
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.updatedRemix.name).toEqual("recipe 1.1 remix now with 2 new vegetables");
    expect(resp.body.updatedRemix.description).toContain("The remix of recipe 1.1 by user 2");
    expect(resp.body.updatedRemix.ingredients).toContain("brocolli");
    expect(resp.body.updatedRemix.cookingTime).toEqual(40);
    expect(resp.body.updatedRemix.servings).toEqual(0);
    expect(resp.body.updatedRemix.imageUrl).toEqual("https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg");
    expect(resp.body.message).toEqual("Successfully updated the remix with id 3");

    resp = await request(app).get("/recipes/1/remixes").set("authorization", `${user2Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixes.length).toEqual(1);
  });

  test("Throws BadRequestError if empty body is passed in", async function() {
    resp = await request(app)
        .patch("/remixes/3")
        .send({})
        .set("authorization", `${user2Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance does not meet minimum property length of 1");
  });

  test("Throws BadRequestError if certain strings don't meet proper requirements", async function() {
    let resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          imageUrl: ""
        })
        .set("authorization", `${user2Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.purpose does not meet minimum length of 10");
  });

  test("Throws BadRequestError if cookingTime and/or servings is negative", async function() {
    let resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "Add 2 new vegetables",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          cookingTime: -60,
          imageUrl: ""
        })
        .set("authorization", `${user2Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.cookingTime must be greater than or equal to 0");
  });

  test("Throws BadRequestError if request body contains attributes outside of the allowed attributes", async function() {
    let resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "Add 2 new vegetables",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          cookingTime: 60,
          rating: 5,
          imageUrl: ""
        })
        .set("authorization", `${user2Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("not allowed to have the additional property");
    expect(resp.error.text).toContain("rating");
  });

  test("Throws ForbiddenError if logged in user tries to update a recipe they didn't create", async function() {
    const resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "Add 2 new vegetables",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          imageUrl: ""
        })
        .set("authorization", `${user1Token}`);
    //user2 created recipe 1.1 remix (id 3), so ForbiddenError should be thrown.
    expect(resp.statusCode).toEqual(403);
    expect(resp.error.text).toContain("You can't edit this remix because you didn't create it.");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app)
        .patch("/remixes/3")
        .send({
          name: "recipe 1.1 remix now with 2 new vegetables",
          purpose: "Add 2 new vegetables",
          ingredients: "Onions, celery, garlic, tomatoes, brocolli",
          imageUrl: ""
        });
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});

/************************************** POST /remixes/:remixId/reviews */

describe("POST /remixes/:remixId/reviews works as intended", function() {
  test("user1 successfully adds another remix review of recipe 1.1 remix (id 3) with req.body meeting the correct specifications", async function() {
    let resp = await request(app).get("/remixes/3/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixReviews.length).toEqual(1);

    resp = await request(app)
        .post("/remixes/3/reviews")
        .send({
          title: "New review for recipe 1.1 remix",
          content: "New content for recipe 1.1 remix review"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(201);
    expect(resp.body.newRemixReview.reviewId).toEqual(expect.any(Number));
    expect(resp.body.newRemixReview.userId).toEqual(1);
    expect(resp.body.newRemixReview.remixId).toEqual(3);
    expect(resp.body.newRemixReview.title).toEqual("New review for recipe 1.1 remix");
    expect(resp.body.newRemixReview.content).toEqual("New content for recipe 1.1 remix review");
    expect(resp.body.newRemixReview.createdAt).toEqual(expect.any(String));
    expect(resp.body.message).toEqual("Successfully added new review for remix with id 3.");

    resp = await request(app).get("/remixes/3/reviews").set("authorization", `${user1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body.remixReviews.length).toEqual(2);
  });

  test("Throws BadRequestError if empty body is passed in", async function() {
    const resp = await request(app)
        .post("/remixes/3/reviews")
        .send({})
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance requires property");
    expect(resp.error.text).toContain("title");
    expect(resp.error.text).toContain("content");
  });

  test("Throws BadRequestError if certain strings don't meet proper requirements", async function() {
    let resp = await request(app)
        .post("/remixes/3/reviews")
        .send({
          title: "",
          content: "I don't think this will pass"
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("instance.title does not meet minimum length of 1");
  });

  test("Throws BadRequestError if request body contains attributes outside of the allowed attributes", async function() {
    let resp = await request(app)
        .post("/remixes/3/reviews")
        .send({
          title: "New review for recipe 1.1 remix",
          content: "New content for recipe 1.1 remix review",
          rating: 5
        })
        .set("authorization", `${user1Token}`);
    
    expect(resp.statusCode).toEqual(400);
    expect(resp.error.text).toContain("not allowed to have the additional property");
    expect(resp.error.text).toContain("rating");
  });

  test("Throws UnauthorizedError if request is sent by user who is not logged in", async function() {
    const resp = await request(app)
        .post("/remixes/3/reviews")
        .send({
          title: "New review for recipe 1.1 remix",
          content: "New content for recipe 1.1 remix review"
        });
    expect(resp.statusCode).toEqual(401);
    expect(resp.error.text).toContain("You must be logged in to access this!");
  });
});