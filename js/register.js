function toggleRole() {
      const role = document.getElementById("role").value;
      document.getElementById("paciente-fields").style.display = (role === "paciente") ? "block" : "none";
      document.getElementById("doctor-fields").style.display = (role === "doctor") ? "block" : "none";
    }

    function validarRegistro() {
      const role = document.getElementById("role").value;
      const nombre = document.getElementById("nombre").value.trim();
      const correo = document.getElementById("correo").value.trim();
      const contraseña = document.getElementById("contraseña").value.trim();
      const errorMsg = document.getElementById("error-msg");
      let camposValidos = nombre && correo && contraseña && role;

      if (role === "paciente") {
        const fecha = document.getElementById("fecha").value.trim();
        const motivo = document.getElementById("motivo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        camposValidos = camposValidos && fecha && motivo && telefono;
      } else if (role === "doctor") {
        const especialidad = document.getElementById("especialidad").value.trim();
        const cedula = document.getElementById("cedula").value.trim();
        const cv = document.getElementById("cv").value.trim();
        camposValidos = camposValidos && especialidad && cedula && cv;
      }

      if (!camposValidos) {
        errorMsg.textContent = "Por favor, llena todos los campos requeridos.";
        errorMsg.style.display = "block";
      } else {
        errorMsg.style.display = "none";
        // Aquí puedes agregar la lógica para enviar el formulario
      }
    }

    function toggleRole() {
  const role = document.getElementById("role").value;
  document.getElementById("paciente-fields").style.display = role === "paciente" ? "block" : "none";
  document.getElementById("doctor-fields").style.display = role === "doctor" ? "block" : "none";
}

// Registro y redirección
document.getElementById("register-form").addEventListener("submit", function(e) {
  e.preventDefault();
  const role = document.getElementById("role").value;
  if (!role) {
    document.getElementById("error-msg").textContent = "Selecciona tu rol.";
    document.getElementById("error-msg").style.display = "block";
    return;
  }
  // Aquí podrías agregar más validaciones si lo deseas

  if (role === "doctor") {
    window.location.href = "doctorIndex.html";
  } else {
    window.location.href = "index.html";
  }
});