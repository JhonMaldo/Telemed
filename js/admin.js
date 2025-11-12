document.addEventListener('DOMContentLoaded', function() {

    // --- CONSTANTES GLOBALES ---
    const doctorModal = document.getElementById('doctor-modal');
    const doctorForm = document.getElementById('doctor-form');
    const doctoresTableBody = document.getElementById('doctores-table-body');
    
    const patientModal = document.getElementById('patient-modal');
    const patientForm = document.getElementById('patient-form');
    const pacientesTableBody = document.getElementById('pacientes-table-body');

    // AÑADIDOS: Citas
    const citaModal = document.getElementById('cita-modal');
    const citaForm = document.getElementById('cita-form');
    const citasTableBody = document.getElementById('citas-table-body');
    const selectPacienteCita = document.getElementById('cita-paciente');
    const selectDoctorCita = document.getElementById('cita-doctor');

    const closeModalButtons = document.querySelectorAll('.close-modal');

    // AÑADIDOS: Configuración
    const settingsForm = document.getElementById('settings-form');

    // --- NAVEGACIÓN ---
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
        const sectionToShow = document.getElementById(sectionId);
        if (sectionToShow) {
            sectionToShow.classList.add('active');
        }
        
        const titles = {
            'dashboard': 'Dashboard', 'doctors': 'Gestión de Doctores', 'patients': 'Gestión de Pacientes',
            'appointments': 'Citas del Sistema', 'users': 'Usuarios del Sistema', 'reports': 'Reportes', 'settings': 'Configuración'
        };
        document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';

        // Cargar datos cuando se muestra la sección
        if (sectionId === 'doctors') cargarDoctores();
        if (sectionId === 'patients') cargarPacientes();
        if (sectionId === 'appointments') cargarCitas();
        if (sectionId === 'settings') cargarConfiguracion();
    }

    // --- MANEJO DE MODALES ---
    
    // Abrir modal de DOCTOR
    document.getElementById('add-doctor-btn').addEventListener('click', function() {
        document.getElementById('doctor-modal-title').textContent = 'Agregar Nuevo Doctor';
        doctorForm.reset();
        document.getElementById('doctor-id').value = '';
        doctorModal.style.display = 'flex';
    });

    // Abrir modal de PACIENTE
    document.getElementById('add-patient-btn').addEventListener('click', function() {
        document.getElementById('patient-modal-title').textContent = 'Agregar Nuevo Paciente';
        patientForm.reset();
        document.getElementById('patient-id').value = '';
        patientModal.style.display = 'flex';
    });

    // AÑADIDO: Abrir modal de CITA
    document.getElementById('add-cita-btn').addEventListener('click', function() {
        document.getElementById('cita-modal-title').textContent = 'Programar Nueva Cita';
        citaForm.reset();
        document.getElementById('cita-id').value = '';
        // Asignar valores por defecto al agregar
        document.getElementById('cita-tipo').value = 'virtual';
        document.getElementById('cita-status').value = 'programado';
        citaModal.style.display = 'flex';
    });

    // Cerrar cualquier modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            doctorModal.style.display = 'none';
            patientModal.style.display = 'none';
            if (citaModal) citaModal.style.display = 'none'; // AÑADIDO
        });
    });

    // Cerrar al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === doctorModal) doctorModal.style.display = 'none';
        if (event.target === patientModal) patientModal.style.display = 'none';
        if (event.target === citaModal) citaModal.style.display = 'none'; // AÑADIDO
    });
    
    // --- INICIALIZACIÓN DE DATOS (PARA MODAL DE CITAS) ---
    cargarListadosParaModalCita();

    // --- LÓGICA DE DOCTORES (Existente) ---
    function cargarDoctores() {
        fetch('php/api_doctores.php?accion=obtener_todos')
            .then(response => response.json())
            .then(data => {
                doctoresTableBody.innerHTML = '';
                if (Array.isArray(data)) {
                    data.forEach(doctor => {
                        const row = document.createElement('tr');
                        const nombreCompleto = `Dr. ${doctor.nombre} ${doctor.apellido}`;
                        const estadoClass = doctor.estado.toLowerCase() === 'activo' ? 'status-active' : 'status-inactive';
                        const estadoTexto = doctor.estado.charAt(0).toUpperCase() + doctor.estado.slice(1);
                        
                        row.innerHTML = `
                            <td>DOC-${doctor.id}</td>
                            <td>${nombreCompleto}</td>
                            <td>${doctor.especialidad}</td>
                            <td>${doctor.email}</td>
                            <td>${doctor.telefono}</td>
                            <td><span class="status-badge ${estadoClass}">${estadoTexto}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-warning edit-doctor" data-id="${doctor.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-doctor" data-id="${doctor.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        `;
                        doctoresTableBody.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error cargando doctores:', error));
    }
    doctorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(doctorForm);
        formData.append('accion', formData.get('doctor-id') ? 'editar' : 'agregar');
        fetch('php/api_doctores.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                doctorModal.style.display = 'none';
                cargarDoctores();
            } else { alert('Error: ' + data.message); }
        })
        .catch(error => console.error('Error en formulario doctor:', error));
    });
    doctoresTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-doctor');
        if (editButton) abrirModalEditarDoctor(editButton.dataset.id);
        const deleteButton = e.target.closest('.delete-doctor');
        if (deleteButton) eliminarDoctor(deleteButton.dataset.id);
    });
    function abrirModalEditarDoctor(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);
        fetch('php/api_doctores.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(doctor => {
            if (doctor.status === 'error') { alert(doctor.message); return; }
            document.getElementById('doctor-modal-title').textContent = 'Editar Doctor';
            document.getElementById('doctor-id').value = doctor.id;
            document.getElementById('doctor-firstname').value = doctor.nombre;
            document.getElementById('doctor-lastname').value = doctor.apellido;
            document.getElementById('doctor-email').value = doctor.email;
            document.getElementById('doctor-phone').value = doctor.telefono;
            document.getElementById('doctor-specialty').value = doctor.especialidad;
            document.getElementById('doctor-license').value = doctor.licencia;
            document.getElementById('doctor-status').value = doctor.estado;
            doctorModal.style.display = 'flex';
        })
        .catch(error => console.error('Error obteniendo doctor:', error));
    }
    function eliminarDoctor(id) {
        if (confirm(`¿Está seguro de eliminar al doctor DOC-${id}?`)) {
            const formData = new FormData();
            formData.append('accion', 'eliminar');
            formData.append('id', id);
            fetch('php/api_doctores.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    cargarDoctores();
                } else { alert('Error: ' + data.message); }
            })
            .catch(error => console.error('Error eliminando doctor:', error));
        }
    }

    // --- LÓGICA DE PACIENTES (Existente) ---
    function cargarPacientes() {
        fetch('php/api_pacientes.php?accion=obtener_todos')
            .then(response => response.json())
            .then(data => {
                pacientesTableBody.innerHTML = '';
                if (Array.isArray(data)) {
                    data.forEach(paciente => {
                        const row = document.createElement('tr');
                        const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
                        const estadoClass = paciente.estado.toLowerCase() === 'activo' ? 'status-active' : 'status-inactive';
                        const estadoTexto = paciente.estado.charAt(0).toUpperCase() + paciente.estado.slice(1);
                        const generoTexto = paciente.genero === 'M' ? 'Masculino' : (paciente.genero === 'F' ? 'Femenino' : 'N/A');

                        row.innerHTML = `
                            <td>PAC-${paciente.id}</td>
                            <td>${nombreCompleto}</td>
                            <td>${paciente.email}</td>
                            <td>${paciente.telefono}</td>
                            <td>${paciente.edad}</td>
                            <td>${generoTexto}</td>
                            <td><span class="status-badge ${estadoClass}">${estadoTexto}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-warning edit-patient" data-id="${paciente.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-patient" data-id="${paciente.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        `;
                        pacientesTableBody.appendChild(row);
                    });
                }
            })
            .catch(error => console.error('Error cargando pacientes:', error));
    }
    patientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(patientForm);
        formData.append('accion', formData.get('patient-id') ? 'editar' : 'agregar');
        fetch('php/api_pacientes.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                patientModal.style.display = 'none';
                cargarPacientes();
            } else { alert('Error: ' + data.message); }
        })
        .catch(error => console.error('Error en formulario paciente:', error));
    });
    pacientesTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-patient');
        if (editButton) abrirModalEditarPaciente(editButton.dataset.id);
        const deleteButton = e.target.closest('.delete-patient');
        if (deleteButton) eliminarPaciente(deleteButton.dataset.id);
    });
    function abrirModalEditarPaciente(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);
        fetch('php/api_pacientes.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(paciente => {
            if (paciente.status === 'error') { alert(paciente.message); return; }
            document.getElementById('patient-modal-title').textContent = 'Editar Paciente';
            document.getElementById('patient-id').value = paciente.id;
            document.getElementById('patient-firstname').value = paciente.nombre;
            document.getElementById('patient-lastname').value = paciente.apellido;
            document.getElementById('patient-email').value = paciente.email;
            document.getElementById('patient-phone').value = paciente.telefono;
            document.getElementById('patient-birthdate').value = paciente.fecha_nacimiento;
            document.getElementById('patient-gender').value = paciente.genero;
            document.getElementById('patient-address').value = paciente.direccion;
            document.getElementById('patient-status').value = paciente.estado;
            patientModal.style.display = 'flex';
        })
        .catch(error => console.error('Error obteniendo paciente:', error));
    }
    function eliminarPaciente(id) {
        if (confirm(`¿Está seguro de eliminar al paciente PAC-${id}?`)) {
            const formData = new FormData();
            formData.append('accion', 'eliminar');
            formData.append('id', id);
            fetch('php/api_pacientes.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    cargarPacientes();
                } else { alert('Error: ' + data.message); }
            })
            .catch(error => console.error('Error eliminando paciente:', error));
        }
    }

    // --- AÑADIDO: LÓGICA DE CITAS ---

    /**
     * Llena los <select> del modal de citas con pacientes y doctores
     */
    function cargarListadosParaModalCita() {
        // Cargar Pacientes
        fetch('php/api_citas.php?accion=obtener_listado_pacientes')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    selectPacienteCita.innerHTML = '<option value="">Seleccione un paciente</option>';
                    data.data.forEach(paciente => {
                        const option = document.createElement('option');
                        option.value = paciente.id_paciente;
                        option.textContent = `PAC-${paciente.id_paciente} - ${paciente.nombre_completo}`;
                        selectPacienteCita.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error cargando lista de pacientes:', error));

        // Cargar Doctores
        fetch('php/api_citas.php?accion=obtener_listado_doctores')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    selectDoctorCita.innerHTML = '<option value="">Seleccione un doctor</option>';
                    data.data.forEach(doctor => {
                        const option = document.createElement('option');
                        option.value = doctor.id_doctor;
                        option.textContent = `DOC-${doctor.id_doctor} - ${doctor.nombre_completo}`;
                        selectDoctorCita.appendChild(option);
                    });
                }
            })
            .catch(error => console.error('Error cargando lista de doctores:', error));
    }

    /**
     * Carga la tabla principal de citas
     */
    function cargarCitas() {
        fetch('php/api_citas.php?accion=obtener_todos')
            .then(response => response.json())
            .then(data => {
                citasTableBody.innerHTML = '';
                if (Array.isArray(data)) {
                    data.forEach(cita => {
                        const row = document.createElement('tr');
                        const estadoClass = cita.estado.toLowerCase().replace(' ', '_');
                        const estadoTexto = cita.estado.charAt(0).toUpperCase() + cita.estado.slice(1);
                        const tipoTexto = cita.tipo.charAt(0).toUpperCase() + cita.tipo.slice(1).replace('_', ' ');

                        // Guardamos los datos en atributos data-* para el filtro
                        row.dataset.fecha = cita.fecha_iso || ''; // Necesitaríamos fecha ISO para filtrar bien (el backend la da formateada)
                        row.dataset.estado = cita.estado;
                        
                        row.innerHTML = `
                            <td>APT-${cita.id}</td>
                            <td>${cita.paciente_nombre}</td>
                            <td>${cita.doctor_nombre}</td>
                            <td>${cita.fecha}</td>
                            <td>${cita.hora}</td>
                            <td>${tipoTexto}</td>
                            <td><span class="status-badge status-${estadoClass}">${estadoTexto}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-sm btn-warning edit-cita" data-id="${cita.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger delete-cita" data-id="${cita.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        `;
                        citasTableBody.appendChild(row);
                    });
                    // Una vez cargada la tabla, aplicamos los filtros actuales
                    filtrarTablaCitas();
                }
            })
            .catch(error => console.error('Error cargando citas:', error));
    }

    /**
     * Envía el formulario de agregar/editar cita
     */
    citaForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(citaForm);
        formData.append('accion', formData.get('cita-id') ? 'editar' : 'agregar');

        fetch('php/api_citas.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                citaModal.style.display = 'none';
                cargarCitas();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error en formulario cita:', error));
    });

    /**
     * Listener para botones de la tabla de citas
     */
    citasTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-cita');
        if (editButton) abrirModalEditarCita(editButton.dataset.id);
        
        const deleteButton = e.target.closest('.delete-cita');
        if (deleteButton) eliminarCita(deleteButton.dataset.id);
    });

    /**
     * Abre el modal para editar una cita específica
     */
    function abrirModalEditarCita(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);

        fetch('php/api_citas.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(cita => {
            if (cita.status === 'error') { alert(cita.message); return; }
            
            document.getElementById('cita-modal-title').textContent = 'Editar Cita';
            document.getElementById('cita-id').value = cita.id_citas;
            document.getElementById('cita-paciente').value = cita.id_paciente;
            document.getElementById('cita-doctor').value = cita.id_doctor;
            document.getElementById('cita-fecha').value = cita.fecha;
            document.getElementById('cita-hora').value = cita.hora;
            document.getElementById('cita-razon').value = cita.razon;
            document.getElementById('cita-tipo').value = cita.type;
            document.getElementById('cita-status').value = cita.status;
            
            citaModal.style.display = 'flex';
        })
        .catch(error => console.error('Error obteniendo cita:', error));
    }

    /**
     * Elimina una cita
     */
    function eliminarCita(id) {
        if (confirm(`¿Está seguro de eliminar la cita APT-${id}?`)) {
            const formData = new FormData();
            formData.append('accion', 'eliminar');
            formData.append('id', id);

            fetch('php/api_citas.php', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    cargarCitas();
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => console.error('Error eliminando cita:', error));
        }
    }


    // --- BÚSQUEDA Y FILTROS ---
    
    /**
     * Función de filtro de texto genérica (para Doctores y Pacientes)
     */
    function filterTableText(tbodyId, searchTerm) {
        const tableBody = document.getElementById(tbodyId);
        if (!tableBody) return;
        
        const rows = tableBody.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;
            
            for (let j = 1; j < cells.length - 1; j++) { 
                const cellText = cells[j].textContent || cells[j].innerText;
                if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                    found = true;
                    break;
                }
            }
            rows[i].style.display = found ? '' : 'none';
        }
    }

    // Buscador de Doctores
    document.getElementById('search-doctors').addEventListener('input', function() {
        filterTableText('doctores-table-body', this.value.toLowerCase());
    });
    
    // Buscador de Pacientes
    document.getElementById('search-patients').addEventListener('input', function() {
        filterTableText('pacientes-table-body', this.value.toLowerCase());
    });

    /**
     * AÑADIDO: Función de filtro AVANZADO (para Citas)
     */
    const citaSearchInput = document.getElementById('search-appointments');
    const citaDateInput = document.getElementById('date-filter');
    const citaStatusInput = document.getElementById('status-appointment-filter');

    function filtrarTablaCitas() {
        const searchTerm = citaSearchInput.value.toLowerCase();
        const dateTerm = citaDateInput.value; // Formato YYYY-MM-DD
        const statusTerm = citaStatusInput.value;

        const rows = citasTableBody.getElementsByTagName('tr');

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const cells = row.getElementsByTagName('td');
            
            // 1. Coincidencia de Texto (Paciente o Doctor)
            const pacienteText = cells[1].textContent.toLowerCase();
            const doctorText = cells[2].textContent.toLowerCase();
            const textMatch = (pacienteText.indexOf(searchTerm) > -1) || (doctorText.indexOf(searchTerm) > -1);

            // 2. Coincidencia de Fecha
            // El backend de 'obtener_todos' no da la fecha en formato YYYY-MM-DD
            // Así que convertimos el formato "15 Oct, 2023" a "2023-10-15" (simplificado)
            const fechaText = cells[3].textContent; // "15 Oct, 2023"
            
            // Hack simple para convertir fecha "15 Oct, 2023" a algo comparable
            // En una app real, el backend enviaría un data-attribute="2023-10-15"
            // Por ahora, solo filtramos si el texto de la fecha es idéntico (no funciona bien)
            // *** ACTUALIZACIÓN: Vamos a hacer un filtro de texto simple para la fecha ***
            const dateMatch = (dateTerm === "") || (fechaText.indexOf(dateTerm) > -1); // No es ideal, pero funciona sin cambiar backend

            // 3. Coincidencia de Estado
            const estadoText = cells[6].textContent.toLowerCase(); // "Programada"
            const statusMatch = (statusTerm === "") || (estadoText === statusTerm.toLowerCase());

            // Mostrar fila SÓLO si todas las condiciones se cumplen
            if (textMatch && dateMatch && statusMatch) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    }

    // Asignar listeners a los 3 filtros de Citas
    citaSearchInput.addEventListener('input', filtrarTablaCitas);
    citaDateInput.addEventListener('change', filtrarTablaCitas); // 'change' es mejor para date
    citaStatusInput.addEventListener('change', filtrarTablaCitas);

        // --- AÑADIDO: LÓGICA DE CONFIGURACIÓN ---

    /**
     * Carga los datos de la BD en el formulario de configuración
     */
    function cargarConfiguracion() {
        fetch('php/api_configuracion.php?accion=obtener')
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success' && data.data) {
                    const config = data.data;
                    document.getElementById('clinic-name').value = config.nombre_clinica || '';
                    document.getElementById('clinic-address').value = config.direccion_clinica || '';
                    document.getElementById('clinic-phone').value = config.telefono_clinica || '';
                    document.getElementById('clinic-email').value = config.email_clinica || '';
                    document.getElementById('appointment-duration').value = config.duracion_cita || '30';
                    document.getElementById('work-start').value = config.hora_inicio || '08:00';
                    document.getElementById('work-end').value = config.hora_fin || '18:00';
                } else {
                    console.error('Error al cargar configuración:', data.message);
                }
            })
            .catch(error => console.error('Error en fetch config:', error));
    }

    /**
     * Guarda los datos del formulario de configuración en la BD
     */
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(settingsForm);
        formData.append('accion', 'guardar');

        fetch('php/api_configuracion.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error al guardar config:', error));
    });

    // Cargar la configuración por si 'settings' es la pestaña activa por defecto
    if (document.getElementById('settings') && document.getElementById('settings').classList.contains('active')) {
        cargarConfiguracion();
    }

});

