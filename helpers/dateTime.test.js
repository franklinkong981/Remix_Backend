/* Tests for the helpers/dateTime helper functions related to timestamps.
Currently tests both functions in dateTime.js: convertToReadableDateTime and changeCreatedAtAttribute. */

const {convertToReadableDateTime, changeCreatedAtAttribute} = require("./dateTime.js");

describe("convertToReadableDateTime works as intended", function () {
  test("Successfully converts a regular SQL timestamp to a readable string corresponding to the correct date and time", function() {
    let readableDateTime = convertToReadableDateTime("2025-08-02 8:59:01.472785");
    expect(readableDateTime).toEqual("August 2, 2025 at 8:59am");
    readableDateTime = convertToReadableDateTime("2020-01-18 8:59:01.472785");
    expect(readableDateTime).toEqual("January 18, 2020 at 8:59am");
  });
  test("Works for pm hours", function() {
    let readableDateTime = convertToReadableDateTime("2025-08-02 15:59:01.472785");
    expect(readableDateTime).toEqual("August 2, 2025 at 3:59pm");
  });
  test("Works for single digit minutes", function() {
    let readableDateTime = convertToReadableDateTime("2025-08-02 15:08:01.472785");
    expect(readableDateTime).toEqual("August 2, 2025 at 3:08pm");
  });
  test("Works for 12am and 12pm", function() {
    let readableDateTime = convertToReadableDateTime("2025-08-02 00:08:01.472785");
    expect(readableDateTime).toEqual("August 2, 2025 at 12:08am");
    readableDateTime = convertToReadableDateTime("2025-08-02 12:08:01.472785");
    expect(readableDateTime).toEqual("August 2, 2025 at 12:08pm");
  });
});

describe("changeCreatedAtAttribute works as intended", function() {
  test("Successfully converts an object's createdAt attribute from timestamp to correct readable datestring", function() {
    let objectWithCreatedAtTimestamp = {
      name: "Ted",
      country: "USA",
      createdAt: "2020-01-18 8:59:01.472785"
    };
    let objectWithCreatedAtString = changeCreatedAttribute(objectWithCreatedAtTimestamp);
    expect(objectWithCreatedAtString.createdAt).toEqual("January 18, 2020 at 8:59am");
  });
  test("Returns the same object if there is no createdAt attribute", function() {
    let objectWithoutCreatedAtTimestamp = {
      name: "Ted",
      country: "USA"
    };
    let returnedObject = changeCreatedAttribute(objectWithoutCreatedAtTimestamp);
    expect(returnedObject).toEqual({
      name: "Ted",
      country: "USA"
    });
  });
});