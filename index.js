//TOKEN AIR(guardarlo, es una clave) ...   pat5BqCS4qOEaudJB.4a2ad66e75c6aab59777827c52b0589f15f77827d935988e9cead2882b6a8aeb

// Verificar que EmailJS está cargado
console.log(emailjs);

// Manejar la reserva al hacer clic en "Reservar ahora"
document.querySelector(".button-reservar").addEventListener("click", async function() {
    // Obtener valores del formulario
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const telefono = document.getElementById("telefono").value;
    const ubicacion = document.getElementById("location").value;
    const corte = document.getElementById("corte").value;
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
    const precioBase = parseFloat(corte);
    let total = precioBase * personas;
    if (estudiante) total *= 0.8;

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
        total: total.toFixed(2),
        fechaRegistro: new Date().toLocaleString()
    };

    // Mostrar precio y confirmación
    document.getElementById("price").innerText =
        `Precio final: €${reserva.total} ${estudiante ? "(20% descuento estudiante)" : ""}`;
    alert(`Reserva confirmada para ${nombre}.\nPrecio total: €${reserva.total} a las ${hora}Hs`);

    // Guardar en localStorage
    let reservas = JSON.parse(localStorage.getItem("reservas")) || [];
    reservas.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(reservas));

    // -----------------------------
    // Enviar correos con EmailJS
    // -----------------------------
    try {
        // Correo al negocio
        await emailjs.send(
            "service_lp866zi",
            "template_hts19md",
            {
                nombre: reserva.nombre,
                email: reserva.email,
                telefono: reserva.telefono,
                fecha: reserva.fecha,
                hora: reserva.hora,
                ubicacion: reserva.ubicacion,
                personas: reserva.personas,
                estudiante: reserva.estudiante ? "Sí" : "No",
                total: reserva.total
            }
        );

        // Correo al cliente
        await emailjs.send(
            "service_lp866zi",
            "template_6rixhcf",
            {
                nombre: reserva.nombre,
                email: reserva.email,
                fecha: reserva.fecha,
                hora: reserva.hora,
                ubicacion: reserva.ubicacion,
                personas: reserva.personas,
                total: reserva.total
            }
        );
    } catch (error) {
        console.error("Error EmailJS:", error);
    }

    // -----------------------------
    // Enviar a Airtable
    // -----------------------------
    try {
        const airtableRes = await fetch("https://api.airtable.com/v0/appgG1VvrRSPtJajp/Leads", {
            method: "POST",
            headers: {
                "Authorization": "Bearer pat5BqCS4qOEaudJB.4a2ad66e75c6aab59777827c52b0589f15f77827d935988e9cead2882b6a8aeb",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fields: {
                    nombre: nombre,
                    telefono: telefono,
                    email: email,
                    fecha_corte: fecha,
                    hora: hora,
                    ubicacion: ubicacion,
                    tipo_corte: corte,
                    personas: personas,
                    estudiante: estudiante ? "Sí" : "No",
                    total: reserva.total
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
    document.getElementById("bookingForm").reset();
    document.getElementById("price").innerText = "";
});
