// Mostrar / ocultar login
function toggleLogin() {
  const modal = document.getElementById("login-modal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

// CHATBOT
function sendMessage() {
  const input = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");

  const userText = input.value.trim();
  if (userText === "") return;

  // Mensaje del usuario
  const userMsg = document.createElement("div");
  userMsg.classList.add("message", "user");
  userMsg.textContent = "👤 " + userText;
  chatBox.appendChild(userMsg);
  chatBox.scrollTop = chatBox.scrollHeight;

  // Respuesta del bot
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.classList.add("message", "bot");
    botMsg.textContent = "👩‍⚕️ He recibido tu mensaje: \"" + userText + "\". Un médico lo revisará pronto.";
    chatBox.appendChild(botMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 1000);

  input.value = "";
}

// Enviar con Enter
document.getElementById("user-input").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// FORMULARIO DE CONSULTA
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
    Confirmación enviada a ${correo}.`;

  document.getElementById("cita-confirmada").style.display = "block";

  // Reset
  document.getElementById("consulta-form").reset();
});
