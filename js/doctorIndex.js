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
    if (sectionId === 'medical-records') {
        cargarExpedientes();
    }
    if (sectionId === 'prescriptions') {
        cargarRecetas();
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
    // Cambiar a la sección de expedientes y cargar el expediente específico
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-section="medical-records"]').classList.add('active');
    showSection('medical-records');
    
    // Esperar un momento para que cargue la lista y luego seleccionar el paciente
    setTimeout(() => {
        const pacienteItem = document.querySelector(`[data-paciente="${idPaciente}"]`);
        if (pacienteItem) {
            pacienteItem.click();
        } else {
            alert('Expediente no encontrado para este paciente');
        }
    }, 1000);
}

// Función para agendar cita
function agendarCita(idPaciente) {
    alert('Agendar cita con paciente ID: ' + idPaciente);
    // Aquí puedes abrir un modal para agendar cita
}

// Función para cargar consultas
function cargarConsultas() {
    const loadingElement = document.getElementById('loading-consultas');
    const container = document.getElementById('consultas-list-container');
    const noConsultasMessage = document.getElementById('no-consultas-message');
    
    loadingElement.style.display = 'block';
    container.innerHTML = '';
    noConsultasMessage.style.display = 'none';

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

// Función para cargar expedientes
function cargarExpedientes() {
    console.log('🔍 cargarExpedientes() ejecutándose...');
    
    const loadingElement = document.getElementById('loading-expedientes');
    const container = document.getElementById('lista-pacientes-expedientes');
    
    loadingElement.style.display = 'block';
    container.innerHTML = '';

    console.log('📡 Haciendo fetch a database/get_expedientes.php...');
    
    fetch('database/get_expedientes.php')
        .then(response => {
            console.log('📡 Status de respuesta:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('✅ Datos recibidos:', data);
            if (data.success) {
                mostrarListaPacientes(data.expedientes);
            } else {
                console.error('Error:', data.error);
                container.innerHTML = '<div class="error-message">Error al cargar expedientes: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            console.error('❌ Error en fetch:', error);
            container.innerHTML = '<div class="error-message">Error al conectar con el servidor: ' + error.message + '</div>';
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });
}

// Mostrar lista de pacientes con expediente
function mostrarListaPacientes(expedientes) {
    const container = document.getElementById('lista-pacientes-expedientes');
    
    if (!expedientes || expedientes.length === 0) {
        container.innerHTML = '<p>No hay expedientes registrados</p>';
        return;
    }

    let html = '';
    expedientes.forEach(expediente => {
        html += `
            <div class="record-item" data-paciente="${expediente.id_paciente}">
                <h4>${expediente.nombre_paciente}</h4>
                <p>${expediente.edad || 'Edad no disponible'} · ${expediente.enfermedades_cronicas || 'Sin diagnóstico'}</p>
            </div>
        `;
    });

    container.innerHTML = html;
    
    // Agregar event listeners a los items
    document.querySelectorAll('.record-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.record-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            const idPaciente = this.dataset.paciente;
            cargarExpedientePaciente(idPaciente);
        });
    });
}

