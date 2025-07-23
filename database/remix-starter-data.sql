INSERT INTO users (username, email, hashed_password)
VALUES 
('the_admin', 'admin@springboard.com', '$2b$12$3W0BD66vJvGBXyQSo8VJk.0saKICmPE14lCfCFwM2ezSq22VtS.Q6'),
('second_admin', 'admin2@springboard.com', '$2b$12$ZNHGCeoRibSQklQ9weDRnOELgNMyz9QBxO4ags10lsXZfPRHjp2RK');

-- the_admin password: admin_password
-- second_admin password: admin2_password

INSERT INTO recipes (user_id, name, description, ingredients, directions, cooking_time, servings, image_url)
VALUES
(1, 'Albacore Tuna Sliders', 
'Features a seared whole piece of tuna loin that''s seared on a grill and then cut into slices and slid into brioche buns.',
'1 pound albacore tuna loin (ask for a piece off the front end, for even thickness),
  2 tablespoons soy sauce,
  2 tablespoons extra-virgin olive oil,
  2 tablespoons Northwest Seafood Seasoning,
  1/2 teaspoon crushed red pepper flakes,
  Slider buns, brioche, if possible,
  1 medium heirloom tomato or other ripe beefsteak tomato, thinly sliced,
  Arugula leaves, rinsed and dried,
  Tartar sauce, such as Pike Place Fish Smoked Walla Walla Onion Tartar Sauce',
'Remove the skin from the tuna and score the flesh every inch with a knife, as if you were making steaks. 
  Repeat on all sides, but make sure not to cut all the way through.
  Mix the soy sauce, olive oil, seafood seasoning, and red pepper flakes in a small bowl. 
  Using a basting brush, brush the mixture on all sides of the tuna, making sure to get some marinade inside the scored parts of the fish, so it''s well coated. Marinate at room temperature for 15 to 20 minutes.
  Preheat a grill to high. Make sure the grates are clean and well oiled. 
  Put the tuna directly on the grill and cook for about 2 to 3 minutes on each side, or 6 minutes total for rare. 
  During the last minute of cooking, toast the buns on the grill. 
  Slice the tuna into four sections along score lines. 
  Serve on the buns with sliced tomato, arugula, and your favorite condiment.',
NULL, 4, 'https://assets.epicurious.com/photos/5aeb6e8ecd4694640994c6c1/1:1/w_1920,c_limit/tuna-sliders-recipe-050318.jpg'),
(1, 'Crunchy Chili Onion Rings', 'These are great with salsa.',
'3 cups all purpose flour,
  2 tablespoons chili powder,
  4 1/2 teaspoons salt,
  1 12-ounce bottle dark beer (preferably Mexican),
  12 6-inch corn tortillas, coarsely torn,
  2 large onions, peeled,
  Vegetable oil (for deep-frying)',
'Mix flour, chili powder, and salt in medium bowl. Pour beer into small bowl. 
  Finely grind tortillas in processor; transfer to deep bowl.
  Line large baking sheet with foil. 
  Cut onions crosswise into 1/2- to 3/4-inch-thick rounds. Separate rounds into rings. 
  Dip 1 onion ring into flour mixture, then beer, flour again and beer again, then add to bowl with ground tortillas and toss to coat. 
  Using wooden skewer, transfer coated ring to sheet of foil. Repeat with remaining onion rings.
  Pour oil into heavy large skillet to depth of 1 inch. 
  Rest top of deep-fry thermometer against edge of skillet, submerging bulb end in oil. 
  Heat oil to 370-380 degrees F. 
  Fry onion rings, 4 at a time until golden brown, maintaining temperature, about 3 minutes per batch. 
  Using slotted spoon, transfer to paper towels to drain.',
30, 4, 'https://assets.bonappetit.com/photos/57b14e61f1c801a1038bdd50/1:1/w_1920,c_limit/mare_crunchy_chili_onion_rings_h.jpg'),
(1, 'Mashed Sweet Potatoes', 'A sweet take on the popular side dish',
'6 lb. sweet potatoes (about 12),
  1/2 cup (1 stick) unsalted butter, melted,
  1/2 cup heavy cream or half-and-half, warmed,
  2 Tbsp. pure maple syrup,
  1 tsp. Diamond Crystal or 1/2 tsp. plus 1/8 tsp. Morton kosher salt,
  1/2 tsp. freshly ground black pepper',
'Place rack in lower third of oven and preheat oven to 400 degrees. Line a large rimmed baking sheet with aluminum foil.
  Prick 6 lb. or about 12 sweet potatoes, two times each, with a fork and transfer to prepared baking sheet. 
  Cook sweet potatoes in the oven until very tender, about 1 hour. Remove and cool slightly.
  Halve potatoes lengthwise and scoop out warm flesh into a large bowl. 
  Mash potatoes with a potato masher or, for a smoother puree, force through a potato ricer. 
  Stir in 0.5 cup (1 stick) unsalted butter, melted, 0.5 cup heavy cream or half-and-half, warmed, 2 Tbsp. pure maple syrup, 1 tsp. Diamond Crystal or 0.5 tsp. plus 1/8 tsp. Morton kosher salt, and 0.5 tsp. freshly ground black pepper. 
  Keep warm.
  ALSO: Mashed sweet potatoes can be made 2 days ahead and chilled in an airtight container. Reheat in a 350 degree oven or a microwave.',
NULL, 10, 'https://assets.epicurious.com/photos/64e67cc1709a7ec6701c4b38/1:1/w_1920,c_limit/Mashed-Sweet-Potatoes_Recipe_2056.jpg'),
(1, 'Fried Oysters with Bacon, Garlic, and Sage', 
'If you like seafood, you''ll love this!',
'2 cups rice flour
  1 tablespoon Diamond Crystal or 2 teaspoons Morton kosher salt,
  1/2 teaspoon cayenne pepper,
  24 large oysters, shucked,
  4 ounces slab bacon, cut into 1x1/4-inch pieces,
  1 cup (2 sticks) unsalted butter, divided,
  6 garlic cloves, smashed, divided,
  8 sage leaves,
  Spicy mustard or hot sauce (for serving)',
'Whisk rice flour, salt, and cayenne in a medium bowl. 
  Toss oysters in flour mixture to coat well, then top with a thin layer of dredge (make sure that none of the oysters are peeking out). 
  Cover with plastic wrap and chill in dredge until ready to fry.
  Cook bacon in a large skillet, preferably cast iron, over medium-low, stirring occasionally, until bacon is browned and crisp, 12-15 minutes. 
  Transfer bacon to a small bowl with a slotted spoon.
  Pour half of bacon fat into a small heatproof bowl or measuring cup and set aside. 
  Add 1/2 cup butter to drippings in skillet and heat over medium-high. 
  As soon as butter is foaming, remove half of oysters from dredge and shake off any excess. 
  Add to skillet along with 3 garlic cloves and cook, gently shaking skillet to baste oysters with fat and turning oysters occasionally, until golden brown and crisp all over, about 5 minutes. 
  Using a slotted spoon, transfer oysters and garlic to paper towels and let drain.
  Pour off fat in skillet; discard. Wipe out skillet and return to medium-high. 
  Heat remaining 1/2 cup butter and reserved bacon fat in skillet. 
  As soon as butter is foaming, repeat process with remaining oysters and garlic. Transfer to paper towels and let drain.
  Cook sage in same skillet just until crisp, about 30 seconds. Transfer to paper towels.
  Arrange oysters and garlic on a platter and top with fried sage and bacon. Serve with mustard.
  Oysters can be dredged 4 hours ahead. Keep chilled.',
NULL, 8, 'https://assets.epicurious.com/photos/59233d7bbb553a5f5751b90e/1:1/w_1920,c_limit/fried-oysters-with-bacon-garlic-and-sage-BA-052217.jpg'),
(2, 'Lamb Bulgogi with Asian Pear Dipping Sauce', 
'Bulgogi (grilled marinated beef) is a traditional Korean dish. Here, lamb stands in for the steak. The meat is served with lettuce leaves and other veggies.',
'4 green onions, coarsely chopped,
  3 tablespoons sugar,
  3 garlic cloves, coarsely chopped,
  1 2-inch piece fresh ginger, peeled, cut into thin rounds,
  2/3 cup soy sauce,
  2/3 cup mirin (sweet Japanese rice wine),
  1/3 cup Asian sesame oil,
  2 tablespoons toasted sesame seeds,
  1 teaspoon freshly ground black pepper,
  1 boned butterflied leg of lamb (about 5 1/2 pounds; from one 6 1/2- to 7-pound bone-in leg), trimmed of excess fat,
  1 cup chopped peeled cored Asian pear (about 1/2 large),
  10 green onions; 2 chopped, 8 trimmed,
  1/2 cup soy sauce,
  1/2 cup mirin (sweet Japanese rice wine),
  3 tablespoons sugar,
  3 tablespoons Asian sesame oil,
  4 tablespoons toasted sesame seeds, divided,
  Nonstick vegetable oil spray,
  8 jalape\u00f1o chiles, halved (seeded, if desired),
  8 garlic cloves, peeled,
  1/2 cup kochujang (Korean hot pepper paste),
  1 large head of butter lettuce, leaves separated and left whole,
  3 metal skewers or bamboo skewers soaked in water at least 1 hour',
'Place green onions, sugar, chopped garlic, and sliced ginger in processor and blend until finely chopped, stopping occasionally to scrape down sides of bowl. Transfer mixture to medium bowl. 
  Add soy sauce, mirin, Asian sesame oil, toasted sesame seeds, and black pepper; whisk marinade to blend. 
  Pour 1 cup marinade into 15x10x2-inch glass baking dish. Open boned leg of lamb like book; add to baking dish, arranging in single layer. 
  Pour remaining marinade over lamb, spreading to cover evenly. 
  Cover and refrigerate at least 4 hours and up to 1 day, turning lamb occasionally.
  Puree Asian pear and chopped green onions in processor until smooth. 
  Add soy sauce, mirin, and sugar and process until sugar dissolves. 
  Add Asian sesame oil and 2 tablespoons toasted sesame seeds; process until sesame oil is incorporated (most sesame seeds will remain intact). 
  Transfer sauce to 2-cup measuring cup. Season sauce to taste with salt and pepper. 
  DO AHEAD: Dipping sauce can be made 1 day ahead. Cover and refrigerate.
  Coat grill rack with nonstick spray; prepare barbecue (medium heat). Thread jalapeno chile halves onto 2 metal skewers, dividing equally. 
  Thread garlic cloves onto another metal skewer, spacing slightly apart. 
  Place jalapeno and garlic skewers on plate and set aside.
  Remove lamb from marinade and place on prepared grill with some marinade still clinging to surface (discard marinade in dish). 
  Grill lamb until meat is cooked to desired doneness, about 15 to 20 minutes per side for medium (if lamb begins to burn, slide large sheet of heavy-duty aluminum foil underneath and continue to grill). 
  Transfer lamb to work surface and let rest 10 minutes.
  While lamb rests, grill jalapenos, garlic, and trimmed green onions until slightly charred and tender, 3 to 4 minutes per side. Transfer to work surface.
  Place kochujang (hot pepper paste) in small bowl. Stir dipping sauce and divide among 8 small dishes. 
  Arrange butter lettuce leaves on large serving platter to cover. 
  Thinly slice grilled lamb and arrange over lettuce leaves. 
  Cut garlic cloves lengthwise in half. 
  Cut green onions into 2-inch pieces. 
  Arrange jalapenos, garlic, and green onions around lamb. 
  Sprinkle remaining 2 tablespoons toasted sesame seeds over lamb. 
  Serve grilled lamb and vegetables with hot pepper paste. 
  Allow guests to spread very small amounts of kochujang over lettuce leaves, arrange lamb and vegetables in lettuce leaves, then wrap filling with lettuce leaves and dip into sauce.',
NULL, 8, 'https://assets.bonappetit.com/photos/57afeff353e63daf11a4e825/master/w_1280,c_limit/mare_lamb_bulgogi_with_asian_pear_dipping_sauce_v.jpg'),
(2, 'One-pan Chicken Drumsticks with Rice and Beans', 
'Clean out your pantry with this customizable one-pan dinner that can be seasoned with whatever spices you happen to have on hand.',
'8 chicken drumsticks,
  2 1/2 tsp. kosher salt, divided,
  1 tsp. freshly ground black pepper,
  3 Tbsp. extra-virgin olive oil,
  1 onion, finely chopped,
  1 tsp. ground cinnamon or cumin,
  1 tsp. ground turmeric, curry powder, or ground coriander,
  1/2 cup white rice (any type except for sticky rice),
  1 (15-oz.) can chickpeas, white beans, black beans, or other beans, drained, rinsed,
  1/2 cup dried fruit, such as currants, raisins, cherries, or cranberries (optional),
  1/2 tsp. crushed red pepper flakes (optional),
  1/4 cup coarsely chopped tender herbs, such as cilantro, parsley, mint, basil, and/or dill',
'Season drumsticks on all sides with 2 tsp. salt and 1 tsp. black pepper.
  Heat oil in a large deep-sided skillet over medium-high. 
  Add chicken and cook, turning once halfway through, until skin is golden brown, about 10 minutes total. Transfer to a plate.
  Add onion, cinnamon, and turmeric to fat in skillet and cook over medium-high heat, stirring constantly, until fragrant, about 1 minute. 
  Add rice and stir to coat. 
  Add 1 1/4 cups hot water, scraping up browned bits from pan, then stir in chickpeas, dried fruit (if using), red pepper (if using), and remaining 1/2 tsp. salt. 
  Nestle chicken back into skillet and bring liquid to a boil. 
  Immediately reduce heat to low, cover, and cook until rice is tender and chicken is cooked through, 20-25 minutes.
  Remove from heat and let sit 5 minutes. Fluff rice with a fork, then scatter herbs over.',
50, 4, 'https://assets.epicurious.com/photos/5afb26b6c1066d74d76e5847/1:1/w_1920,c_limit/One-Pan-Chicken-Drumsticks-with-Rice-and-Beans-10052018.jpg');

