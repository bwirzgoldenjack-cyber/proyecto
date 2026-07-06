let todasLasSucursales = [];
let buscador = "";

function actualizarSucursales() {
    fetch("/sucursales_data")
        .then(async r => {
            const data = await r.json();
            if (!r.ok) throw new Error(data.error || "Error servidor");
            return data;
        })
        .then(data => {
            todasLasSucursales = data.sucursales || [];
            renderSucursales();
        })
        .catch(err => {
            console.error("Error al cargar sucursales:", err);
            document.getElementById("sucursalesGrid").innerHTML =
                `<p style="color:red;font-size:14px;">Error: ${err.message}</p>`;
        });
}

function renderSucursales() {
    const grid = document.getElementById("sucursalesGrid");

    const filtradas = todasLasSucursales.filter(s =>
        s.nombre.toLowerCase().includes(buscador)
    );

    if (filtradas.length === 0) {
        grid.innerHTML = `<p style="color:var(--color-text-secondary);font-size:14px;">
            No se encontraron sucursales.</p>`;
        return;
    }

    const html = filtradas.map(s => {
        const inicial        = s.nombre.charAt(0).toUpperCase();
        const nombre         = s.nombre.toUpperCase();
        const nombreEscapado = s.nombre.replace(/'/g, "\\'").replace(/"/g, "&quot;");

        // Estado visual de 3 niveles:
        // - activa=1 y online=1 -> CONECTADA (verde)
        // - activa=1 y online=0 -> SIN SEÑAL (amarillo, alerta real de sensor caído)
        // - activa=0            -> INACTIVA (gris)
        let claseEstado, textoEstado;
        if (!s.activa) {
            claseEstado = "offline";
            textoEstado = "INACTIVA";
        } else if (s.online) {
            claseEstado = "online";
            textoEstado = "CONECTADA";
        } else {
            claseEstado = "sin-senal";
            textoEstado = "SIN SEÑAL";
        }

        return `
            <div class="sucursal-card ${s.activa ? 'activa' : ''}">
                <div class="sucursal-header">
                    <div class="sucursal-icon">${inicial}</div>
                    <div class="sucursal-info">
                        <h3>${nombre}</h3>
                        <span class="${claseEstado}">
                            <span class="dot"></span>
                            ${textoEstado}
                        </span>
                    </div>
                    ${s.activa ? `<span class="estado-badge">ACTIVA</span>` : ''}
                </div>
                <div class="estadisticas">
                    <div class="stat aforo">
                        <span>AFORO</span><strong>${s.personas}</strong>
                    </div>
                    <div class="stat entrada">
                        <span>ENTR.</span><strong>${s.entradas}</strong>
                    </div>
                    <div class="stat salida">
                        <span>SAL.</span><strong>${s.salidas}</strong>
                    </div>
                </div>
                <div class="puertas-info">
                    🚪 ${s.num_puertas} ${s.num_puertas === 1 ? 'puerta' : 'puertas'}
                </div>
                <div class="acciones-card">
                    <button class="btn-estado"
                        onclick="toggleSucursal('${nombreEscapado}')">
                        ${s.activa ? 'ACTIVA' : 'ACTIVAR'}
                    </button>
                    <button class="btn-puertas"
                        onclick="window.location.href='/puertas'">
                        PUERTAS
                    </button>
                    <button class="btn-eliminar"
                        onclick="eliminarSucursal('${nombreEscapado}')">
                        🗑
                    </button>
                </div>
            </div>`;
    }).join("");

    grid.innerHTML = html;
}

function agregarSucursal() {
    const input  = document.getElementById("nuevaSucursal");
    const nombre = input.value.trim();
    if (!nombre) { alert("Ingresá un nombre"); return; }

    fetch("/agregar_sucursal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) { input.value = ""; actualizarSucursales(); }
        else alert(data.error || "No se pudo agregar");
    })
    .catch(err => console.error(err));
}

function toggleSucursal(nombre) {
    fetch("/toggle_sucursal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    })
    .then(r => r.json())
    .then(data => { if (data.ok) actualizarSucursales(); });
}

function eliminarSucursal(nombre) {
    if (!confirm(`¿Eliminar la sucursal "${nombre}"? También se eliminarán sus puertas.`)) return;

    fetch("/eliminar_sucursal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre })
    })
    .then(r => r.json())
    .then(data => {
        if (data.ok) actualizarSucursales();
        else alert(data.error || "No se pudo eliminar");
    })
    .catch(err => console.error(err));
}

document.addEventListener("DOMContentLoaded", () => {
    iniciarReloj();     // ← utils.js
    iniciarLogout();    // ← utils.js

    document.getElementById("buscarSucursal").addEventListener("input", e => {
        buscador = e.target.value.toLowerCase().trim();
        renderSucursales();
    });

    actualizarSucursales();
    setInterval(actualizarSucursales, 5000);
});