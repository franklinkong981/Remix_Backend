/** Test file for unit/integration tests on authentication routes such as registering or authenticating/logging in a user. */

const request = require("supertest");

const app = require("../app.js");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /auth/register */

describe("POST /auth/register", function () {
  test("works for valid req.body inputs and successfully registers and adds user3 to the database", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "user3",
          email: "user3@gmail.com",
          password: "user3password"
        });
    console.log(resp.text);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      newUserInfo: {
        username: "user3",
        email: "user3@gmail.com"
      },
      message: "Successfully registered new user"
    });
  });

  test("Throws error if bad request with missing email and password fields", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "user3"
        });
    expect(resp.statusCode).toEqual(400);
  });

  
});