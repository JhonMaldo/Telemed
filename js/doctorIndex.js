// Navigation
document.querySelectorAll('.menu-item').forEach(item => {
    if (item.dataset.section) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            showSection(this.dataset.section);
        });
    }
});

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Cargar datos dinámicos cuando se active la sección
    if (sectionId === 'patients') {
        cargarPacientes();
    }
    if (sectionId === 'consultations') {
        cargarConsultas();
    }
    
    // Update section title
    const titles = {
        'dashboard': 'Dashboard',
        'patients': 'Mis Pacientes',
        'consultations': 'Consultas',
        'medical-records': 'Expedientes Médicos',
        'prescriptions': 'Recetas Médicas',
        'notifications': 'Notificaciones'
    };
    
    document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';
}

// Cargar pacientes desde la base de datos
function cargarPacientes() {
    const loadingElement = document.getElementById('loading-pacientes');
    const container = document.getElementById('patients-list-container');
    const noPatientsMessage = document.getElementById('no-patients-message');
    
    // Mostrar loading
    loadingElement.style.display = 'block';
    container.innerHTML = '';
    noPatientsMessage.style.display = 'none';
    
    fetch('database/get_pacientes.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarPacientes(data.pacientes);
            } else {
                console.error('Error:', data.error);
                container.innerHTML = '<div class="error-message">Error al cargar pacientes: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="error-message">Error al conectar con el servidor</div>';
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });
}

// Mostrar pacientes en el HTML
function mostrarPacientes(pacientes) {
    const container = document.getElementById('patients-list-container');
    const noPatientsMessage = document.getElementById('no-patients-message');
    
    if (pacientes.length === 0) {
        noPatientsMessage.style.display = 'block';
        return;
    }

    let html = '';
    pacientes.forEach(paciente => {
        // Calcular edad aproximada desde la fecha de registro
        const fechaRegistro = new Date(paciente.creado_en);
        const edad = Math.abs(new Date().getFullYear() - fechaRegistro.getFullYear());
        
        html += `
            <div class="patient-item">
                <div class="patient-info">
                    <div class="patient-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="patient-details">
                        <h4>${paciente.nombre_completo}</h4>
                        <p><i class="fas fa-birthday-cake"></i> ${edad} años</p>
                        <p><i class="fas fa-envelope"></i> ${paciente.corre_electronico}</p>
                        <p><i class="fas fa-calendar"></i> Registrado: ${new Date(paciente.creado_en).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="appointment-actions">
                    <button class="btn" onclick="verExpediente(${paciente.id_usuario})">Ver Expediente</button>
                    <button class="btn btn-success" onclick="agendarCita(${paciente.id_usuario})">Agendar Cita</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Función para ver expediente
function verExpediente(idPaciente) {
    alert('Ver expediente del paciente ID: ' + idPaciente);
    // Aquí puedes redirigir o cargar el expediente
}

// Función para agendar cita
function agendarCita(idPaciente) {
    alert('Agendar cita con paciente ID: ' + idPaciente);
    // Aquí puedes abrir un modal para agendar cita
}

// Función para cargar consultas
// Función para cargar consultas
function cargarConsultas() {
    const loadingElement = document.getElementById('loading-consultas');
    const container = document.getElementById('consultas-list-container');
    const noConsultasMessage = document.getElementById('no-consultas-message');
    
    loadingElement.style.display = 'block';
    container.innerHTML = '';
    noConsultasMessage.style.display = 'none';

    // 🔥 CORREGIR ESTA LÍNEA: cambiar 'databases' por 'database'
    fetch('database/get_consultas.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarConsultas(data.consultas);
            } else {
                console.error('Error:', data.error);
                container.innerHTML = '<div class="error-message">Error al cargar consultas: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="error-message">Error al conectar con el servidor</div>';
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });
}

// Función para mostrar consultas
function mostrarConsultas(consultas) {
    const container = document.getElementById('consultas-list-container');
    const noConsultasMessage = document.getElementById('no-consultas-message');
    
    console.log('📋 Consultas recibidas:', consultas);
    
    if (!consultas || consultas.length === 0) {
        noConsultasMessage.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    let html = '';
    consultas.forEach(consulta => {
        // Formatear fecha más legible
        const fecha = new Date(consulta.fecha_inicio);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        html += `
            <div class="appointment-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <div class="appointment-info">
                    <h4>Consulta #${consulta.id_consulta || 'N/A'}</h4>
                    <p><i class="far fa-calendar"></i> <strong>Fecha:</strong> ${fechaFormateada}</p>
                    <p><i class="fas fa-info-circle"></i> <strong>Notas:</strong> ${consulta.notas || 'Sin notas'}</p>
                    ${consulta.url_video && consulta.url_video !== '' ? 
                        `<p><i class="fas fa-video"></i> <a href="${consulta.url_video}" target="_blank">Ver grabación</a></p>` : 
                        '<p><i class="fas fa-video"></i> No hay grabación disponible</p>'
                    }
                    <p><i class="fas fa-record-vinyl"></i> <strong>Grabado:</strong> ${consulta.grabado ? 'Sí' : 'No'}</p>
                </div>
                <div class="appointment-actions" style="margin-top: 10px;">
                    <button class="btn btn-success">Iniciar Consulta</button>
                    <button class="btn">Ver Detalles</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    noConsultasMessage.style.display = 'none';
}