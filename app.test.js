/* Test the functionality of app.js, the main Express file of the Remix app.
Specifically tests that its 404 error handler (and possibly generic error handler) is working properly.
When a request is sent to a URI that doesn't exist on this backend server, a NotFoundError with status code 404 
as defined in the errors folder should be returned.
May be updated in the future to test the generic error handler in app.js as well. */

const request = require("supertest");

const app = require("./app.js");
const db = require("./db.js");
const Test = require("supertest/lib/test");

test("Invalid URI correctly results in 404 NotFoundError", async function() {
  const resp = await request(app).get("/make-believe-path");
  //console.log(resp);
  expect(resp.statusCode).toEqual(404);
  expect(resp.res.statusMessage).toEqual("Not Found");
});

test("Invalid URI with process.env.NODE_ENV != test correctly results in 404 NotFoundError with error stack print", async function() {
  process.env.NODE_ENV = "";
  const resp = await request(app).get("/make-believe-path");
  expect(resp.statusCode).toEqual(404);
  expect(resp.res.statusMessage).toEqual("Not Found");
  delete process.env.NODE_ENV;
});

//Closes connection with database at end of testing.
afterAll(function() {
  db.end();
});