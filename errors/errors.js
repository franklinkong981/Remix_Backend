/* This file contains classes for errors that will be returned from Express if any request results in an error.
There is the generic error called expressError that is designed to return a custom status code and error message.
Then there are more specific errors with specific status codes and customizable error messages that inherit from the expressError class.
*/

// Generic error with custom message and status code, generic error handler in app.js will supply default status code of 500. 
class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

// 404 Not Found error: The requested resource was not found.
class NotFoundError extends ExpressError {
  constructor(message = "Not Found") {
    super(message, 404);
  }
}

// 401 Unauthorized error: The user does not have valid authentication, in this app usually because user making request isn't logged in.
class UnauthorizedError extends ExpressError {
  constructor(message = "Unauthorized, missing valid authentication") {
    super(message, 401);
  }
}

// 400 Bad Request error: Request either contains missing body parameters or invalid body parameters that don't follow the correct format.
class BadRequestError extends ExpressError {
  constructor(message = "Bad Request, missing/invalid parameters") {
    super(message, 400);
  }
}

// 403 Unauthorized Request error: Error due to lack of permissions; ex. user can be logged in but isn't an admin.
class ForbiddenError extends ExpressError {
  constructor(message = "You do not have permission to access this resource") {
    super(message, 403);
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError
};