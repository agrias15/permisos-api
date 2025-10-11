const planta = document.getElementById('planta');
const punto = document.getElementById('punto');
const coordX = document.getElementById('coordX');
const coordY = document.getElementById('coordY');

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
});

// 🎯 Capturar el submit del formulario
document.getElementById("permisoForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  // Crear objeto con los datos del formulario
  const data = Object.fromEntries(new FormData(this));

  try {
    // 🚀 Enviar datos al backend con fetch
    const response = await fetch("http://localhost:3000/guardar", {
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
      this.reset();
      punto.style.display = "none"; // Ocultar punto después de guardar
    } else {
      alert("❌ Error al guardar: " + result.error);
      console.error("Error:", result);
    }
  } catch (error) {
    console.error("⚠️ Error en la conexión:", error);
    alert("⚠️ No se pudo conectar con el servidor.");
  }
});
