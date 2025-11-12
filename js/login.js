function validarLogin() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');
    if (!email || !password) {
      errorMsg.textContent = 'Por favor, llena todos los campos.';
      errorMsg.style.display = 'block';
    } else {
      errorMsg.style.display = 'none';
    }
  }