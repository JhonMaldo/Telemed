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
                'patients': 'Mis Pacientes',
                'consultations': 'Consultas',
                'medical-records': 'Expedientes Médicos',
                'prescriptions': 'Recetas Médicas',
                'notifications': 'Notificaciones'
            };
            
            document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';
        }

        // Medical Records - Patient Selection
        document.querySelectorAll('.record-item').forEach(item => {
            item.addEventListener('click', function() {
                document.querySelectorAll('.record-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                // In a real application, this would load the patient's records
                const patientName = this.querySelector('h4').textContent;
                document.querySelector('.records-content h3').textContent = `Expediente de ${patientName}`;
            });
        });

        // Notifications - Mark as read
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.addEventListener('click', function() {
                this.classList.remove('unread');
                
                // Update notification badge
                const badge = document.querySelector('.notification-badge');
                let count = parseInt(badge.textContent);
                if (count > 0) {
                    count--;
                    badge.textContent = count;
                }
            });
        });

        // Form submissions
        document.getElementById('profile-form').addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Perfil actualizado correctamente');
        });

        // Sample data for demonstration
        document.addEventListener('DOMContentLoaded', function() {
            // Set current date for next appointment
            const nextAppointment = document.getElementById('next-appointment');
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            nextAppointment.valueAsDate = nextMonth;
        });