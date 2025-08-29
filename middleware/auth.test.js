/** Contains tests for the middleware functions, all of which have to do with authentication. */

const jwt = require("jsonwebtoken");
const {UnauthorizedError} = require("../errors/errors.js");
const {authenticateJwt, ensureLoggedIn, ensureIsCorrectUser} = require("./auth.js");

const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "user1", email: "user1@gmail.com" }, SECRET_KEY);
const badJwt = jwt.sign({ username: "user2", email: "user2@gmail.com" }, "wrong_key");

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