-- the_admin has 2 remixes: 1 for Albacore Tuna Sliders and 1 for One-pan Chicken Drumsticks with Rice and Beans.
-- second_admin has 1 remix: 1 for One-pan Chicken Drumsticks with Rice and Beans.
INSERT INTO remixes (user_id, recipe_id, purpose, name, description, ingredients, directions, cooking_time, servings, image_url)
VALUES
(1, 1, 'Replacing the brioche buns with wheat slider buns is a healthy alternative',
'Albacore Tuna Wheat Sliders', 
'Features a seared whole piece of tuna loin that''s seared on a grill and then cut into slices and slid into wheat slider buns.',
'1 pound albacore tuna loin (ask for a piece off the front end, for even thickness),
  2 tablespoons soy sauce,
  2 tablespoons extra-virgin olive oil,
  2 tablespoons Northwest Seafood Seasoning,
  1/2 teaspoon crushed red pepper flakes,
  Slider buns (whole wheat),
  1 medium heirloom tomato or other ripe beefsteak tomato, thinly sliced,
  Arugula leaves, rinsed and dried,
  Tartar sauce, such as Pike Place Fish Smoked Walla Walla Onion Tartar Sauce',
'Remove the skin from the tuna and score the flesh every inch with a knife, as if you were making steaks. 
  Repeat on all sides, but make sure not to cut all the way through.
  Mix the soy sauce, olive oil, seafood seasoning, and red pepper flakes in a small bowl. 
  Using a basting brush, brush the mixture on all sides of the tuna, making sure to get some marinade inside the scored parts of the fish, so it''s well coated. Marinate at room temperature for 15 to 20 minutes.
  Preheat a grill to high. Make sure the grates are clean and well oiled. 
  Put the tuna directly on the grill and cook for about 2 to 3 minutes on each side, or 6 minutes total for rare. 
  During the last minute of cooking, toast the buns on the grill. 
  Slice the tuna into four sections along score lines. 
  Serve on the buns with sliced tomato, arugula, and your favorite condiment.',
NULL, 4, 'https://assets.epicurious.com/photos/5aeb6e8ecd4694640994c6c1/1:1/w_1920,c_limit/tuna-sliders-recipe-050318.jpg'),
(1, 6, 'Replace white rice with basmati rice for a stronger fragrant flavor',
'One-pan Chicken Drumsticks with Basmati Rice and Beans', 
'Clean out your pantry with this customizable one-pan dinner that can be seasoned with whatever spices you happen to have on hand.',
'8 chicken drumsticks,
  2 1/2 tsp. kosher salt, divided,
  1 tsp. freshly ground black pepper,
  3 Tbsp. extra-virgin olive oil,
  1 onion, finely chopped,
  1 tsp. ground cinnamon or cumin,
  1 tsp. ground turmeric, curry powder, or ground coriander,
  1/2 cup basmati rice,
  1 (15-oz.) can chickpeas, white beans, black beans, or other beans, drained, rinsed,
  1/2 cup dried fruit, such as currants, raisins, cherries, or cranberries (optional),
  1/2 tsp. crushed red pepper flakes (optional),
  1/4 cup coarsely chopped tender herbs, such as cilantro, parsley, mint, basil, and/or dill',
'Season drumsticks on all sides with 2 tsp. salt and 1 tsp. black pepper.
  Heat oil in a large deep-sided skillet over medium-high. 
  Add chicken and cook, turning once halfway through, until skin is golden brown, about 10 minutes total. Transfer to a plate.
  Add onion, cinnamon, and turmeric to fat in skillet and cook over medium-high heat, stirring constantly, until fragrant, about 1 minute. 
  Add rice and stir to coat. 
  Add 1 1/4 cups hot water, scraping up browned bits from pan, then stir in chickpeas, dried fruit (if using), red pepper (if using), and remaining 1/2 tsp. salt. 
  Nestle chicken back into skillet and bring liquid to a boil. 
  Immediately reduce heat to low, cover, and cook until rice is tender and chicken is cooked through, 20-25 minutes.
  Remove from heat and let sit 5 minutes. Fluff rice with a fork, then scatter herbs over.',
50, 4, DEFAULT),
(2, 6, 'Add some more spices and beans for an even better flavor',
'One-pan Paprika Chicken Drumsticks with Rice and Beans', 
'Clean out your pantry with this customizable one-pan dinner that can be seasoned with whatever spices you happen to have on hand.',
'8 chicken drumsticks,
  2 1/2 tsp. kosher salt, divided,
  1 tsp. freshly ground black pepper,
  3 Tbsp. extra-virgin olive oil,
  1 onion, finely chopped,
  1 tsp. ground cinnamon or cumin,
  1 tsp. paprika,
  1 tsp. ground turmeric, curry powder, or ground coriander,
  1/2 cup basmati rice,
  1 (15-oz.) can chickpeas, black beans, and kidney beans, drained, rinsed,
  1/2 cup dried fruit, such as currants, raisins, cherries, or cranberries (optional),
  1/2 tsp. crushed red pepper flakes (optional),
  1/4 cup coarsely chopped tender herbs, such as cilantro, parsley, mint, basil, and/or dill',
'Season drumsticks on all sides with 2 tsp. salt and 1 tsp. black pepper.
  Heat oil in a large deep-sided skillet over medium-high. 
  Add chicken and cook, turning once halfway through, until skin is golden brown, about 10 minutes total. Transfer to a plate.
  Add onion, cinnamon, paprika, and turmeric to fat in skillet and cook over medium-high heat, stirring constantly, until fragrant, about 1 minute. 
  Add rice and stir to coat. 
  Add 1 1/4 cups hot water, scraping up browned bits from pan, then stir in chickpeas, dried fruit (if using), red pepper (if using), and remaining 1/2 tsp. salt. 
  Nestle chicken back into skillet and bring liquid to a boil. 
  Immediately reduce heat to low, cover, and cook until rice is tender and chicken is cooked through, 20-25 minutes.
  Remove from heat and let sit 5 minutes. Fluff rice with a fork, then scatter herbs over.',
50, 4, DEFAULT);

-- the_admin favorites are Albacore Tuna Sliders and One-pan Chicken drumsticks.
-- second_admin favorites are Crunchy Chili Onion Rings and Lamb Bulgogi with Asian Pear Dipping Sauce.
INSERT INTO recipe_favorites (user_id, recipe_id)
VALUES (1, 1), (1, 6), (2, 2), (2, 5);

-- the_admin has no remix favorites.
-- second_admin favorites are Albacore Tuna Wheat Sliders
INSERT INTO remix_favorites (user_id, remix_id)
VALUES (2, 1);

-- the_admin has one review: The Albacore Tuna Wheat Sliders remix (positive review).
-- second_admin has one review: Original recipe Mashed Sweet Potatoes (negative review).
INSERT INTO recipe_reviews (user_id, recipe_id, title, content)
VALUES
(2, 3, 'Absolutely Disgusting!', 'I tried this recipe today and I hated how it tasted. Mashed potatoes should not taste sweet!');

INSERT INTO remix_reviews (user_id, remix_id, title, content)
VALUES
(1, 1, 'Great alternative recipe!', 'It tasted just as good as the original recipe with brioche buns!');
