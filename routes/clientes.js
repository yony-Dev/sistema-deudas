const router = require("express").Router();
const Cliente = require("../models/Cliente");

router.post("/", async (req, res) => {
  console.log("Datos recibidos en /clientes:", req.body);

  try {
    const cliente = new Cliente(req.body);
    await cliente.save();
    res.json(cliente);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

router.get("/", async (req, res) => {
  const clientes = await Cliente.find();
  res.json(clientes);
});

module.exports = router;
