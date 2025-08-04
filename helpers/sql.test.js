/* This is the file that tests the helper function sql helper functions. 
Currently is only testing the sqlForPartialUpdate function. */

const {sqlForPartialUpdate} = require("./sql.js");
const { BadRequestError} = require("../errors/errors.js");

describe("sqlForPartialUpdate function behaves as intended", function() {
  test("It works for a regular case", function() {
    const dataToUpdate = {
      firstName: "Hilda",
      lastName: "Pearson",
      email: "hildapearson981@gmail.com"
    };
    const jsToSql = {
      firstName: "first_name",
      lastName: "last_name"
    }
    result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: `"first_name"=$1, "last_name"=$2, "email"=$3`,
      values: ["Hilda", "Pearson", "hildapearson981@gmail.com"]
    });
  });
  test("It works even if jsToSql is empty", function() {
    const dataToUpdate = {
      email: "hildapearson981@gmail.com"
    };
    const jsToSql = {};
    result = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(result).toEqual({
      setCols: `"email"=$1`,
      values: ["hildapearson981@gmail.com"]
    });
  });
  test("Empty dataToUpdate object returns BadRequestError", function() {
    const dataToUpdate = {};
    const jsToSql = {};
    try {
      result = sqlForPartialUpdate(dataToUpdate, jsToSql);
      fail(); //if we reach this point, test fails automatically, there should've been an error returned in the previous line.
    } catch(err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
    }
  });
});