// Cargar expediente específico de un paciente
function cargarExpedientePaciente(idPaciente) {
    const container = document.getElementById('expediente-detalle');
    container.innerHTML = '<p>Cargando expediente...</p>';

    fetch(`database/get_expediente.php?id_paciente=${idPaciente}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarExpedienteDetalle(data.expediente);
            } else {
                container.innerHTML = '<div class="error-message">Error: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            container.innerHTML = '<div class="error-message">Error al cargar expediente</div>';
        });
}

// Mostrar detalle del expediente
function mostrarExpedienteDetalle(expediente) {
    const container = document.getElementById('expediente-detalle');
    
    let html = `
        <h3>Expediente de ${expediente.nombre_paciente}</h3>
        <div class="expediente-info">
            <div class="form-group">
                <label for="historial-medico">Historial Médico</label>
                <textarea id="historial-medico" rows="4" class="form-control">${expediente.historial_medico || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="alergias">Alergias</label>
                <input type="text" id="alergias" class="form-control" value="${expediente.alergias || 'Ninguna'}">
            </div>
            
            <div class="form-group">
                <label for="medicacion-actual">Medicación Actual</label>
                <textarea id="medicacion-actual" rows="3" class="form-control">${expediente.medicacion_actual || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="enfermedades-cronicas">Enfermedades Crónicas</label>
                <input type="text" id="enfermedades-cronicas" class="form-control" value="${expediente.enfermedades_cronicas || 'Ninguna'}">
            </div>
            
            <div class="row">
                <div class="col">
                    <div class="form-group">
                        <label for="grupo-sanguineo">Grupo Sanguíneo</label>
                        <input type="text" id="grupo-sanguineo" class="form-control" value="${expediente.grupo_sanguineo || 'No registrado'}">
                    </div>
                </div>
                <div class="col">
                    <div class="form-group">
                        <label for="altura">Altura (m)</label>
                        <input type="number" id="altura" class="form-control" value="${expediente.altura || ''}" step="0.01">
                    </div>
                </div>
                <div class="col">
                    <div class="form-group">
                        <label for="peso">Peso (kg)</label>
                        <input type="number" id="peso" class="form-control" value="${expediente.peso || ''}" step="0.1">
                    </div>
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="actualizarExpediente(${expediente.id_paciente})">Actualizar Expediente</button>
        </div>
    `;

    container.innerHTML = html;
}

// Función para actualizar expediente (placeholder)
function actualizarExpediente(idPaciente) {
    alert('Actualizando expediente del paciente ID: ' + idPaciente);
    // Aquí iría la lógica para guardar los cambios
}

// Función para cargar recetas
function cargarRecetas() {
    console.log('🔍 cargarRecetas() ejecutándose...');
    
    const loadingElement = document.getElementById('loading-recetas');
    const container = document.getElementById('recetas-list-container');
    const noRecetasMessage = document.getElementById('no-recetas-message');
    
    // VERIFICACIÓN EXTRA SEGURA
    if (!loadingElement) {
        console.error('❌ Elemento loading-recetas no encontrado');
        return;
    }
    if (!container) {
        console.error('❌ Elemento recetas-list-container no encontrado');
        return;
    }
    
    console.log('✅ Elementos HTML encontrados correctamente');
    
    loadingElement.style.display = 'block';
    container.innerHTML = 'Cargando recetas...';
    
    if (noRecetasMessage) {
        noRecetasMessage.style.display = 'none';
    }

    console.log('📡 Haciendo fetch a database/get_recetas.php...');
    
    fetch('database/get_recetas.php')
        .then(response => {
            console.log('📡 Status:', response.status);
            console.log('📡 URL:', response.url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('✅ Datos recibidos:', data);
            if (data.success) {
                mostrarRecetas(data.recetas);
            } else {
                console.error('Error:', data.error);
                container.innerHTML = '<div class="error-message">Error al cargar recetas: ' + data.error + '</div>';
            }
        })
        .catch(error => {
            console.error('❌ Error completo:', error);
            container.innerHTML = '<div class="error-message">Error de conexión: ' + error.message + '</div>';
        })
        .finally(() => {
            loadingElement.style.display = 'none';
        });
}

// Función para mostrar recetas
function mostrarRecetas(recetas) {
    const container = document.getElementById('recetas-list-container');
    const noRecetasMessage = document.getElementById('no-recetas-message');
    
    if (!recetas || recetas.length === 0) {
        noRecetasMessage.style.display = 'block';
        return;
    }

    let html = '';
    recetas.forEach(receta => {
        const fecha = new Date(receta.fecha_emision);
        const fechaFormateada = fecha.toLocaleDateString('es-ES');
        
        html += `
            <div class="appointment-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <div class="appointment-info">
                    <h4>Receta #${receta.id_receta_medica} - ${receta.nombre_paciente}</h4>
                    <p><i class="far fa-calendar"></i> <strong>Fecha de emisión:</strong> ${fechaFormateada}</p>
                    <p><i class="fas fa-pills"></i> <strong>Tratamiento:</strong></p>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 5px 0;">
                        ${receta.id_receta.replace(/\n/g, '<br>')}
                    </div>
                    ${receta.url_pdf ? `<p><i class="fas fa-file-pdf"></i> <a href="${receta.url_pdf}" target="_blank">Ver PDF</a></p>` : ''}
                </div>
                <div class="appointment-actions" style="margin-top: 10px;">
                    <button class="btn btn-success" onclick="imprimirReceta(${receta.id_receta_medica})">Imprimir</button>
                    <button class="btn btn-warning" onclick="editarReceta(${receta.id_receta_medica})">Editar</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    noRecetasMessage.style.display = 'none';
}

// Modal functions
function mostrarModalReceta() {
    document.getElementById('modal-receta').style.display = 'block';
    cargarPacientesParaReceta();
    // Establecer fecha actual por defecto
    document.getElementById('fecha-receta').valueAsDate = new Date();
}

function cerrarModalReceta() {
    document.getElementById('modal-receta').style.display = 'none';
}

function cargarPacientesParaReceta() {
    // Cargar lista de pacientes para el select
    fetch('database/get_pacientes.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const select = document.getElementById('paciente-receta');
                select.innerHTML = '<option value="">Seleccionar paciente...</option>';
                data.pacientes.forEach(paciente => {
                    select.innerHTML += `<option value="${paciente.id_usuario}">${paciente.nombre_completo}</option>`;
                });
            }
        });
}

// Placeholder functions
function imprimirReceta(idReceta) {
    alert('Imprimir receta ID: ' + idReceta);
}

function editarReceta(idReceta) {
    alert('Editar receta ID: ' + idReceta);
}

// Medical Records - Patient Selection (mantener por compatibilidad)
document.querySelectorAll('.record-item').forEach(item => {
    if (!item.dataset.paciente) {
        item.addEventListener('click', function() {
            document.querySelectorAll('.record-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            const patientName = this.querySelector('h4').textContent;
            document.querySelector('.records-content h3').textContent = `Expediente de ${patientName}`;
        });
    }
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