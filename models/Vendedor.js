const mongoose = require("mongoose");

module.exports = mongoose.model("Vendedor", {
  nombre: String
});
