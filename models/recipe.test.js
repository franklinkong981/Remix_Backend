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

/************************************** getRecipeReviews */

describe("getRecipeReviews works as intended", function() {
  test("Successfully fetches both of recipe 2.1's reviews if no limit is supplied in alphabetical order of review title", async function() {
    const recipe3AllReviews = await Recipe.getRecipeReviews(3);
    expect(recipe3AllReviews.length).toEqual(2);
    
    expect(recipe3AllReviews[0].reviewAuthor).toEqual("user1");
    expect(recipe3AllReviews[0].title).toEqual("Another delicious recipe!");
    expect(recipe3AllReviews[0].content).toEqual("I make this all the time!");
    expect(recipe3AllReviews[0].createdAt).toEqual(expect.any(Date));

    expect(recipe3AllReviews[1].reviewAuthor).toEqual("user2");
    expect(recipe3AllReviews[1].title).toEqual("My second favorite!");
  });

  test("Only fetches the first of recipe 2.1's reviews (by user 1) if a limit of 1 is supplied", async function() {
    const recipe3LimitedReviews = await Recipe.getRecipeReviews(3, 1);
    expect(recipe3LimitedReviews.length).toEqual(1);

    const firstReview = recipe3LimitedReviews[0];
    expect(firstReview.reviewAuthor).toEqual("user1");
  });

  test("Throws 404 NotFoundError if the recipeId supplied cannot be found in the database", async function() {
    try {
      await Recipe.getRecipeReviews(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The recipe with id of 100 was not found in the database.")
    }
  });
});

/************************************** getRecipeDetails */

describe("getRecipeDetails works as intended", function() {
  test("Successfully fetches all correct detailed information on recipe 2.1", async function() {
    const recipe3Details = await Recipe.getRecipeDetails(3);
    expect(recipe3Details.recipeAuthor).toEqual("user2");
    expect(recipe3Details.name).toEqual("recipe 2.1");
    expect(recipe3Details.description).toEqual("The first recipe by user 2");
    expect(recipe3Details.ingredients).toContain("pork");
    expect(recipe3Details.directions).toContain("oven");
    expect(recipe3Details.cookingTime).toEqual(120);
    expect(recipe3Details.servings).toEqual(3);
    expect(recipe3Details.imageUrl).toEqual(expect.any(String));
    expect(recipe3Details.createdAt).toEqual(expect.any(Date));

    expect(recipe3Details.remixes.length).toEqual(1);
    expect(recipe3Details.remixes[0].name).toEqual("recipe 2.1 remix");

    expect(recipe3Details.reviews.length).toEqual(2);
    expect(recipe3Details.reviews[0].reviewAuthor).toEqual("user1");
    expect(recipe3Details.reviews[1].reviewAuthor).toEqual("user2");
    expect(recipe3Details.reviews[0].title).toEqual("Another delicious recipe!");
    expect(recipe3Details.reviews[1].title).toEqual("My second favorite!");
  });

  test("Only one review (the review by user 1) is fetched when a limit of 1 is supplied", async function() {
    const recipe3Details = await Recipe.getRecipeDetails(3, 1);
    expect(recipe3Details.reviews.length).toEqual(1);
    expect(recipe3Details.reviews[0].reviewAuthor).toEqual("user1");
    expect(recipe3Details.reviews[0].title).toEqual("Another delicious recipe!");
  });

  test("Throws 404 NotFoundError if the recipeId supplied cannot be found in the database", async function() {
    try {
      await Recipe.getRecipeDetails(100);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
      expect(err.status).toEqual(404);
      expect(err.message).toEqual("The recipe with id of 100 was not found in the database.");
    }
  });
});

/************************************** addRecipe */
describe("addRecipe works as intended", function() {
  test("Successfully adds the recipe with custom cookingTime, servings, and imageUrl", async function() {
    let allRecipes = await Recipe.getAllRecipesBasicInfo();
    expect(allRecipes.length).toEqual(3);

    const newRecipeDetails = await Recipe.addRecipe(1, {
      name: 'recipe 1.3',
      description: 'The third recipe by user 1',
      ingredients: 'Bananas, apples, oranges',
      directions: 'Put all fruits into a pot and cook!',
      cookingTime: 20,
      servings: 4,
      imageUrl: 'http://recipe4.img'
    });
    expect(newRecipeDetails.name).toEqual('recipe 1.3');
    expect(newRecipeDetails.cookingTime).toEqual(20);
    expect(newRecipeDetails.servings).toEqual(4);
    expect(newRecipeDetails.imageUrl).toEqual('http://recipe4.img');

    allRecipes = await Recipe.getAllRecipesBasicInfo();
    expect(allRecipes.length).toEqual(4);
  });

  test("Successfully adds the recipe with no cookingTime, servings, nor imageUrl, they should all be null by default", async function() {
    let allRecipes = await Recipe.getAllRecipesBasicInfo();
    expect(allRecipes.length).toEqual(3);

    const newRecipeDetails = await Recipe.addRecipe(1, {
      name: 'recipe 1.3',
      description: 'The third recipe by user 1',
      ingredients: 'Bananas, apples, oranges',
      directions: 'Put all fruits into a pot and cook!'
    });
    expect(newRecipeDetails.name).toEqual('recipe 1.3');
    expect(newRecipeDetails.cookingTime).toBeNull();
    expect(newRecipeDetails.servings).toBeNull();
    //ensure by default the imageUrl is the default value.
    expect(newRecipeDetails.imageUrl).toEqual('https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg');

    allRecipes = await Recipe.getAllRecipesBasicInfo();
    expect(allRecipes.length).toEqual(4);
  });

  test("Throws BadRequestError upon wrong recipe name length", async function() {
    try {
      await Recipe.addRecipe(1, {
        name: 'This recipe name is over 100 characters long. It is too long to fit into the database, hopefully this results in an error.',
        description: 'The third recipe by user 1',
        ingredients: 'Bananas, apples, oranges',
        directions: 'Put all fruits into a pot and cook!'
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
      expect(err.status).toEqual(400);
      expect(err.message).toEqual("The name of the recipe must be between 1 and 100 characters long.");
    }
  });
});