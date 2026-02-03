// app.js - Código JavaScript completo

let clientes = [];
let vendedores = [];

// ========== FUNCIONES DE FECHA ==========
function getCurrentDateLocal() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatearFechaCorrecta(fechaISO) {
  try {
    if (!fechaISO) return "--/--/----";
    
    // Extraer directamente del string ISO (más seguro)
    const [año, mes, dia] = fechaISO.split('T')[0].split('-');
    return `${dia}/${mes}/${año}`;
  } catch (e) {
    return "--/--/----";
  }
}

function formatearFechaBonita(fechaISO) {
  try {
    if (!fechaISO) return "Sin fecha";
    
    const fecha = new Date(fechaISO);
    const opciones = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  } catch (e) {
    return "Sin fecha";
  }
}

// ========== FUNCIONES DE CARGA ==========
async function cargarClientes() {
  try {
    const res = await fetch("/clientes");
    clientes = await res.json();

    const selectCliente = document.getElementById("dCliente");
    selectCliente.innerHTML = '<option value="">Seleccione cliente</option>' +
      clientes.map(c => `<option value="${c._id}">${c.nombre} (${c.telefono}) - ${c.compania || ''}</option>`).join("");
  } catch (error) {
    console.error("Error cargando clientes:", error);
    document.getElementById("dCliente").innerHTML = '<option value="">Error cargando clientes</option>';
  }
}

async function cargarVendedores() {
  try {
    const res = await fetch("/vendedores");
    vendedores = await res.json();
  } catch (error) {
    console.error("Error cargando vendedores:", error);
  }
}

// ========== FUNCIONES CRUD ==========
async function agregarCliente() {
  try {
    const nombre = document.getElementById("cNombre").value.trim();
    const telefono = document.getElementById("cTelefono").value.trim();
    const compania = document.getElementById("cCompania").value;

    if (!nombre || !telefono) {
      alert("Nombre y teléfono son obligatorios");
      return;
    }

    await fetch("/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, telefono, compania })
    });

    document.getElementById("cNombre").value = "";
    document.getElementById("cTelefono").value = "";
    await cargarClientes();
    
    // Mostrar notificación
    mostrarNotificacion("Cliente agregado correctamente", "success");
  } catch (error) {
    console.error("Error agregando cliente:", error);
    mostrarNotificacion("Error al agregar cliente", "danger");
  }
}

async function agregarVendedor() {
  try {
    const nombre = document.getElementById("vNombre").value.trim();
    
    if (!nombre) {
      alert("El nombre es obligatorio");
      return;
    }

    await fetch("/vendedores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre })
    });

    document.getElementById("vNombre").value = "";
    await cargarVendedores();
    
    mostrarNotificacion("Vendedor agregado correctamente", "success");
  } catch (error) {
    console.error("Error agregando vendedor:", error);
    mostrarNotificacion("Error al agregar vendedor", "danger");
  }
}

async function agregarDeuda() {
  const cliente = document.getElementById("dCliente").value;
  const monto = document.getElementById("dMonto").value;

  if (!cliente) {
    mostrarNotificacion("Seleccione un cliente", "warning");
    return;
  }

  if (!monto || monto <= 0) {
    mostrarNotificacion("Ingrese un monto válido", "warning");
    return;
  }

  try {
    const res = await fetch("/deudas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cliente,
        monto: Number(monto)
      })
    });

    const nuevaDeuda = await res.json();
    
    document.getElementById("dMonto").value = "";
    document.getElementById("dCliente").selectedIndex = 0;
    
    mostrarNotificacion(`Deuda de $${monto} registrada`, "success");
    await cargarDeudas();
  } catch (err) {
    console.error("Error agregando deuda:", err);
    mostrarNotificacion("Error al agregar deuda", "danger");
  }
}

