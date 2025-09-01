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

describe("POST /auth/register works as intended", function () {
  test("works for valid req.body inputs and successfully registers and adds user3 to the database", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "user3",
          email: "user3@gmail.com",
          password: "user3password"
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      newUserInfo: {
        username: "user3",
        email: "user3@gmail.com"
      },
      message: "Successfully registered new user"
    });
  });

  test("Throws BadRequestError if bad request with missing email and password fields", async function () {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "user3"
        });
    expect(resp.status).toEqual(400);
    expect(resp.error.text).toContain('email');
    expect(resp.error.text).toContain('password');
  });

  test("Throws BadRequestError if bad request with username too short", async function() {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "u3",
          email: "user3@gmail.com",
          password: "user3password"
        });
    //console.log(resp.error.text);
    expect(resp.error.text).toContain("instance.username does not meet minimum length of 5");
    expect(resp.status).toEqual(400);
  });
  
  test("Throws BadRequestError if try to register duplicate username", async function() {
    const resp = await request(app)
        .post("/auth/register")
        .send({
          username: "user2",
          email: "user2@gmail.com",
          password: "user2password"
        });
    expect(resp.error.text).toContain("The username user2 is already taken. Please try another username.");
    expect(resp.status).toEqual(400);
  });
});

/************************************** POST /auth/login */

describe("POST /auth/login works as intended", function () {
  test("works for valid req.body inputs successfully logs in user/returns a token if username and password match", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user1",
          password: "user1password"
        });
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      userInfo: {
        username: "user1",
        email: "user1@gmail.com"
      },
      token: expect.any(String)
    });
  });

  test("Throws UnauthorizedError if password is wrong", async function () {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user1",
          password: "wrong_password"
        });
    expect(resp.status).toEqual(401);
    expect(resp.error.text).toContain('Your username/password is incorrect. Please try again');
  });

  test("Throws BadRequestError if bad request with username is missing", async function() {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          password: "user1password"
        });
    expect(resp.status).toEqual(400);
    expect(resp.error.text).toContain("requires property");
    expect(resp.error.text).toContain("username");
  });
  
  test("Throws BadRequestError if req.body contains attributes other than username and password", async function() {
    const resp = await request(app)
        .post("/auth/login")
        .send({
          username: "user2",
          email: "user2@gmail.com",
          password: "user2password"
        });
    expect(resp.status).toEqual(400);
    expect(resp.error.text).toContain("not allowed to have the additional property");
    expect(resp.error.text).toContain("email");
  });
});