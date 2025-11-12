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
            
            // Update section title
            const titles = {
                'dashboard': 'Dashboard',
                'doctors': 'Gestión de Doctores',
                'patients': 'Gestión de Pacientes',
                'appointments': 'Citas del Sistema',
                'users': 'Usuarios del Sistema',
                'reports': 'Reportes',
                'settings': 'Configuración'
            };
            
            document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';
        }

        // Modal functionality
        const doctorModal = document.getElementById('doctor-modal');
        const patientModal = document.getElementById('patient-modal');
        const closeModalButtons = document.querySelectorAll('.close-modal');

        // Open doctor modal
        document.getElementById('add-doctor-btn').addEventListener('click', function() {
            document.getElementById('doctor-modal-title').textContent = 'Agregar Nuevo Doctor';
            document.getElementById('doctor-form').reset();
            document.getElementById('doctor-id').value = '';
            doctorModal.style.display = 'flex';
        });

        // Open patient modal
        document.getElementById('add-patient-btn').addEventListener('click', function() {
            document.getElementById('patient-modal-title').textContent = 'Agregar Nuevo Paciente';
            document.getElementById('patient-form').reset();
            document.getElementById('patient-id').value = '';
            patientModal.style.display = 'flex';
        });

        // Close modals
        closeModalButtons.forEach(button => {
            button.addEventListener('click', function() {
                doctorModal.style.display = 'none';
                patientModal.style.display = 'none';
            });
        });

        // Close modals when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === doctorModal) {
                doctorModal.style.display = 'none';
            }
            if (event.target === patientModal) {
                patientModal.style.display = 'none';
            }
        });

        // Edit doctor buttons
        document.querySelectorAll('.edit-doctor').forEach(button => {
            button.addEventListener('click', function() {
                const doctorId = this.getAttribute('data-id');
                // In a real application, you would fetch doctor data by ID
                document.getElementById('doctor-modal-title').textContent = 'Editar Doctor';
                document.getElementById('doctor-id').value = doctorId;
                document.getElementById('doctor-firstname').value = 'Laura';
                document.getElementById('doctor-lastname').value = 'Martínez';
                document.getElementById('doctor-email').value = 'laura.martinez@clinica.com';
                document.getElementById('doctor-phone').value = '+57 301 987 6543';
                document.getElementById('doctor-specialty').value = 'cardiology';
                document.getElementById('doctor-license').value = 'COL-123456';
                document.getElementById('doctor-status').value = 'active';
                doctorModal.style.display = 'flex';
            });
        });

        // Edit patient buttons
        document.querySelectorAll('.edit-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                // In a real application, you would fetch patient data by ID
                document.getElementById('patient-modal-title').textContent = 'Editar Paciente';
                document.getElementById('patient-id').value = patientId;
                document.getElementById('patient-firstname').value = 'Juan';
                document.getElementById('patient-lastname').value = 'Pérez';
                document.getElementById('patient-email').value = 'juan.perez@example.com';
                document.getElementById('patient-phone').value = '+57 300 123 4567';
                document.getElementById('patient-birthdate').value = '1978-05-15';
                document.getElementById('patient-gender').value = 'male';
                document.getElementById('patient-address').value = 'Calle 123 #45-67, Bogotá';
                document.getElementById('patient-status').value = 'active';
                patientModal.style.display = 'flex';
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-doctor, .delete-patient').forEach(button => {
            button.addEventListener('click', function() {
                const isDoctor = this.classList.contains('delete-doctor');
                const id = this.getAttribute('data-id');
                const entity = isDoctor ? 'doctor' : 'paciente';
                
                if (confirm(`¿Está seguro de que desea eliminar este ${entity}?`)) {
                    // In a real application, you would send a delete request to the server
                    alert(`${entity.charAt(0).toUpperCase() + entity.slice(1)} eliminado correctamente`);
                    // Remove the row from the table
                    this.closest('tr').remove();
                }
            });
        });

        // Form submissions
        document.getElementById('doctor-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const doctorId = document.getElementById('doctor-id').value;
            const isEdit = doctorId !== '';
            
            // In a real application, you would send the data to the server
            alert(`Doctor ${isEdit ? 'actualizado' : 'creado'} correctamente`);
            doctorModal.style.display = 'none';
            
            // Refresh the table or add the new doctor
            if (!isEdit) {
                // Add new doctor to table
                // This would typically be done after a successful API call
            }
        });

        document.getElementById('patient-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const patientId = document.getElementById('patient-id').value;
            const isEdit = patientId !== '';
            
            // In a real application, you would send the data to the server
            alert(`Paciente ${isEdit ? 'actualizado' : 'creado'} correctamente`);
            patientModal.style.display = 'none';
            
            // Refresh the table or add the new patient
            if (!isEdit) {
                // Add new patient to table
                // This would typically be done after a successful API call
            }
        });

        // Search functionality
        document.getElementById('search-doctors').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTable('doctors', searchTerm);
        });

        document.getElementById('search-patients').addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            filterTable('patients', searchTerm);
        });

        function filterTable(section, searchTerm) {
            const table = document.querySelector(`#${section} tbody`);
            const rows = table.getElementsByTagName('tr');
            
            for (let i = 0; i < rows.length; i++) {
                const cells = rows[i].getElementsByTagName('td');
                let found = false;
                
                for (let j = 0; j < cells.length; j++) {
                    const cellText = cells[j].textContent || cells[j].innerText;
                    if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
                        found = true;
                        break;
                    }
                }
                
                rows[i].style.display = found ? '' : 'none';
            }
        }