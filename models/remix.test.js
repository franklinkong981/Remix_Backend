/* This file tests the model methods for the Remix model, tests the robustness and correctness of operations regarding Remix data
like returning detailed information on a remix, adding a remix, updating remix data, etc. */

const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors/errors.js");
const db = require("../db.js");
const Remix = require("./remix.js");
const {commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** getRemixReviews */

describe("getRemixReviews works as intended", function() {
  test("Successfully fetches both reviews for the recipe 2.1 remix if no limit is supplied in alphabetical order of review title", async function() {
    const remix1AllReviews = await Remix.getRemixReviews(1);
    expect(remix1AllReviews.length).toEqual(2);
    
    expect(remix1AllReviews[0].reviewAuthor).toEqual("user2");
    expect(remix1AllReviews[0].title).toEqual("I love meat!");
    expect(remix1AllReviews[0].content).toEqual("I'm going add another meat to this remix later.");
    expect(remix1AllReviews[0].createdAt).toEqual(expect.any(Date));

    expect(remix1AllReviews[1].reviewAuthor).toEqual("user1");
    expect(remix1AllReviews[1].title).toEqual("New meat is good");
  });

  test("Only fetches the first review of the recipe 2.1 remix if a limit of 1 is supplied (review by user2)", async function() {
    const remix1LimitedReviews = await Remix.getRemixReviews(1, 1);
    expect(remix1LimitedReviews.length).toEqual(1);

    const firstReview = remix1LimitedReviews[0];
    expect(firstReview.reviewAuthor).toEqual("user2");
  });

  test("Throws 404 NotFoundError if the remixId supplied cannot be found in the database", async function() {
    try {
      await Remix.getRemixReviews(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The remix with id of 100 was not found in the database.")
    }
  });
});