const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Atlas conectado"))
  .catch(err => console.log("Error MongoDB", err));

app.use("/deudas", require("./routes/deudas"));
app.use("/clientes", require("./routes/clientes"));
app.use("/vendedores", require("./routes/vendedores"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor funcionando en el puerto", PORT);
});
