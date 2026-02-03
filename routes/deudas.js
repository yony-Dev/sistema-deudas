const router = require("express").Router();
const Deuda = require("../models/Deuda");

router.post("/", async (req, res) => {
  try {
    const deuda = new Deuda({
      cliente: req.body.cliente,
      monto: req.body.monto,
      estado: "pendiente" // Asegurar que se inicialice como pendiente
    });

    await deuda.save();
    res.json(deuda);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar deuda" });
  }
});

router.get("/", async (req, res) => {
  try {
    const deudas = await Deuda.find()
      .populate("cliente")
      .populate("vendedorPago");

    res.json(deudas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar deudas" });
  }
});
//Filtro pagadas dia
router.put("/pagar/:id", async (req, res) => {
  try {
    const { vendedorPago, fechaPago } = req.body;

    // Convertir la fecha a objeto Date
    let fechaPagoDate;
    
    if (fechaPago && fechaPago.match(/^\d{4}-\d{2}-\d{2}/)) {
      // Si viene como "2026-02-02" o "2026-02-02T12:00:00Z"
      fechaPagoDate = new Date(fechaPago);
    } else {
      // Si no viene fecha, usar la actual
      fechaPagoDate = new Date();
    }
    
    // Asegurar que se guarda correctamente
    const deuda = await Deuda.findByIdAndUpdate(
      req.params.id,
      {
        estado: "pagado",
        vendedorPago,
        fechaPago: fechaPagoDate
      },
      { new: true }
    ).populate("cliente").populate("vendedorPago");

    if (!deuda) {
      return res.status(404).json({ error: "Deuda no encontrada" });
    }

    res.json(deuda);
  } catch (error) {
    console.error("Error al actualizar deuda:", error);
    res.status(500).json({ error: "Error al actualizar deuda" });
  }
});
//////////////////////////////////

// Mantener consistencia - usar "pagado" en todos los lugares
router.get("/pagadas", async (req, res) => {
  try {
    const deudas = await Deuda.find({ estado: "pagado" }) // Cambiado a "pagado"
      .populate("cliente")
      .populate("vendedorPago");

    res.json(deudas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar deudas pagadas" });
  }
});

router.get("/pagadas/dia/:fecha", async (req, res) => {
  try {
    const fechaParam = req.params.fecha; // YYYY-MM-DD del frontend
    
    console.log("=== FILTRO POR STRING ===");
    console.log("Fecha solicitada:", fechaParam);
    
    if (!fechaParam || !fechaParam.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: "Formato de fecha inválido. Use YYYY-MM-DD" });
    }

    // Obtener TODAS las deudas pagadas
    const deudas = await Deuda.find({ estado: "pagado" })
      .populate("cliente")
      .populate("vendedorPago");

    console.log(`Total deudas pagadas en sistema: ${deudas.length}`);

    // Filtrar comparando strings YYYY-MM-DD
    const deudasFiltradas = deudas.filter(deuda => {
      if (!deuda.fechaPago) {
        console.log(`Deuda ${deuda._id} no tiene fechaPago`);
        return false;
      }
      
      try {
        // Convertir fechaPago de la BD a string YYYY-MM-DD
        const fechaDeuda = new Date(deuda.fechaPago);
        
        // Usar UTC para evitar problemas de zona horaria
        const año = fechaDeuda.getUTCFullYear();
        const mes = String(fechaDeuda.getUTCMonth() + 1).padStart(2, '0');
        const dia = String(fechaDeuda.getUTCDate()).padStart(2, '0');
        const fechaDeudaStr = `${año}-${mes}-${dia}`;
        
        // Debug: ver qué estamos comparando
        if (deuda.cliente?.nombre) {
          console.log(`Comparando: "${fechaDeudaStr}" === "${fechaParam}" ? ${fechaDeudaStr === fechaParam} - Cliente: ${deuda.cliente.nombre}`);
        }
        
        return fechaDeudaStr === fechaParam;
        
      } catch (error) {
        console.error(`Error procesando fecha de deuda ${deuda._id}:`, error);
        return false;
      }
    });

    console.log(`✅ Deudas encontradas: ${deudasFiltradas.length}`);
    
    // Si no hay resultados, mostrar qué fechas SÍ existen
    if (deudasFiltradas.length === 0 && deudas.length > 0) {
      console.log("⚠️ No se encontraron deudas para esa fecha. Fechas disponibles:");
      
      const fechasUnicas = [...new Set(
        deudas
          .filter(d => d.fechaPago)
          .map(d => {
            const fecha = new Date(d.fechaPago);
            return `${fecha.getUTCFullYear()}-${String(fecha.getUTCMonth() + 1).padStart(2, '0')}-${String(fecha.getUTCDate()).padStart(2, '0')}`;
          })
      )];
      
      fechasUnicas.forEach(fecha => console.log(`  📅 ${fecha}`));
    }

    res.json(deudasFiltradas);
  } catch (error) {
    console.error("❌ Error en /pagadas/dia/:fecha:", error);
    res.status(500).json({ error: "Error al filtrar deudas por día" });
  }
});

// Agregar endpoint para deudas pendientes (opcional, pero útil)
router.get("/pendientes", async (req, res) => {
  try {
    const deudas = await Deuda.find({ estado: "pendiente" })
      .populate("cliente")
      .populate("vendedorPago");

    res.json(deudas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cargar deudas pendientes" });
  }
});

module.exports = router;