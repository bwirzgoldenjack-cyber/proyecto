function esc(s) {
    const d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
}

let sucursalActual = "quilmes";
let todasLasPuertas = [];
let buscador = "";

function actualizarPuertas() {
    fetch("/conn_puertas")
        .then(r => r.json())
        .then(data => {
            todasLasPuertas = data.puertas || [];
            renderPuertas();
        })
        .catch(err => console.error("ERROR FETCH:", err));
}

function renderPuertas() {
    const grid = document.getElementById("puertasGrid");

    const filtradas = todasLasPuertas.filter(p => {
        const nombre   = (p.nombre   || "").toLowerCase();
        const sucursal = (p.sucursal || "");
        return sucursal === sucursalActual && nombre.includes(buscador);
    });

    const html = filtradas.map(p => {
        const nombre   = p.nombre   || "SIN NOMBRE";
        const sucursal = p.sucursal || "SIN SUCURSAL";
        const entradas = p.entradas_hoy || 0;
        const salidas  = p.salidas_hoy  || 0;
        const ultimo   = p.ultimo   || "--";
        const activa   = !!p.activa;

        return `
            <div class="puerta-card">
                <div class="card-top">
                    <div>
                        <h3>${esc(nombre)}</h3>
                        <span>${esc(sucursal)}</span>
                    </div>
                    <div class="estado ${activa ? "online" : "offline"}">
                        ● ${activa ? "ACTIVA" : "ACTIVA"}
                    </div>
                </div>
                <div class="stats">
                    <div class="box entradas">
                        <span>ENTRADAS HOY</span>
                        <h2>${entradas}</h2>
                    </div>
                    <div class="box salidas">
                        <span>SALIDAS HOY</span>
                        <h2>${salidas}</h2>
                    </div>
                </div>
                <div class="ultimo-evento">Último evento: ${esc(ultimo)}</div>
                <div class="card-actions">
                    <button class="btn-activar ${activa ? 'activa' : 'inactiva'}"
                        onclick="togglePuerta(${p.id})">
                        ${activa ? "DESACTIVAR" : "ACTIVAR"}
                    </button>
                    <button class="btn-editar"
                        onclick="editarPuerta(${p.id}, '${esc(nombre)}')">✎</button>
                    <button class="btn-eliminar"
                        onclick="eliminarPuerta(${p.id})">🗑</button>
                </div>
            </div>
        `;
    }).join("");

    grid.innerHTML = html;
}

function togglePuerta(id) {
    fetch(`/toggle_puerta/${id}`, { method: "POST" })
        .then(r => r.json())
        .then(data => { if (data.ok) actualizarPuertas(); });
}

function agregarPuerta() {
    const nombre = document.getElementById("nuevaPuerta").value.trim();
    if (!nombre) { alert("Ingresá un nombre"); return; }

    fetch("/agregar_puerta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, sucursal: sucursalActual })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) {
            document.getElementById("nuevaPuerta").value = "";
            actualizarPuertas();
        }
    });
}

function editarPuerta(id, nombreActual) {
    const nuevo = prompt("Nuevo nombre:", nombreActual);
    if (!nuevo) return;

    fetch(`/editar_puerta/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nuevo })
    })
    .then(r => r.json())
    .then(data => { if (data.ok) actualizarPuertas(); });
}

function eliminarPuerta(id) {
    if (!confirm("¿Eliminar puerta?")) return;

    fetch(`/eliminar_puerta/${id}`, { method: "POST" })
        .then(r => r.json())
        .then(data => { if (data.ok) actualizarPuertas(); });
}

function cargarFiltros() {
    fetch("/obtener_sucursales")
        .then(r => r.json())
        .then(data => {
            const contenedor = document.getElementById("filtroSucursales");
            contenedor.innerHTML = "";

            (data.sucursales || []).forEach((s, i) => {
                const btn = document.createElement("button");
                btn.className = "sucursal-btn" + (i === 0 ? " active" : "");
                btn.textContent = s.nombre.toUpperCase();
                btn.addEventListener("click", () => {
                    sucursalActual = s.nombre.toLowerCase();
                    document.querySelectorAll(".sucursal-btn")
                        .forEach(b => b.classList.remove("active"));
                    btn.classList.add("active");
                    renderPuertas();
                });
                contenedor.appendChild(btn);
            });

            // Setear la primera sucursal como activa por defecto
            if (data.sucursales.length > 0) {
                sucursalActual = data.sucursales[0].nombre.toLowerCase();
                renderPuertas();
            }
        })
        .catch(err => console.error("Error cargando sucursales:", err));
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarReloj();
    iniciarLogout();

    document.getElementById("buscar").addEventListener("input", (e) => {
        buscador = e.target.value.toLowerCase().trim();
        renderPuertas();
    });

    cargarFiltros();

    actualizarPuertas();
    setInterval(actualizarPuertas, 3000);
});