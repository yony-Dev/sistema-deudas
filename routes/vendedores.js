const router = require("express").Router();
const Vendedor = require("../models/Vendedor");

router.post("/", async (req, res) => {
  res.json(await new Vendedor(req.body).save());
});

router.get("/", async (req, res) => {
  res.json(await Vendedor.find());
});

module.exports = router;
