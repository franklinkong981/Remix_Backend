INSERT INTO users (username, email, hashed_password)
VALUES 
('the_admin', 'admin@springboard.com', '$2b$12$3W0BD66vJvGBXyQSo8VJk.0saKICmPE14lCfCFwM2ezSq22VtS.Q6'),
('second_admin', 'admin2@springboard.com', '$2b$12$ZNHGCeoRibSQklQ9weDRnOELgNMyz9QBxO4ags10lsXZfPRHjp2RK');

-- the_admin password: admin_password
-- second_admin password: admin2_password

INSERT INTO recipes (user_id, name, description, ingredients, directions, cooking_time, servings, image_url)
VALUES
(1, "Albacore Tuna Sliders", 
"Features a seared whole piece of tuna loin that's seared on a grill and then cut into slices and slid into brioche buns.",
"1 pound albacore tuna loin (ask for a piece off the front end, for even thickness),
  2 tablespoons soy sauce,
  2 tablespoons extra-virgin olive oil,
  2 tablespoons Northwest Seafood Seasoning,
  1/2 teaspoon crushed red pepper flakes,
  Slider buns, brioche, if possible,
  1 medium heirloom tomato or other ripe beefsteak tomato, thinly sliced,
  Arugula leaves, rinsed and dried,
  Tartar sauce, such as Pike Place Fish Smoked Walla Walla Onion Tartar Sauce",
"Remove the skin from the tuna and score the flesh every inch with a knife, as if you were making steaks. 
  Repeat on all sides, but make sure not to cut all the way through.
  Mix the soy sauce, olive oil, seafood seasoning, and red pepper flakes in a small bowl. 
  Using a basting brush, brush the mixture on all sides of the tuna, making sure to get some marinade inside the scored parts of the fish, so it's well coated. Marinate at room temperature for 15 to 20 minutes.
  Preheat a grill to high. Make sure the grates are clean and well oiled. 
  Put the tuna directly on the grill and cook for about 2 to 3 minutes on each side, or 6 minutes total for rare. 
  During the last minute of cooking, toast the buns on the grill. 
  Slice the tuna into four sections along score lines. 
  Serve on the buns with sliced tomato, arugula, and your favorite condiment.",
NULL, 4, 'https://assets.epicurious.com/photos/5aeb6e8ecd4694640994c6c1/1:1/w_1920,c_limit/tuna-sliders-recipe-050318.jpg'),
(1, "Crunchy Chili Onion Rings", "These are great with salsa.",
"3 cups all purpose flour,
  2 tablespoons chili powder,
  4 1/2 teaspoons salt,
  1 12-ounce bottle dark beer (preferably Mexican),
  12 6-inch corn tortillas, coarsely torn,
  2 large onions, peeled,
  Vegetable oil (for deep-frying)",
"Mix flour, chili powder, and salt in medium bowl. Pour beer into small bowl. 
  Finely grind tortillas in processor; transfer to deep bowl.
  Line large baking sheet with foil. 
  Cut onions crosswise into 1/2- to 3/4-inch-thick rounds. Separate rounds into rings. 
  Dip 1 onion ring into flour mixture, then beer, flour again and beer again, then add to bowl with ground tortillas and toss to coat. 
  Using wooden skewer, transfer coated ring to sheet of foil. Repeat with remaining onion rings.
  Pour oil into heavy large skillet to depth of 1 inch. 
  Rest top of deep-fry thermometer against edge of skillet, submerging bulb end in oil. 
  Heat oil to 370-380 degrees F. 
  Fry onion rings, 4 at a time until golden brown, maintaining temperature, about 3 minutes per batch. 
  Using slotted spoon, transfer to paper towels to drain.",
30, 4, 'https://assets.bonappetit.com/photos/57b14e61f1c801a1038bdd50/1:1/w_1920,c_limit/mare_crunchy_chili_onion_rings_h.jpg'),
(1, "Mashed Sweet Potatoes", "A sweet take on the popular side dish",
"6 lb. sweet potatoes (about 12),
  1/2 cup (1 stick) unsalted butter, melted,
  1/2 cup heavy cream or half-and-half, warmed,
  2 Tbsp. pure maple syrup,
  1 tsp. Diamond Crystal or 1/2 tsp. plus 1/8 tsp. Morton kosher salt,
  1/2 tsp. freshly ground black pepper",
"Place rack in lower third of oven and preheat oven to 400 degrees. Line a large rimmed baking sheet with aluminum foil.
  Prick 6 lb. or about 12 sweet potatoes, two times each, with a fork and transfer to prepared baking sheet. 
  Cook sweet potatoes in the oven until very tender, about 1 hour. Remove and cool slightly.
  Halve potatoes lengthwise and scoop out warm flesh into a large bowl. 
  Mash potatoes with a potato masher or, for a smoother puree, force through a potato ricer. 
  Stir in 0.5 cup (1 stick) unsalted butter, melted, 0.5 cup heavy cream or half-and-half, warmed, 2 Tbsp. pure maple syrup, 1 tsp. Diamond Crystal or 0.5 tsp. plus 1/8 tsp. Morton kosher salt, and 0.5 tsp. freshly ground black pepper. 
  Keep warm.
  ALSO: Mashed sweet potatoes can be made 2 days ahead and chilled in an airtight container. Reheat in a 350 degree oven or a microwave.",
NULL, 10, 'https://assets.epicurious.com/photos/64e67cc1709a7ec6701c4b38/1:1/w_1920,c_limit/Mashed-Sweet-Potatoes_Recipe_2056.jpg'),
(1, "Fried Oysters with Bacon, Garlic, and Sage", 
"If you like seafood, you'll love this!",
"2 cups rice flour
  1 tablespoon Diamond Crystal or 2 teaspoons Morton kosher salt,
  1/2 teaspoon cayenne pepper,
  24 large oysters, shucked,
  4 ounces slab bacon, cut into 1x1/4-inch pieces,
  1 cup (2 sticks) unsalted butter, divided,
  6 garlic cloves, smashed, divided,
  8 sage leaves,
  Spicy mustard or hot sauce (for serving)",
"Whisk rice flour, salt, and cayenne in a medium bowl. 
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
  Oysters can be dredged 4 hours ahead. Keep chilled.",
NULL, 8, 'https://assets.epicurious.com/photos/59233d7bbb553a5f5751b90e/1:1/w_1920,c_limit/fried-oysters-with-bacon-garlic-and-sage-BA-052217.jpg'),







INSERT INTO companies (handle,
                       name,
                       num_employees,
                       description,
                       logo_url)
VALUES ('bauer-gallagher', 'Bauer-Gallagher', 862,
        'Difficult ready trip question produce produce someone.', NULL),
       ('edwards-lee-reese', 'Edwards, Lee and Reese', 744,
        'To much recent it reality coach decision Mr. Dog language evidence minute either deep situation pattern. Other cold bad loss surface real show.',
        '/logos/logo2.png'),