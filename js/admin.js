document.addEventListener('DOMContentLoaded', function() {

    const doctorModal = document.getElementById('doctor-modal');
    const patientModal = document.getElementById('patient-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const doctorForm = document.getElementById('doctor-form');
    const doctoresTableBody = document.getElementById('doctores-table-body');

    // --- NAVEGACIÓN (Tu código original) ---
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
        
        const titles = {
            'dashboard': 'Dashboard', 'doctors': 'Gestión de Doctores', 'patients': 'Gestión de Pacientes',
            'appointments': 'Citas del Sistema', 'users': 'Usuarios del Sistema', 'reports': 'Reportes', 'settings': 'Configuración'
        };
        document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';
    }

    // --- MODALES (Tu código original) ---
    document.getElementById('add-doctor-btn').addEventListener('click', function() {
        document.getElementById('doctor-modal-title').textContent = 'Agregar Nuevo Doctor';
        doctorForm.reset();
        document.getElementById('doctor-id').value = '';
        doctorModal.style.display = 'flex';
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            doctorModal.style.display = 'none';
            patientModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target === doctorModal) doctorModal.style.display = 'none';
        if (event.target === patientModal) patientModal.style.display = 'none';
    });

    // --- LÓGICA DE DOCTORES (ACTUALIZADO) ---

    // 1. Cargar doctores al cargar la página
    cargarDoctores();

    // 2. Función para cargar doctores desde la BD
    function cargarDoctores() {
        // *** MODIFICADO *** (Ruta actualizada)
        fetch('php/api_doctores.php?accion=obtener_todos')
            .then(response => response.json())
            .then(data => {
                doctoresTableBody.innerHTML = ''; // Limpiar tabla
                if (Array.isArray(data)) {
                    data.forEach(doctor => {
                        const row = document.createElement('tr');
                        // El backend ya devuelve 'apellido'
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
                } else {
                    console.error('La respuesta de la API no es un array:', data);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    // 3. Manejar envío del formulario (Agregar y Editar)
    doctorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(doctorForm);
        const doctorId = formData.get('doctor-id'); // El campo oculto 'doctor-id'
        
        // Decidir si es 'agregar' o 'editar' basado en si el ID oculto tiene valor
        formData.append('accion', doctorId ? 'editar' : 'agregar');

        // *** MODIFICADO *** (Ruta actualizada)
        fetch('php/api_doctores.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert(data.message);
                doctorModal.style.display = 'none';
                cargarDoctores(); // Recargar la tabla
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    });

    // 4. Manejar botones de Editar y Eliminar (usando delegación de eventos)
    doctoresTableBody.addEventListener('click', function(e) {
        const editButton = e.target.closest('.edit-doctor');
        const deleteButton = e.target.closest('.delete-doctor');

        if (editButton) {
            const id = editButton.dataset.id;
            abrirModalEditarDoctor(id);
        }

        if (deleteButton) {
            const id = deleteButton.dataset.id;
            eliminarDoctor(id);
        }
    });

    // 5. Función para abrir modal y cargar datos para editar
    function abrirModalEditarDoctor(id) {
        const formData = new FormData();
        formData.append('accion', 'obtener_uno');
        formData.append('id', id);

        // *** MODIFICADO *** (Ruta actualizada)
        fetch('php/api_doctores.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(doctor => {
            if (doctor.status === 'error') {
                alert(doctor.message);
                return;
            }
            // Llenar el formulario del modal con los datos del doctor
            document.getElementById('doctor-modal-title').textContent = 'Editar Doctor';
            document.getElementById('doctor-id').value = doctor.id; // Campo oculto
            document.getElementById('doctor-firstname').value = doctor.nombre;
            document.getElementById('doctor-lastname').value = doctor.apellido;
            document.getElementById('doctor-email').value = doctor.email;
            document.getElementById('doctor-phone').value = doctor.telefono;
            document.getElementById('doctor-specialty').value = doctor.especialidad;
            document.getElementById('doctor-license').value = doctor.licencia;
            document.getElementById('doctor-status').value = doctor.estado.toLowerCase();
            doctorModal.style.display = 'flex';
        })
        .catch(error => console.error('Error:', error));
    }

    // 6. Función para eliminar un doctor
    function eliminarDoctor(id) {
        if (confirm(`¿Está seguro de que desea eliminar al doctor DOC-${id}? Esta acción también eliminará su usuario y citas asociadas.`)) {
            const formData = new FormData();
            formData.append('accion', 'eliminar');
            formData.append('id', id);

            // *** MODIFICADO *** (Ruta actualizada)
            fetch('php/api_doctores.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert(data.message);
                    cargarDoctores(); // Recargar la tabla
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // --- BÚSQUEDA Y FILTROS (Tu código original) ---

    document.getElementById('search-doctors').addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        filterTable('doctores-table-body', searchTerm); 
    });
    
    function filterTable(tbodyId, searchTerm) {
        const table = document.getElementById(tbodyId);
        const rows = table.getElementsByTagName('tr');
        
        for (let i = 0; i < rows.length; i++) {
            const cells = rows[i].getElementsByTagName('td');
            let found = false;
            
            // Empezamos en j=1 para ignorar el ID (DOC-XXX)
            for (let j = 1; j < cells.length - 1; j++) { // Ignoramos ID y Acciones
                const cellText = cells[j].textContent || cells[j].innerText;
                if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                    found = true;
                    break;
                }
            }
            rows[i].style.display = found ? '' : 'none';
        }
    }
});