function actualizar() {
    fetch("/conn_puertas")
    .then(r => r.json())
    .then(data => {
        const selector = document.getElementById("selectorPuerta");

        if (selector.options.length <= 1) {
            selector.innerHTML = "";
            data.puertas.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.nombre;
                opt.text = `${p.nombre.toLowerCase()}  ${p.sucursal.toLowerCase()}`;
                selector.appendChild(opt);
            });
        }

        const puerta = selector.value.toLowerCase().trim();
        const actual = data.puertas.find(p =>
            p.nombre.toLowerCase().trim() === puerta
        );

        if (!actual) return;

        document.getElementById("personas").innerHTML = actual.personas_hoy;
        document.getElementById("entradas").innerHTML = actual.entradas_hoy;
        document.getElementById("salidas").innerHTML = actual.salidas_hoy;

        const texto = selector.options[selector.selectedIndex].text;
        document.getElementById("sucursalActual").innerHTML = texto;
    })
    .catch(err => console.log("Error al actualizar:", err));
}

function evento(tipo) {
    const selector = document.getElementById("selectorPuerta");
    const puerta = selector.value;

    fetch("/conn_puertas")
    .then(r => r.json())
    .then(data => {
        const p = data.puertas.find(p => p.nombre === puerta);
        if (!p) return;

        fetch("/simular_evento", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: tipo,
                sucursal: p.sucursal,
                puerta: p.nombre
            })
        })
        .then(r => r.json())
        .then(data => {
            if (data.ok) setTimeout(actualizar, 500);
            else console.error("Error al simular evento:", data.error);
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    iniciarReloj();       // ← utils.js
    iniciarLogout();      // ← utils.js

    document.getElementById("selectorPuerta")
        .addEventListener("change", actualizar);

    actualizar();
    setInterval(actualizar, 3000);
});
