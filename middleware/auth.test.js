/** Contains tests for the middleware functions, all of which have to do with authentication. */

const jwt = require("jsonwebtoken");
const db = require("../db.js");
const {UnauthorizedError, ForbiddenError} = require("../errors/errors.js");
const {
  authenticateJwt, 
  ensureLoggedIn, 
  ensureIsCorrectUser,
  ensureRecipeBelongsToCorrectUser,
  ensureRecipeReviewBelongsToCorrectUser,
  ensureRemixBelongsToCorrectUser,
  ensureRemixReviewBelongsToCorrectUser
} = require("./auth.js");

const {commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll} = require("./_testCommon.js");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "user1", email: "user1@gmail.com" }, SECRET_KEY);
const badJwt = jwt.sign({ username: "user2", email: "user2@gmail.com" }, "wrong_key");


beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticateJWT", function () {
  test("It works as intended with a properly encrypted jwt in the request header", function () {
    expect.assertions(2);
    //there are multiple ways to pass an authorization token, this is how we'll pass it in the header for purposes of testing.
    const req = { headers: { authorization: `${testJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy(); //we expect err to be undefined here because next() runs instead of next(err).
    };
    authenticateJwt(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "user1",
        email: "user1@gmail.com"
      },
    });
  });

  test("Works as intended even with no header", function () {
    expect.assertions(2);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy(); //next() should still run instead of next(err).
    };
    authenticateJwt(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("works: invalid token", function () {
    expect.assertions(2);
    const req = { headers: { authorization: `${badJwt}` } };
    const res = { locals: {} };
    const next = function (err) {
      expect(err).toBeFalsy();
    };
    authenticateJwt(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("ensureLoggedIn works as intended", function () {
  test("works normally if res.locals payload is supplied", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: { user: { username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy(); //no error should be thrown, so next() should be run instead of next(err).
    };
    ensureLoggedIn(req, res, next);
  });

  test("Throws UnauthorizedError if there is no payload in res.locals", function () {
    expect.assertions(1);
    const req = {};
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    };
    ensureLoggedIn(req, res, next);
  });
});

describe("ensureIsCorrectUser works as intended", function() {
  test("works normally if res.locals payload is supplied and it matches the username in req.params.", function() {
    const req = { params: {username: "user1"} };
    const res = { locals: { user: { username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }
    ensureIsCorrectUser(req, res, next);
  }); 
  
  test("Throws UnauthorizedError if username in res.locals payload doesn't match the username in req.params.", function() {
    const req = { params: {username: "user2"} };
    const res = { locals: { user: { username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
    ensureIsCorrectUser(req, res, next);
  });

  test("Throws UnauthorizedError if payload isn't supplied in res.locals", function() {
    const req = { params: {username: "user1"} };
    const res = { locals: {} };
    const next = function (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
    ensureIsCorrectUser(req, res, next);
  });
});

describe("ensureRecipeBelongsToCorrectUser works as intended", function() {
  test("Passes if username in res.locals payload matches the author of the recipe supplied in req.params", async function() {
    const req = { params: {recipeId: 1} };
    const res = { locals: { user: { id: 1, username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }
    await ensureRecipeBelongsToCorrectUser(req, res, next);
  });

  test("Fails if user2 tries to update a recipe created by user1", async function() {
    const req = { params: {recipeId: 1} };
    const res = { locals: { user: { id: 2, username: "user2", email: "user2@gmail.com" } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
    await ensureRecipeBelongsToCorrectUser(req, res, next); 
  });
});

describe("ensureRecipeReviewBelongsToCorrectUser works as intended", function() {
  test("Passes if username in res.locals payload matches the author of the recipe review supplied in req.params", async function() {
    const req = { params: {reviewId: 1} };
    const res = { locals: { user: { id: 1, username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }
    await ensureRecipeReviewBelongsToCorrectUser(req, res, next);
  });

  test("Fails if user2 tries to update a recipe review created by user1", async function() {
    const req = { params: {reviewId: 1} };
    const res = { locals: { user: { id: 2, username: "user2", email: "user2@gmail.com" } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
    await ensureRecipeReviewBelongsToCorrectUser(req, res, next); 
  });
});

describe("ensureRemixBelongsToCorrectUser works as intended", function() {
  test("Passes if user1 tries to update recipe 2.1 remix since user1 is the author of this remix", async function() {
    const req = { params: {remixId: 1} };
    const res = { locals: { user: { id: 1, username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }
    await ensureRemixBelongsToCorrectUser(req, res, next);
  });

  test("Fails if user2 tries to update recipe 2.1 remix since it was created by user1", async function() {
    const req = { params: {remixId: 1} };
    const res = { locals: { user: { id: 2, username: "user2", email: "user2@gmail.com" } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
    await ensureRemixBelongsToCorrectUser(req, res, next); 
  });
});

describe("ensureRemixReviewBelongsToCorrectUser works as intended", function() {
  test("Passes if user1 tries to update the recipe 1.1 remix review (id 1) since user1 created that review", async function() {
    const req = { params: {reviewId: 1} };
    const res = { locals: { user: { id: 1, username: "user1", email: "user1@gmail.com" } } };
    const next = function (err) {
      expect(err).toBeFalsy();
    }
    await ensureRemixReviewBelongsToCorrectUser(req, res, next);
  });

  test("Fails if user2 tries to update the remix review created by user1", async function() {
    const req = { params: {reviewId: 1} };
    const res = { locals: { user: { id: 2, username: "user2", email: "user2@gmail.com" } } };
    const next = function (err) {
      expect(err instanceof ForbiddenError).toBeTruthy();
    }
    await ensureRemixReviewBelongsToCorrectUser(req, res, next); 
  });
});

