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