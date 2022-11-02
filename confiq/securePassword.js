const bcrypt = require("bcrypt");
const saltRounds = 10;

exports.securePassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};

// compare password function
exports.comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// To SECURE PASSWORD WE HAVE TO USE THIS
