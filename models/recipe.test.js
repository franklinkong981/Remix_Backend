/* This file tests the model methods for the Recipe model, tests the robustness and correctness of operations regarding Recipe data
like returning information on all recipes, adding a recipe, updating recipe data, etc. */

const {NotFoundError, BadRequestError, UnauthorizedError} = require("../errors/errors.js");
const db = require("../db.js");
const Recipe = require("./recipe.js");
const {commonBeforeAll, commonBeforeEach, commonAfterEach, commonAfterAll} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** getAllRecipesBasicInfo */

describe("getAllRecipesBasicInfo works as intended", function() {
  test("Successfully fetches basic info of all recipes and returns them sorted by name in alphabetical order", async function() {
    const allRecipes = await Recipe.getAllRecipesBasicInfo();
    expect(allRecipes.length).toEqual(3);
    expect(allRecipes[0].name).toEqual("recipe 1.1");
    expect(allRecipes[1].name).toEqual("recipe 1.2");
    expect(allRecipes[2].name).toEqual("recipe 2.1");
    expect(allRecipes[0].description).toEqual("The first recipe by user 1");
    expect(allRecipes[0].imageUrl).toEqual(expect.any(String));
    expect(allRecipes[0].createdAt).toEqual(expect.any(Date));
  });
});

/************************************** searchRecipes */

describe("searchRecipes works as intended", function() {
  test("Successfully fetches only the recipes that match the search term inputted", async function() {
    const searchResults = await Recipe.searchRecipes("1.1");
    expect(searchResults.length).toEqual(1);
    expect(searchResults[0].name).toEqual("recipe 1.1");
    expect(searchResults[0].description).toEqual("The first recipe by user 1");
    expect(searchResults[0].imageUrl).toEqual(expect.any(String));
    expect(searchResults[0].createdAt).toEqual(expect.any(Date));
  });

  test("Returns recipes in alphabetical order if there are multiple search results", async function() {
    const searchResults = await Recipe.searchRecipes("recipe");
    expect(searchResults.length).toEqual(3);
    expect(searchResults[0].name).toEqual("recipe 1.1");
    expect(searchResults[1].name).toEqual("recipe 1.2");
    expect(searchResults[2].name).toEqual("recipe 2.1");
  });

  test("Returns no search results but does not throw error if no recipes match the search term", async function() {
    const searchResults = await Recipe.searchRecipes("pork");
    expect(searchResults.length).toEqual(0);
  });
});

/************************************** getRemixes */

describe("getRemixes works as intended", function() {
  test("Successfully fetches all remixes of a given recipe id", async function() {
    const recipe1AllRemixes = await Recipe.getRemixes(1);
    expect(recipe1AllRemixes.length).toEqual(1);
    expect(recipe1AllRemixes[0].name).toEqual("recipe 1.1 remix");
    expect(recipe1AllRemixes[0].description).toEqual("The remixed first recipe by user 1");
    expect(recipe1AllRemixes[0].imageUrl).toEqual(expect.any(String));
    expect(recipe1AllRemixes[0].createdAt).toEqual(expect.any(Date));
  });

  test("Throws NotFoundError if the recipe id isn't found in the database", async function() {
    try {
      await Recipe.getRemixes(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The recipe with id of 100 was not found in the database.");
    }
  });
});