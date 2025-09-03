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
