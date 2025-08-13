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

