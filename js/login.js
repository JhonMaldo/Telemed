// Elementos del DOM
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
        
        // Mostrar/ocultar secciones
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
        
        // Cambiar tipo de usuario
        userTypeSelector.forEach(type => {
            type.addEventListener('click', function() {
                userTypeSelector.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Actualizar la interfaz según el tipo de usuario
                updateLoginUI();
                
                // Si estamos en la sección de registro, actualizar el formulario
                if (document.getElementById('register-section').classList.contains('active')) {
                    updateRegisterForm();
                }
            });
        });
        
        // Función para mostrar sección
        function showSection(sectionId) {
            formSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(sectionId).classList.add('active');
            
            // Actualizar la interfaz según el tipo de usuario
            if (sectionId === 'login-section') {
                updateLoginUI();
            }
        }
        
        // Actualizar formulario de registro según el tipo de usuario
        function updateRegisterForm() {
            const activeType = document.querySelector('.user-type.active').getAttribute('data-type');
            
            // Ocultar todos los formularios primero
            patientRegisterForm.classList.add('hidden');
            doctorRegisterForm.classList.add('hidden');
            adminRegisterForm.classList.add('hidden');
            adminRegisterInfo.classList.add('hidden');
            
            // Mostrar el formulario correspondiente
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
        
        // Actualizar la interfaz de login según el tipo de usuario
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
        
        // Validación de formularios
        document.getElementById('login-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateLoginForm()) {
                const activeType = document.querySelector('.user-type.active').getAttribute('data-type');
                
                // Redirigir según el tipo de usuario
                if (activeType === 'patient') {
                    window.location.href = 'paciente.html';
                } else if (activeType === 'doctor') {
                    window.location.href = 'doctor.html';
                } else if (activeType === 'admin') {
                    window.location.href = 'admin.html';
                }
            }
        });
        
        document.getElementById('patient-register-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validatePatientRegisterForm()) {
                // Aquí iría la lógica para enviar los datos al servidor
                alert('Registro de paciente exitoso (simulación)');
                window.location.href = 'paciente.html';
            }
        });
        
        document.getElementById('doctor-register-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateDoctorRegisterForm()) {
                // Aquí iría la lógica para enviar los datos al servidor
                alert('Registro de doctor exitoso (simulación)');
                window.location.href = 'doctor.html';
            }
        });
        
        document.getElementById('admin-register-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateAdminRegisterForm()) {
                // Aquí iría la lógica para enviar los datos al servidor
                alert('Solicitud de registro de administrador enviada (simulación)');
                window.location.href = 'login.html';
            }
        });
        
        document.getElementById('forgot-form').addEventListener('submit', function(e) {
            e.preventDefault();
            if (validateForgotForm()) {
                document.getElementById('forgot-success').style.display = 'block';
                // Aquí iría la lógica para enviar el correo de recuperación
            }
        });
        
        // Funciones de validación
        function validateLoginForm() {
            let isValid = true;
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Validar email
            if (!validateEmail(email)) {
                showError('login-email-error', 'Por favor ingresa un correo electrónico válido');
                isValid = false;
            } else {
                hideError('login-email-error');
            }
            
            // Validar contraseña
            if (password.length < 6) {
                showError('login-password-error', 'La contraseña debe tener al menos 6 caracteres');
                isValid = false;
            } else {
                hideError('login-password-error');
            }
            
            return isValid;
        }
        
        function validatePatientRegisterForm() {
            let isValid = true;
            
            // Validar nombre
            const name = document.getElementById('patient-name').value;
            if (name.trim().length < 2) {
                showError('patient-name-error', 'El nombre debe tener al menos 2 caracteres');
                isValid = false;
            } else {
                hideError('patient-name-error');
            }
            
            // Validar email
            const email = document.getElementById('patient-email').value;
            if (!validateEmail(email)) {
                showError('patient-email-error', 'Por favor ingresa un correo electrónico válido');
                isValid = false;
            } else {
                hideError('patient-email-error');
            }
            
            // Validar teléfono
            const phone = document.getElementById('patient-phone').value;
            if (!validatePhone(phone)) {
                showError('patient-phone-error', 'Por favor ingresa un número de teléfono válido');
                isValid = false;
            } else {
                hideError('patient-phone-error');
            }
            
            // Validar fecha de nacimiento
            const birthdate = document.getElementById('patient-birthdate').value;
            if (!birthdate) {
                showError('patient-birthdate-error', 'Por favor ingresa tu fecha de nacimiento');
                isValid = false;
            } else {
                hideError('patient-birthdate-error');
            }
            
            // Validar género
            const gender = document.getElementById('patient-gender').value;
            if (!gender) {
                showError('patient-gender-error', 'Por favor selecciona tu género');
                isValid = false;
            } else {
                hideError('patient-gender-error');
            }
            
            // Validar contraseña
            const password = document.getElementById('patient-password').value;
            if (!validatePassword(password)) {
                showError('patient-password-error', 'La contraseña no cumple con los requisitos');
                isValid = false;
            } else {
                hideError('patient-password-error');
            }
            
            // Validar confirmación de contraseña
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
            let isValid = true;
            
            // Validar nombre
            const name = document.getElementById('doctor-name').value;
            if (name.trim().length < 2) {
                showError('doctor-name-error', 'El nombre debe tener al menos 2 caracteres');
                isValid = false;
            } else {
                hideError('doctor-name-error');
            }
            
            // Validar email
            const email = document.getElementById('doctor-email').value;
            if (!validateEmail(email)) {
                showError('doctor-email-error', 'Por favor ingresa un correo electrónico válido');
                isValid = false;
            } else {
                hideError('doctor-email-error');
            }
            
            // Validar teléfono
            const phone = document.getElementById('doctor-phone').value;
            if (!validatePhone(phone)) {
                showError('doctor-phone-error', 'Por favor ingresa un número de teléfono válido');
                isValid = false;
            } else {
                hideError('doctor-phone-error');
            }
            
            // Validar especialidad
            const specialty = document.getElementById('doctor-specialty').value;
            if (!specialty.trim()) {
                showError('doctor-specialty-error', 'Por favor ingresa tu especialidad');
                isValid = false;
            } else {
                hideError('doctor-specialty-error');
            }
            
            // Validar licencia
            const license = document.getElementById('doctor-license').value;
            if (!license.trim()) {
                showError('doctor-license-error', 'Por favor ingresa tu número de licencia');
                isValid = false;
            } else {
                hideError('doctor-license-error');
            }
            
            // Validar hospital/clínica
            const hospital = document.getElementById('doctor-hospital').value;
            if (!hospital.trim()) {
                showError('doctor-hospital-error', 'Por favor ingresa tu hospital o clínica');
                isValid = false;
            } else {
                hideError('doctor-hospital-error');
            }
            
            // Validar contraseña
            const password = document.getElementById('doctor-password').value;
            if (!validatePassword(password)) {
                showError('doctor-password-error', 'La contraseña no cumple con los requisitos');
                isValid = false;
            } else {
                hideError('doctor-password-error');
            }
            
            // Validar confirmación de contraseña
            const confirmPassword = document.getElementById('doctor-confirm-password').value;
            if (password !== confirmPassword) {
                showError('doctor-confirm-password-error', 'Las contraseñas no coinciden');
                isValid = false;
            } else {
                hideError('doctor-confirm-password-error');
            }
            
            return isValid;
        }
        
        function validateAdminRegisterForm() {
            let isValid = true;
            
            // Validar nombre
            const name = document.getElementById('admin-name').value;
            if (name.trim().length < 2) {
                showError('admin-name-error', 'El nombre debe tener al menos 2 caracteres');
                isValid = false;
            } else {
                hideError('admin-name-error');
            }
            
            // Validar email
            const email = document.getElementById('admin-email').value;
            if (!validateEmail(email)) {
                showError('admin-email-error', 'Por favor ingresa un correo electrónico válido');
                isValid = false;
            } else {
                hideError('admin-email-error');
            }
            
            // Validar teléfono
            const phone = document.getElementById('admin-phone').value;
            if (!validatePhone(phone)) {
                showError('admin-phone-error', 'Por favor ingresa un número de teléfono válido');
                isValid = false;
            } else {
                hideError('admin-phone-error');
            }
            
            // Validar departamento
            const department = document.getElementById('admin-department').value;
            if (!department) {
                showError('admin-department-error', 'Por favor selecciona tu departamento');
                isValid = false;
            } else {
                hideError('admin-department-error');
            }
            
            // Validar código de verificación
            const code = document.getElementById('admin-code').value;
            if (!code.trim()) {
                showError('admin-code-error', 'Por favor ingresa el código de verificación');
                isValid = false;
            } else {
                hideError('admin-code-error');
            }
            
            // Validar contraseña (más estricta para administradores)
            const password = document.getElementById('admin-password').value;
            if (!validateAdminPassword(password)) {
                showError('admin-password-error', 'La contraseña debe tener al menos 10 caracteres, incluyendo una mayúscula, un número y un carácter especial');
                isValid = false;
            } else {
                hideError('admin-password-error');
            }
            
            // Validar confirmación de contraseña
            const confirmPassword = document.getElementById('admin-confirm-password').value;
            if (password !== confirmPassword) {
                showError('admin-confirm-password-error', 'Las contraseñas no coinciden');
                isValid = false;
            } else {
                hideError('admin-confirm-password-error');
            }
            
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
        
        // Funciones auxiliares de validación
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        function validatePhone(phone) {
            const re = /^[0-9+\-\s()]{10,}$/;
            return re.test(phone);
        }
        
        function validatePassword(password) {
            // Al menos 8 caracteres, una mayúscula, un número y un carácter especial
            const re = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return re.test(password);
        }
        
        function validateAdminPassword(password) {
            // Al menos 10 caracteres, una mayúscula, un número y un carácter especial (más estricto)
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