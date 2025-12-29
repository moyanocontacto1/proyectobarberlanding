// TOKEN AIR (guardar de forma segura)
const AIRTABLE_TOKEN = "pat5BqCS4qOEaudJB.4a2ad66e75c6aab59777827c52b0589f15f77827d935988e9cead2882b6a8aeb";

// Inicializar EmailJS
emailjs.init("BQTyfK6ZxP0X2Wp6V");

// Capturar elementos
const form = document.getElementById("bookingForm");
const priceDisplay = document.getElementById("price");
const calcularBtn = document.getElementById("calculatePrice");
const reservarBtn = document.querySelector(".button-reservar");

// -----------------------------
// Calcular precio
// -----------------------------
calcularBtn.addEventListener("click", function() {
    const corte = parseFloat(document.getElementById("corte").value);
    const personas = parseInt(document.getElementById("people").value);
    const estudiante = document.getElementById("student").checked;

    if (!corte || !personas) {
        alert("Por favor completa los campos para calcular el precio.");
        return;
    }

    let total = corte * personas;
    if (estudiante) total *= 0.8;

    priceDisplay.innerText = `Precio final: €${total.toFixed(2)} ${estudiante ? "(20% descuento estudiante)" : ""}`;
});

// -----------------------------
// Enviar reserva
// -----------------------------
reservarBtn.addEventListener("click", async function() {
    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const ubicacion = document.getElementById("location").value.trim();
    const corte = parseFloat(document.getElementById("corte").value);
    const hora = document.getElementById("hora").value;
    const fecha = document.getElementById("fecha").value;
    const personas = parseInt(document.getElementById("people").value);
    const estudiante = document.getElementById("student").checked;

    // Validar campos obligatorios
    if (!nombre || !email || !telefono || !ubicacion || !corte || !personas || !hora || !fecha) {
        alert("Por favor completa todos los campos antes de reservar.");
        return;
    }

    // Calcular precio
    let total = corte * personas;
    if (estudiante) total *= 0.8;
    total = total.toFixed(2);

    // Crear objeto reserva
    const reserva = {
        nombre,
        email,
        telefono,
        ubicacion,
        corte,
        hora,
        fecha,
        personas,
        estudiante,
        total,
        fechaRegistro: new Date().toLocaleString()
    };

    // Mostrar precio y confirmación
    priceDisplay.innerText = `Precio final: €${reserva.total} ${estudiante ? "(20% descuento estudiante)" : ""}`;
    alert(`Reserva confirmada para ${nombre}.\nPrecio total: €${reserva.total} a las ${hora}Hs`);

    // Guardar en localStorage
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    // -----------------------------
    // Enviar correos con EmailJS
    // -----------------------------
    try {
        await emailjs.send("service_lp866zi", "template_hts19md", {
            nombre: reserva.nombre,
            email: reserva.email,
            telefono: reserva.telefono,
            fecha: reserva.fecha,
            hora: reserva.hora,
            ubicacion: reserva.ubicacion,
            personas: reserva.personas,
            estudiante: estudiante ? "Sí" : "No",
            total: reserva.total
        });

        await emailjs.send("service_lp866zi", "template_6rixhcf", {
            nombre: reserva.nombre,
            email: reserva.email,
            fecha: reserva.fecha,
            hora: reserva.hora,
            ubicacion: reserva.ubicacion,
            personas: reserva.personas,
            total: reserva.total
        });
    } catch (error) {
        console.error("Error EmailJS:", error);
    }

    // -----------------------------
    // Guardar en Airtable
    // -----------------------------
    try {
        const airtableRes = await fetch("https://api.airtable.com/v0/appgG1VvrRSPtJajp/Leads", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    nombre,
                    telefono,
                    email,
                    fecha_corte: fecha,
                    hora,
                    ubicacion,
                    tipo_corte: corte,
                    personas,
                    estudiante: estudiante ? "Sí" : "No",
                    total
                }
            })
        });

        if (!airtableRes.ok) {
            console.error("Error al guardar en Airtable");
        }
    } catch (error) {
        console.error("Error de conexión a Airtable:", error);
    }

    // Limpiar formulario y precio mostrado
    form.reset();
    priceDisplay.innerText = "";
});
