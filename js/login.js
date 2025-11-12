document.addEventListener('DOMContentLoaded', function() {
    // --- Elementos del DOM ---
    const userTypeSelector = document.querySelectorAll('.user-type');
    const formSections = document.querySelectorAll('.form-section');
    const patientRegisterForm = document.getElementById('patient-register-form');
    const doctorRegisterForm = document.getElementById('doctor-register-form');
    const adminRegisterForm = document.getElementById('admin-register-form');
    const adminLoginInfo = document.getElementById('admin-login-info');
    const adminRegisterInfo = document.getElementById('admin-register-info');
    const loginTitle = document.getElementById('login-title');
    const loginSubtitle = document.getElementById('login-subtitle');
    const registerTitle = document.getElementById('register-title');
    const registerSubtitle = document.getElementById('register-subtitle');
    const loginButton = document.getElementById('login-button');
    
    // --- Navegación (Mostrar/ocultar secciones) ---
    document.getElementById('show-register').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('register-section');
        updateRegisterForm();
    });
    
    document.getElementById('show-forgot').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('forgot-section');
    });
    
    document.getElementById('show-login').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('login-section');
        updateLoginUI();
    });
    
    document.getElementById('show-login-from-forgot').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('login-section');
        updateLoginUI();
    });
    
    // --- Lógica de UI (Selector de Tipo de Usuario) ---
    userTypeSelector.forEach(type => {
        type.addEventListener('click', function() {
            userTypeSelector.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateLoginUI();
            if (document.getElementById('register-section').classList.contains('active')) {
                updateRegisterForm();
            }
        });
    });
    
    function showSection(sectionId) {
        formSections.forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');
        if (sectionId === 'login-section') {
            updateLoginUI();
        }
    }
    
    function updateRegisterForm() {
        const activeType = document.querySelector('.user-type.active').getAttribute('data-type');
        patientRegisterForm.classList.add('hidden');
        doctorRegisterForm.classList.add('hidden');
        adminRegisterForm.classList.add('hidden');
        adminRegisterInfo.classList.add('hidden');
        
        if (activeType === 'patient') {
            patientRegisterForm.classList.remove('hidden');
            registerTitle.textContent = 'Registrarse como Paciente';
            registerSubtitle.textContent = 'Crea una nueva cuenta de paciente';
        } else if (activeType === 'doctor') {
            doctorRegisterForm.classList.remove('hidden');
            registerTitle.textContent = 'Registrarse como Doctor';
            registerSubtitle.textContent = 'Crea una nueva cuenta de doctor';
        } else if (activeType === 'admin') {
            adminRegisterForm.classList.remove('hidden');
            adminRegisterInfo.classList.remove('hidden');
            registerTitle.textContent = 'Registro de Administrador';
            registerSubtitle.textContent = 'Solicitar cuenta de administrador';
        }
    }
    
    function updateLoginUI() {
        const activeType = document.querySelector('.user-type.active').getAttribute('data-type');
        if (activeType === 'patient') {
            loginTitle.textContent = 'Iniciar Sesión como Paciente';
            loginSubtitle.textContent = 'Accede a tu cuenta de paciente';
            loginButton.textContent = 'Iniciar Sesión';
            adminLoginInfo.classList.add('hidden');
        } else if (activeType === 'doctor') {
            loginTitle.textContent = 'Iniciar Sesión como Doctor';
            loginSubtitle.textContent = 'Accede a tu cuenta de doctor';
            loginButton.textContent = 'Iniciar Sesión';
            adminLoginInfo.classList.add('hidden');
        } else if (activeType === 'admin') {
            loginTitle.textContent = 'Acceso de Administrador';
            loginSubtitle.textContent = 'Panel de control del sistema';
            loginButton.textContent = 'Acceder al Panel Admin';
            adminLoginInfo.classList.remove('hidden');
        }
    }
    
    // --- LÓGICA DE FORMULARIOS (VALIDACIÓN Y ENVÍO) ---

    /**
     * INICIO DE SESIÓN (Corregido con Fetch)
     */
    document.getElementById('login-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (validateLoginForm()) {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const activeType = document.querySelector('.user-type.active').getAttribute('data-type');
            
            // Convertir 'patient' a 'Paciente', 'doctor' a 'Doctor', etc.
            const role = activeType.charAt(0).toUpperCase() + activeType.slice(1);

            const data = {
                accion: 'login_usuario',
                email: email,
                password: password,
                role: role
            };

            try {
                const response = await fetch('php/api_login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert(result.message);
                    window.location.href = result.redirect; // Redirigir a la página correcta
                } else {
                    showError('login-password-error', result.message);
                }
            } catch (error) {
                showError('login-password-error', 'Error de conexión. Inténtalo de nuevo.');
            }
        }
    });

    /**
     * REGISTRO DE PACIENTE (Corregido con Fetch y FormData)
     */
    document.getElementById('patient-register-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        if (validatePatientRegisterForm()) {
            
            const formData = new FormData(patientRegisterForm);
            // Añadimos la acción para que el backend la reconozca
            formData.append('accion', 'registrar_paciente');

            try {
                const response = await fetch('php/api_login.php', {
                    method: 'POST',
                    body: formData // No se usa headers con FormData, el navegador lo pone solo
                });
                const result = await response.json();

                if (result.status === 'success') {
                    alert(result.message);
                    // Éxito, mostrar la sección de login
                    showSection('login-section');
                    updateLoginUI();
                    document.getElementById('login-email').value = formData.get('patient-email'); // Rellenar email
                    hideError('patient-confirm-password-error');
                } else {
                    // Mostrar error (ej. email duplicado)
                    showError('patient-confirm-password-error', result.message);
                }
            } catch (error) {
                showError('patient-confirm-password-error', 'Error de conexión. Inténtalo de nuevo.');
            }
        }
    });
    
    // (Simulación) Registro de Doctor
    document.getElementById('doctor-register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateDoctorRegisterForm()) {
            alert('El registro de doctores debe ser gestionado por un administrador desde el panel.');
            // window.location.href = 'doctor.html';
        }
    });
    
    // (Simulación) Registro de Admin
    document.getElementById('admin-register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateAdminRegisterForm()) {
            alert('Solicitud de registro de administrador enviada (simulación)');
            // window.location.href = 'login.html';
        }
    });
    
    // (Simulación) Olvidó Contraseña
    document.getElementById('forgot-form').addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateForgotForm()) {
            document.getElementById('forgot-success').style.display = 'block';
        }
    });
    
    // --- Funciones de validación (Tu código original) ---
    // (Estas funciones están bien escritas, las conservamos)
    function validateLoginForm() {
        let isValid = true;
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        if (!validateEmail(email)) {
            showError('login-email-error', 'Por favor ingresa un correo electrónico válido');
            isValid = false;
        } else {
            hideError('login-email-error');
        }
        if (password.length < 6) { // La validación de login es menos estricta
            showError('login-password-error', 'La contraseña es obligatoria.');
            isValid = false;
        } else {
            hideError('login-password-error');
        }
        return isValid;
    }
    
    function validatePatientRegisterForm() {
        let isValid = true;
        const name = document.getElementById('patient-name').value;
        if (name.trim().length < 2) {
            showError('patient-name-error', 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        } else {
            hideError('patient-name-error');
        }
        const email = document.getElementById('patient-email').value;
        if (!validateEmail(email)) {
            showError('patient-email-error', 'Por favor ingresa un correo electrónico válido');
            isValid = false;
        } else {
            hideError('patient-email-error');
        }
        const phone = document.getElementById('patient-phone').value;
        if (!validatePhone(phone)) {
            showError('patient-phone-error', 'Ingresa un teléfono válido (10 dígitos)');
            isValid = false;
        } else {
            hideError('patient-phone-error');
        }
        const birthdate = document.getElementById('patient-birthdate').value;
        if (!birthdate) {
            showError('patient-birthdate-error', 'Por favor ingresa tu fecha de nacimiento');
            isValid = false;
        } else {
            hideError('patient-birthdate-error');
        }
        const gender = document.getElementById('patient-gender').value;
        if (!gender) {
            showError('patient-gender-error', 'Por favor selecciona tu género');
            isValid = false;
        } else {
            hideError('patient-gender-error');
        }
        const password = document.getElementById('patient-password').value;
        if (!validatePassword(password)) {
            showError('patient-password-error', 'La contraseña no cumple con los requisitos');
            isValid = false;
        } else {
            hideError('patient-password-error');
        }
        const confirmPassword = document.getElementById('patient-confirm-password').value;
        if (password !== confirmPassword) {
            showError('patient-confirm-password-error', 'Las contraseñas no coinciden');
            isValid = false;
        } else {
            hideError('patient-confirm-password-error');
        }
        return isValid;
    }
    
    function validateDoctorRegisterForm() {
        // (Validaciones de doctor - sin cambios)
        let isValid = true;
        const name = document.getElementById('doctor-name').value;
        if (name.trim().length < 2) { showError('doctor-name-error', 'El nombre debe tener al menos 2 caracteres'); isValid = false; } else { hideError('doctor-name-error'); }
        const email = document.getElementById('doctor-email').value;
        if (!validateEmail(email)) { showError('doctor-email-error', 'Por favor ingresa un correo electrónico válido'); isValid = false; } else { hideError('doctor-email-error'); }
        const phone = document.getElementById('doctor-phone').value;
        if (!validatePhone(phone)) { showError('doctor-phone-error', 'Por favor ingresa un número de teléfono válido'); isValid = false; } else { hideError('doctor-phone-error'); }
        const specialty = document.getElementById('doctor-specialty').value;
        if (!specialty.trim()) { showError('doctor-specialty-error', 'Por favor ingresa tu especialidad'); isValid = false; } else { hideError('doctor-specialty-error'); }
        const license = document.getElementById('doctor-license').value;
        if (!license.trim()) { showError('doctor-license-error', 'Por favor ingresa tu número de licencia'); isValid = false; } else { hideError('doctor-license-error'); }
        const hospital = document.getElementById('doctor-hospital').value;
        if (!hospital.trim()) { showError('doctor-hospital-error', 'Por favor ingresa tu hospital o clínica'); isValid = false; } else { hideError('doctor-hospital-error'); }
        const password = document.getElementById('doctor-password').value;
        if (!validatePassword(password)) { showError('doctor-password-error', 'La contraseña no cumple con los requisitos'); isValid = false; } else { hideError('doctor-password-error'); }
        const confirmPassword = document.getElementById('doctor-confirm-password').value;
        if (password !== confirmPassword) { showError('doctor-confirm-password-error', 'Las contraseñas no coinciden'); isValid = false; } else { hideError('doctor-confirm-password-error'); }
        return isValid;
    }
    
    function validateAdminRegisterForm() {
        // (Validaciones de admin - sin cambios)
        let isValid = true;
        const name = document.getElementById('admin-name').value;
        if (name.trim().length < 2) { showError('admin-name-error', 'El nombre debe tener al menos 2 caracteres'); isValid = false; } else { hideError('admin-name-error'); }
        const email = document.getElementById('admin-email').value;
        if (!validateEmail(email)) { showError('admin-email-error', 'Por favor ingresa un correo electrónico válido'); isValid = false; } else { hideError('admin-email-error'); }
        const phone = document.getElementById('admin-phone').value;
        if (!validatePhone(phone)) { showError('admin-phone-error', 'Por favor ingresa un número de teléfono válido'); isValid = false; } else { hideError('admin-phone-error'); }
        const department = document.getElementById('admin-department').value;
        if (!department) { showError('admin-department-error', 'Por favor selecciona tu departamento'); isValid = false; } else { hideError('admin-department-error'); }
        const code = document.getElementById('admin-code').value;
        if (!code.trim()) { showError('admin-code-error', 'Por favor ingresa el código de verificación'); isValid = false; } else { hideError('admin-code-error'); }
        const password = document.getElementById('admin-password').value;
        if (!validateAdminPassword(password)) { showError('admin-password-error', 'La contraseña debe tener al menos 10 caracteres, incluyendo una mayúscula, un número y un carácter especial'); isValid = false; } else { hideError('admin-password-error'); }
        const confirmPassword = document.getElementById('admin-confirm-password').value;
        if (password !== confirmPassword) { showError('admin-confirm-password-error', 'Las contraseñas no coinciden'); isValid = false; } else { hideError('admin-confirm-password-error'); }
        return isValid;
    }
    
    function validateForgotForm() {
        let isValid = true;
        const email = document.getElementById('forgot-email').value;
        if (!validateEmail(email)) {
            showError('forgot-email-error', 'Por favor ingresa un correo electrónico válido');
            isValid = false;
        } else {
            hideError('forgot-email-error');
        }
        return isValid;
    }
    
    // --- Funciones auxiliares de validación (Tu código original) ---
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const re = /^[0-9+\-\s()]{10,}$/; // Validar 10 digitos
        return re.test(phone);
    }
    
    function validatePassword(password) {
        // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return re.test(password);
    }
    
    function validateAdminPassword(password) {
        // Al menos 10 caracteres, una mayúscula, un número y un carácter especial
        const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        return re.test(password);
    }
    
    function showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        errorElement.style.display = 'none';
    }
    
    // Inicializar la interfaz
    updateLoginUI();

});