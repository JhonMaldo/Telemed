document.addEventListener('DOMContentLoaded', function() {

    // --- CONSTANTES GLOBALES ---
    const doctorModal = document.getElementById('doctor-modal');
    const doctorForm = document.getElementById('doctor-form');
    const doctoresTableBody = document.getElementById('doctores-table-body');
    
    const patientModal = document.getElementById('patient-modal');
    // AÑADIDOS:
    const patientForm = document.getElementById('patient-form');
    const pacientesTableBody = document.getElementById('pacientes-table-body');

    const closeModalButtons = document.querySelectorAll('.close-modal');

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
        if (sectionId === 'doctors') {
            cargarDoctores();
        }
        if (sectionId === 'patients') {
            cargarPacientes();
        }
    }

    // --- MANEJO DE MODALES ---
    
    // Abrir modal de DOCTOR
    document.getElementById('add-doctor-btn').addEventListener('click', function() {
        document.getElementById('doctor-modal-title').textContent = 'Agregar Nuevo Doctor';
        doctorForm.reset();
        document.getElementById('doctor-id').value = '';
        doctorModal.style.display = 'flex';
    });

    // AÑADIDO: Abrir modal de PACIENTE
    document.getElementById('add-patient-btn').addEventListener('click', function() {
        document.getElementById('patient-modal-title').textContent = 'Agregar Nuevo Paciente';
        patientForm.reset();
        document.getElementById('patient-id').value = '';
        patientModal.style.display = 'flex';
    });

    // Cerrar cualquier modal
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            doctorModal.style.display = 'none';
            patientModal.style.display = 'none';
        });
    });

    // Cerrar al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === doctorModal) doctorModal.style.display = 'none';
        if (event.target === patientModal) patientModal.style.display = 'none';
    });

    // --- LÓGICA DE DOCTORES (Existente) ---

    // Cargar doctores al inicio (si dashboard es la activa)
    if (document.getElementById('doctors').classList.contains('active')) {
        cargarDoctores();
    }

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
        const doctorId = formData.get('doctor-id');
        formData.append('accion', doctorId ? 'editar' : 'agregar');

        fetch('php/api_doctores.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                doctorModal.style.display = 'none';
                cargarDoctores();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error en formulario doctor:', error));
    });

    doctoresTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-doctor');
        const deleteButton = e.target.closest('.delete-doctor');

        if (editButton) {
            abrirModalEditarDoctor(editButton.dataset.id);
        }
        if (deleteButton) {
            eliminarDoctor(deleteButton.dataset.id);
        }
    });

    function abrirModalEditarDoctor(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);

        fetch('php/api_doctores.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(doctor => {
            if (doctor.status === 'error') {
                alert(doctor.message); return;
            }
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
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => console.error('Error eliminando doctor:', error));
        }
    }

    // --- AÑADIDO: LÓGICA DE PACIENTES ---

    // Cargar pacientes al inicio (si dashboard es la activa)
    if (document.getElementById('patients').classList.contains('active')) {
        cargarPacientes();
    }
    
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
                        const generoTexto = paciente.genero === 'M' ? 'Masculino' : 'Femenino';

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
        const pacienteId = formData.get('patient-id');
        formData.append('accion', pacienteId ? 'editar' : 'agregar');

        fetch('php/api_pacientes.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                patientModal.style.display = 'none';
                cargarPacientes();
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error en formulario paciente:', error));
    });

    pacientesTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-patient');
        const deleteButton = e.target.closest('.delete-patient');

        if (editButton) {
            abrirModalEditarPaciente(editButton.dataset.id);
        }
        if (deleteButton) {
            eliminarPaciente(deleteButton.dataset.id);
        }
    });

    function abrirModalEditarPaciente(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);

        fetch('php/api_pacientes.php', { method: 'POST', body: formData })
        .then(response => response.json())
        .then(paciente => {
            if (paciente.status === 'error') {
                alert(paciente.message); return;
            }
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
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => console.error('Error eliminando paciente:', error));
        }
    }


    // --- BÚSQUEDA Y FILTROS ---
    
    // Función de filtro genérica
    function filterTable(tbodyId, searchTerm) {
        const tableBody = document.getElementById(tbodyId);
        if (!tableBody) return;
        
        const rows = tableBody.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;
            
            // Empezamos en j=1 para ignorar el ID (DOC-XXX / PAC-XXX)
            // Terminamos en cells.length - 1 para ignorar la columna de 'Acciones'
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
        filterTable('doctores-table-body', this.value.toLowerCase());
    });
    
    // AÑADIDO: Buscador de Pacientes
    document.getElementById('search-patients').addEventListener('input', function() {
        filterTable('pacientes-table-body', this.value.toLowerCase());
    });

});