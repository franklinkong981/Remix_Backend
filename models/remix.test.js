/* This file tests the model methods for the Remix model, tests the robustness and correctness of operations regarding Remix data
like returning detailed information on a remix, adding a remix, updating remix data, etc. */

const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors/errors.js");
const db = require("../db.js");
const Recipe = require("./recipe.js");
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

/************************************** getRemixDetails */

describe("getRemixDetails works as intended", function() {
  test("Successfully fetches all correct detailed information on remix 1, aka the recipe 2.1 remix", async function() {
    const remix1Details = await Remix.getRemixDetails(1);
    expect(remix1Details.remixAuthor).toEqual("user1");
    expect(remix1Details.purpose).toContain("meat");
    expect(remix1Details.name).toEqual("recipe 2.1 remix");
    expect(remix1Details.description).toEqual("The remixed first recipe by user 2");
    expect(remix1Details.originalRecipe).toEqual("recipe 2.1");
    expect(remix1Details.ingredients).toContain("mutton");
    expect(remix1Details.directions).toContain("all the meats");
    expect(remix1Details.cookingTime).toEqual(expect.any(Number));
    expect(remix1Details.servings).toEqual(expect.any(Number));
    expect(remix1Details.imageUrl).toEqual(expect.any(String));
    expect(remix1Details.createdAt).toEqual(expect.any(Date));

    expect(remix1Details.reviews.length).toEqual(2);
    expect(remix1Details.reviews[0].reviewAuthor).toEqual("user2");
    expect(remix1Details.reviews[1].reviewAuthor).toEqual("user1");
    expect(remix1Details.reviews[0].title).toEqual("I love meat!");
    expect(remix1Details.reviews[1].title).toEqual("New meat is good");
  });

  test("Only one review of the recipe 2.1 remix (the review by user 2) is fetched when a limit of 1 is supplied", async function() {
    const remix1Details = await Remix.getRemixDetails(1, 1);
    expect(remix1Details.reviews.length).toEqual(1);
    expect(remix1Details.reviews[0].reviewAuthor).toEqual("user2");
    expect(remix1Details.reviews[0].title).toEqual("I love meat!");
  });

  test("Throws 404 NotFoundError if the remixId supplied cannot be found in the database", async function() {
    try {
      await Remix.getRemixDetails(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The remix with id of 100 was not found in the database.");
    }
  });
});

/************************************** addRemix */
describe("addRemix works as intended", function() {
  test("Successfully adds a new remix of recipe 1.1 by user 1 with custom cookingTime, servings, and imageUrl", async function() {
    let recipe1AllRemixes = await Recipe.getRemixes(1);
    expect(recipe1AllRemixes.length).toEqual(1);

    const newRemixDetails = await Remix.addRemix(1, 1, {
      name: 'recipe 1.1 with meat',
      description: 'Remix of recipe 1.1 by user 1',
      purpose: 'Just some vegetables is not enough, add some meat!',
      ingredients: 'Onions, celery, garlic, chicken',
      directions: 'Put everything in a pot and let it cook',
      cookingTime: 45,
      servings: 4,
      imageUrl: 'http://remix-meat.img'
    });
    expect(newRemixDetails.name).toEqual('recipe 1.1 with meat');
    expect(newRemixDetails.purpose).toContain('add some meat!');
    expect(newRemixDetails.ingredients).toContain("chicken");
    expect(newRemixDetails.cookingTime).toEqual(45);
    expect(newRemixDetails.imageUrl).toEqual('http://remix-meat.img');

    recipe1AllRemixes = await Recipe.getRemixes(1)
    expect(recipe1AllRemixes.length).toEqual(2);
  });

  test("Successfully adds the remix with no cookingTime, servings, nor imageUrl, they should all have default values", async function() {
    let recipe1AllRemixes = await Recipe.getRemixes(1);
    expect(recipe1AllRemixes.length).toEqual(1);

    const newRemixDetails = await Remix.addRemix(1, 1, {
      name: 'recipe 1.1 with meat',
      description: 'Remix of recipe 1.1 by user 1',
      purpose: 'Just some vegetables is not enough, add some meat!',
      ingredients: 'Onions, celery, garlic, chicken',
      directions: 'Put everything in a pot and let it cook',
      imageUrl: ''
    });
    expect(newRemixDetails.name).toEqual('recipe 1.1 with meat');
    expect(newRemixDetails.cookingTime).toEqual(0);
    expect(newRemixDetails.servings).toEqual(0);
    //ensure by default the imageUrl is the default value.
    expect(newRemixDetails.imageUrl).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg');

    recipe1AllRemixes = await Recipe.getRemixes(1);
    expect(recipe1AllRemixes.length).toEqual(2);
  });

  test("Throws BadRequestError upon wrong remix name length", async function() {
    try {
      await Remix.addRemix(1, 1, {
        name: 'This remix name is over 100 characters long. It is too long to fit into the database, hopefully this results in an error.',
        description: 'Remix of recipe 1.1 by user 1',
        purpose: 'Just some vegetables is not enough, add some meat!',
        ingredients: 'Onions, celery, garlic, chicken',
        directions: 'Put everything in a pot and let it cook',
        imageUrl: ''
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The name of the remix must be between 1 and 100 characters long.");
    }
  });

  test("Throws BadRequestError upon wrong negative cooking time and/or servings", async function() {
    try {
      await Remix.addRemix(1, 1, {
        name: 'Recipe 1.1 with meat',
        description: 'Remix of recipe 1.1 by user 1',
        purpose: 'Just some vegetables is not enough, add some meat!',
        ingredients: 'Onions, celery, garlic, chicken',
        directions: 'Put everything in a pot and let it cook',
        cookingTime: -25,
        imageUrl: ''
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The cooking time cannot be negative.");
    }
  });
});

/************************************** updateRemix */
describe("updateRemix works as intended", function() {
  test("Partially updates the recipe 1.1 remix (id 2) without issue", async function() {
    let remix1Details = await Remix.getRemixDetails(2);
    expect(remix1Details.ingredients).toContain("garlix");
    expect(remix1Details.servings).toEqual(4);
    const updatedRemix = await Remix.updateRemix(2, {ingredients: "Onions, celery, garlic, tomatoes", servings: 6});
    expect(updatedRemix.name).toEqual("recipe 1.1 remix");
    expect(updatedRemix.ingredients).toContain("garlic");
    expect(updatedRemix.servings).toEqual(6);
    remix1Details = await Remix.getRemixDetails(2);
    expect(remix1Details.ingredients).toContain("garlic");
  });

  test("Throws a BadRequestError if the updated name is an empty string", async function() {
    try {
      await Remix.updateRemix(2, {name: "", servings: 6});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The updated name of the remix must be between 1 and 100 characters long.");
    }
  });

  test("Throws a BadRequestError if the cooking time or any other number input is negative", async function() {
    try {
      await Remix.updateRemix(2, {cookingTime: -100});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The updated cooking time cannot be negative.");
    }
  });

  test("Changes imageUrl to default value if it's an empty string", async function() {
    const updatedRemix = await Remix.updateRemix(2, {imageUrl: ""});
    expect(updatedRemix.imageUrl).toEqual("https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg");
  });

  test("Throws a 404 NotFoundError if the remix with id of remixId cannot be found in the database", async function() {
    try {
      await Remix.updateRemix(100, {name: "The updated remix that does not exist."});
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The remix with id of 100 was not found in the database.");
    }
  });
});