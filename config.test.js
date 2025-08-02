/* Tests the configuration settings.
Sets custom process.env environmental variables and tests to see
if they're correctly attributed to variables defined in config.js. 
Also tests the correctness of the getDatabaseUri function.*/


describe("config.js variables correctly come from process.env", function() {
  test("Config variables have the correct values in non-test mode", function() {
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5001";
    process.env.TEST_DATABASE_URL = "the-test-database";
    process.env.DATABASE_URL = "the-real-database";
    process.env.NODE_ENV = "other";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5001);
    expect(config.getDatabaseUri()).toEqual("the-real-database");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.TEST_DATABASE_URL;
    delete process.env.DATABASE_URL;

    process.env.NODE_ENV = "test";
  });

  test("Databse URL has the correct values in test mode", function() {
    //by default, process.env.NODE_ENV starts out as test.
    process.env.TEST_DATABASE_URL = "the-test-database";
    process.env.DATABASE_URL = "the-real-database";

    const config = require("./config");
    expect(config.getDatabaseUri()).toEqual("the-test-database");

    delete process.env.TEST_DATABASE_URL;
    delete process.env.DATABASE_URL;
  });
});

