const mongoose = require("mongoose");

module.exports = mongoose.model("Cliente", {
  nombre: String,
  telefono: String,
  compania: String
});
