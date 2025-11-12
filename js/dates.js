// Función para manejar el formulario de consulta
document.getElementById("consulta-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const correo = document.getElementById("correo").value;
  const especialidad = document.getElementById("especialidad").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  // Mostrar confirmación
  document.getElementById("cita-detalle").textContent =
    `Paciente: ${nombre} | Especialidad: ${especialidad} | Fecha: ${fecha} a las ${hora}. 
    Se enviará confirmación a ${correo}.`;

  document.getElementById("cita-confirmada").style.display = "block";

  // Reiniciar formulario
  document.getElementById("consulta-form").reset();
});