// ========== FUNCIÓN PRINCIPAL PARA CARGAR DEUDAS ==========
async function cargarDeudas() {
  try {
    const res = await fetch("/deudas");
    const data = await res.json();

    const deudasContainer = document.getElementById("deudas");
    if (!deudasContainer) {
      console.error("No se encontró el elemento con id 'deudas'");
      return;
    }

    if (data.length === 0) {
      deudasContainer.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <div class="mb-3">📭</div>
            <h5 class="text-muted">No hay deudas registradas</h5>
            <p class="text-muted">Agrega una deuda usando el formulario</p>
          </div>
        </div>`;
      return;
    }

    // Separar deudas pendientes y pagadas
    const deudasPendientes = data.filter(d => d.estado === "pendiente");
    const deudasPagadas = data.filter(d => d.estado === "pagado");

    let html = '';

    // Mostrar deudas pendientes primero
    if (deudasPendientes.length > 0) {
      html += `
        <div class="col-12">
          <h5 class="text-warning mt-4 mb-3">
            ⏰ Pendientes (${deudasPendientes.length})
          </h5>
        </div>`;
      
      html += deudasPendientes.map(d => `
        <div class="col-md-4 mb-3">
          <div class="card h-100 border-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title">${d.cliente?.nombre || "Cliente"}</h5>
                <span class="badge bg-warning">Pendiente</span>
              </div>
              
              <p class="card-text">
                <i class="bi bi-telephone"></i> ${d.cliente?.telefono || "—"}
                ${d.cliente?.compania ? `<span class="badge bg-info ms-2">${d.cliente.compania}</span>` : ''}
              </p>
              
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="text-danger m-0">$${d.monto.toLocaleString()}</h4>
                <small class="text-muted">${formatearFechaBonita(d.fechaEnvio)}</small>
              </div>
              
              <div class="mt-3">
                <select id="v_${d._id}" class="form-select form-select-sm mb-2">
                  <option value="">Seleccionar vendedor</option>
                  ${vendedores.map(v => `<option value="${v._id}">${v.nombre}</option>`).join("")}
                </select>
                
                <div class="input-group input-group-sm mb-2">
                  <span class="input-group-text"><i class="bi bi-calendar"></i></span>
                  <input type="date" id="f_${d._id}" class="form-control" value="${getCurrentDateLocal()}">
                </div>
                
                <button class="btn btn-success btn-sm w-100" onclick="pagar('${d._id}')">
                  <i class="bi bi-cash-coin"></i> Registrar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }

    // Mostrar deudas pagadas después
    if (deudasPagadas.length > 0) {
      html += `
        <div class="col-12">
          <h5 class="text-success mt-4 mb-3">
            ✅ Pagadas (${deudasPagadas.length})
          </h5>
        </div>`;
      
      html += deudasPagadas.map(d => `
        <div class="col-md-4 mb-3">
          <div class="card h-100 border-success">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title">${d.cliente?.nombre || "Cliente"}</h5>
                <span class="badge bg-success">Pagado</span>
              </div>
              
              <p class="card-text">
                <i class="bi bi-telephone"></i> ${d.cliente?.telefono || "—"}
              </p>
              
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="text-success m-0">$${d.monto.toLocaleString()}</h4>
                <small class="text-muted">${formatearFechaBonita(d.fechaEnvio)}</small>
              </div>
              
              <div class="bg-light p-2 rounded mt-2">
                <p class="mb-1">
                  <i class="bi bi-person-check"></i> <strong>${d.vendedorPago?.nombre || "N/A"}</strong>
                </p>
                <p class="mb-0">
                  <i class="bi bi-calendar-check"></i> Pagado el ${formatearFechaCorrecta(d.fechaPago)}
                </p>
                <small class="text-muted">${formatearFechaBonita(d.fechaPago)}</small>
              </div>
            </div>
          </div>
        </div>
      `).join("");
    }

    deudasContainer.innerHTML = html;
  } catch (error) {
    console.error("Error cargando deudas:", error);
    const deudasContainer = document.getElementById("deudas");
    if (deudasContainer) {
      deudasContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger text-center">
            <h5>⚠️ Error cargando deudas</h5>
            <p>Intenta recargar la página</p>
          </div>
        </div>`;
    }
  }
}

// ========== FUNCIÓN PARA PAGAR DEUDA ==========
async function pagar(id) {
  const vendedor = document.getElementById(`v_${id}`).value;
  const fechaInput = document.getElementById(`f_${id}`).value;

  if (!vendedor) {
    mostrarNotificacion("Seleccione un vendedor", "warning");
    return;
  }

  if (!fechaInput) {
    mostrarNotificacion("Seleccione una fecha", "warning");
    return;
  }

  try {
    // Crear fecha con hora local (mediodía) para evitar problemas de zona horaria
    const fechaLocal = new Date(fechaInput + 'T12:00:00');
    
    const response = await fetch(`/deudas/pagar/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vendedorPago: vendedor,
        fechaPago: fechaLocal.toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const resultado = await response.json();
    
    mostrarNotificacion("¡Pago registrado exitosamente!", "success");
    await cargarDeudas();
  } catch (error) {
    console.error("Error pagando deuda:", error);
    mostrarNotificacion("Error al procesar el pago", "danger");
  }
}

// ========== FILTRO POR DÍA ==========
async function filtrarPorDia() {
  try {
    const fechaInput = document.getElementById("filtroFecha").value;
    
    if (!fechaInput) {
      mostrarNotificacion("Seleccione una fecha", "warning");
      return;
    }

    const res = await fetch(`/deudas/pagadas/dia/${fechaInput}`);
    const data = await res.json();
    
    const deudasContainer = document.getElementById("deudas");
    if (!deudasContainer) return;

    if (data.length === 0) {
      deudasContainer.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <div class="mb-3">📅</div>
            <h5 class="text-muted">No hay deudas pagadas el ${fechaInput}</h5>
            <button onclick="cargarDeudas()" class="btn btn-outline-primary mt-3">
              Ver todas las deudas
            </button>
          </div>
        </div>`;
      return;
    }

    deudasContainer.innerHTML = `
      <div class="col-12 mb-3">
        <div class="alert alert-info d-flex justify-content-between align-items-center">
          <span>
            <i class="bi bi-filter"></i> 
            Mostrando ${data.length} deudas pagadas el ${fechaInput}
          </span>
          <button onclick="cargarDeudas()" class="btn btn-sm btn-outline-info">
            <i class="bi bi-x-circle"></i> Limpiar filtro
          </button>
        </div>
      </div>
      ${data.map(d => `
        <div class="col-md-4 mb-3">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">${d.cliente?.nombre || "Cliente"}</h5>
              <p class="card-text">
                <i class="bi bi-telephone"></i> ${d.cliente?.telefono || "—"}
              </p>
              
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h4 class="text-success m-0">$${d.monto.toLocaleString()}</h4>
                <span class="badge bg-success">Pagado</span>
              </div>
              
              <div class="bg-light p-2 rounded">
                <p class="mb-1">
                  <i class="bi bi-person-check"></i> ${d.vendedorPago?.nombre || "N/A"}
                </p>
                <p class="mb-0">
                  <i class="bi bi-calendar-check"></i> ${formatearFechaCorrecta(d.fechaPago)}
                </p>
              </div>
            </div>
          </div>
        </div>
      `).join("")}`;
    
  } catch (error) {
    console.error("Error filtrando deudas:", error);
    mostrarNotificacion("Error al filtrar deudas", "danger");
  }
}

// ========== FUNCIONES AUXILIARES ==========
function mostrarNotificacion(mensaje, tipo = "info") {
  // Crear notificación
  const notificacion = document.createElement('div');
  notificacion.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
  notificacion.style.cssText = `
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  
  notificacion.innerHTML = `
    ${mensaje}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notificacion);
  
  // Auto-eliminar después de 3 segundos
  setTimeout(() => {
    if (notificacion.parentNode) {
      notificacion.remove();
    }
  }, 3000);
}

// ========== INICIALIZACIÓN ==========
async function iniciar() {
  try {
    // Mostrar mensaje de carga
    const deudasContainer = document.getElementById("deudas");
    if (deudasContainer) {
      deudasContainer.innerHTML = `
        <div class="col-12">
          <div class="text-center py-5">
            <div class="spinner-border text-primary mb-3" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <h5 class="text-muted">Cargando datos...</h5>
          </div>
        </div>`;
    }
    
    await Promise.all([
      cargarClientes(),
      cargarVendedores()
    ]);
    await cargarDeudas();
    
    // Agregar íconos de Bootstrap
    const iconLink = document.createElement('link');
    iconLink.rel = 'stylesheet';
    iconLink.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css';
    document.head.appendChild(iconLink);
    
  } catch (error) {
    console.error("Error en la inicialización:", error);
    mostrarNotificacion("Error al cargar los datos iniciales", "danger");
  }
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar);
} else {
  iniciar();
}