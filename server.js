/* This is the file that will run when the app is launched.
This file creates an instance of the Remix app and runs it using app.listen on the designated port from config.js.
This is here so that app.listen doesn't run and the server doesn't start when we are in test mode.
 */

const app = require("./app");
const { PORT } = require("./config.js");

app.listen(PORT, function() {
  console.log(`Server started, base URL is http://localhost:${PORT}`);
});
