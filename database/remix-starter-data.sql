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