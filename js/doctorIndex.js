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

// Medical Records - Patient Selection
document.querySelectorAll('.record-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.record-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
        
        const patientName = this.querySelector('h4').textContent;
        document.querySelector('.records-content h3').textContent = `Expediente de ${patientName}`;
    });
});

// Notifications - Mark as read
document.querySelectorAll('.notification-item.unread').forEach(item => {
    item.addEventListener('click', function() {
        this.classList.remove('unread');
        
        const badge = document.querySelector('.notification-badge');
        let count = parseInt(badge.textContent);
        if (count > 0) {
            count--;
            badge.textContent = count;
        }
    });
});

// Sample data for demonstration
document.addEventListener('DOMContentLoaded', function() {
    // Set current date for next appointment
    const nextAppointment = document.getElementById('next-appointment');
    if (nextAppointment) {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        nextAppointment.valueAsDate = nextMonth;
    }
});