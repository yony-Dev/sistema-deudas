const mongoose = require("mongoose");

const deudaSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  },
  monto: {
    type: Number,
    required: true
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ["pendiente", "pagado"],
    default: "pendiente"
  },
  vendedorPago: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendedor"
  },
  fechaPago: {
    type: Date
  }
});

module.exports = mongoose.model("Deuda", deudaSchema);
