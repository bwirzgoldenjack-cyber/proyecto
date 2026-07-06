function actualizarHora() {
    const ahora = new Date();
    const hora = ahora.toLocaleTimeString('es-AR', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const fecha = ahora.toLocaleDateString('es-AR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    document.getElementById("hora").innerHTML = hora;
    document.getElementById("fecha").innerHTML = fecha.toUpperCase();
}

function iniciarReloj() {
    actualizarHora();
    setInterval(actualizarHora, 1000);
}

function iniciarLogout() {
    const btn = document.querySelector(".logout");
    if (btn) btn.addEventListener("click", () => {
        window.location.href = "/logout";
    });
}