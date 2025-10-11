const planta = document.getElementById('planta');
const punto = document.getElementById('punto');
const coordX = document.getElementById('coordX');
const coordY = document.getElementById('coordY');
const btnGuardar = document.getElementById('btnGuardar');

// 🎯 Capturar coordenadas al hacer clic en la imagen
planta.addEventListener('click', function(event) {
  const rect = planta.getBoundingClientRect();

  // Coordenadas normalizadas (0-1)
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  // Guardamos en los inputs ocultos
  coordX.value = x.toFixed(4);
  coordY.value = y.toFixed(4);

  // 🔥 Mostrar el punto en la imagen
  punto.style.left = (event.clientX - rect.left) + "px";
  punto.style.top  = (event.clientY - rect.top) + "px";
  punto.style.display = "block";

  // ✅ Habilitar el botón Guardar una vez elegido el punto
  btnGuardar.disabled = false;
});

// 🎯 Capturar el submit del formulario
document.getElementById("permisoForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // 🚫 Validar de nuevo por seguridad
  if (!coordX.value || !coordY.value) {
    alert("⚠️ Debes seleccionar un punto en la imagen antes de guardar.");
    return;
  }

  // Crear objeto con los datos del formulario
  const data = Object.fromEntries(new FormData(this));

  //agregado nuevo para ver envio
  //console.log("📦 Datos enviados al backend:", data);

  try {
    // 🚀 Enviar datos al backend con fetch
    const response = await fetch("https://permisos-api-kefv.onrender.com/guardar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message + " (ID: " + result.id + ")");
      console.log("✅ Respuesta del servidor:", result);

      // 🔄 Resetear formulario y volver a desactivar botón
      this.reset();
      punto.style.display = "none";
      btnGuardar.disabled = true;
    } else {
      alert("❌ Error al guardar: " + result.error);
      console.error("Error:", result);
    }
  } catch (error) {
    console.error("⚠️ Error en la conexión:", error);
    alert("⚠️ No se pudo conectar con el servidor ojo.");
  }
});
