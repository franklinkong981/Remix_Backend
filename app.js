const bcrypt = require("bcrypt");

async function getHashedPassword() {
  return await bcrypt.hash("admin2_password", 12);
}

getHashedPassword().then(result => {
  console.log(result);
});
