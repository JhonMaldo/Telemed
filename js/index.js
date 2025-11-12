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
                'appointments': 'Notificaciones',
                'schedule': 'Agendar Cita',
                'chatbot': 'Asistente Virtual',
                'video-consultation': 'Videoconsulta',
                'prescriptions': 'Mis Recetas'
            };
            
            document.getElementById('section-title').textContent = titles[sectionId] || 'Dashboard';
        }

        // Chatbot functionality
        document.getElementById('send-message').addEventListener('click', sendMessage);
        document.getElementById('chat-input').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });

        document.querySelectorAll('.quick-action').forEach(action => {
            action.addEventListener('click', function() {
                document.getElementById('chat-input').value = this.dataset.message;
                sendMessage();
            });
        });

        function sendMessage() {
            const input = document.getElementById('chat-input');
            const message = input.value.trim();
            
            if (message === '') return;
            
            // Add user message
            addMessage(message, 'user');
            input.value = '';
            
            // Simulate bot response
            setTimeout(() => {
                let response = "Entiendo tu consulta. Te recomiendo que agendes una cita con un especialista para una evaluación completa.";
                
                if (message.includes('fiebre') || message.includes('dolor de cabeza')) {
                    response = "Parece que tienes síntomas de fiebre y dolor de cabeza. ¿Has tomado algún medicamento?";
                } else if (message.includes('receta')) {
                    response = "Para solicitar una receta médica, por favor agenda una cita con tu médico.";
                } else if (message.includes('agendar')) {
                    response = "Puedes agendar una cita en la sección 'Agendar Cita' del menú.";
                } else if (message.includes('videoconsulta')) {
                    response = "Puedes solicitar una videoconsulta en la sección 'Videoconsulta' del menú.";
                }
                
                addMessage(response, 'bot');
            }, 1000);
        }
        function addMessage(text, sender) {
            const messageContainer = document.createElement('div');
            messageContainer.classList.add('message', sender);
            messageContainer.innerHTML = `<p>${text}</p>`;
            document.getElementById('chatbot-messages').appendChild(messageContainer);
            document.getElementById('chatbot-messages').scrollTop = document.getElementById('chatbot-messages').scrollHeight;
        }
        // Payment Modal
        const paymentModal = document.getElementById('payment-modal');
        const closeModalBtn = document.querySelector('.close-modal');
        const paymentMethods = document.querySelectorAll('.payment-method');
        let selectedMethod = null;
        let consultationType = '';
        let consultationPrice = 0;
        function showPaymentModal(type) {
            consultationType = type === 'general' ? 'Consulta General' : type === 'specialist' ? 'Especialista' : 'Control';
            consultationPrice = type === 'general' ? 25000 : type === 'specialist' ? 40000 : 20000;
            
            document.getElementById('consultation-type').value = consultationType;
            document.getElementById('consultation-price').value = `$${consultationPrice.toLocaleString()}`;
            
            paymentModal.style.display = 'flex';
        }
        closeModalBtn.addEventListener('click', () => {
            paymentModal.style.display = 'none';
            resetPaymentModal();
        });
        window.addEventListener('click', (e) => {
            if (e.target === paymentModal) {
                paymentModal.style.display = 'none';
                resetPaymentModal();
            }
        });
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');
                selectedMethod = this.dataset.method;
                
                document.getElementById('credit-card-form').style.display = selectedMethod === 'credit-card' || selectedMethod === 'debit-card' ? 'block' : 'none';
            });
        });
        document.getElementById('confirm-payment').addEventListener('click', () => {
            if (!selectedMethod) {
                alert('Por favor, selecciona un método de pago.');
                return;
            }
            
            if (selectedMethod === 'credit-card' || selectedMethod === 'debit-card') {
                const cardNumber = document.getElementById('card-number').value.trim();
                const cardExpiry = document.getElementById('card-expiry').value.trim();
                const cardCvc = document.getElementById('card-cvc').value.trim();
                const cardName = document.getElementById('card-name').value.trim();
                
                if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
                    alert('Por favor, completa todos los campos de la tarjeta.');
                    return;
                }
            }
            
            alert(`Pago de $${consultationPrice.toLocaleString()} por ${consultationType} realizado con éxito.`);
            paymentModal.style.display = 'none';
            resetPaymentModal();
        });
        function resetPaymentModal() {
            selectedMethod = null;
            consultationType = '';
            consultationPrice = 0;
            paymentMethods.forEach(m => m.classList.remove('selected'));
            document.getElementById('credit-card-form').style.display = 'none';
            document.getElementById('card-number').value = '';
            document.getElementById('card-expiry').value = '';
            document.getElementById('card-cvc').value = '';
            document.getElementById('card-name').value = '';
        }
        // Prescription Download
        function downloadPrescription(id) {
            alert(`Descargando receta médica #${id}...`);
            // Aquí iría la lógica para descargar el PDF real
        }
        function requestNewPrescription() {
            alert('Funcionalidad para solicitar una nueva receta médica próximamente.');
        }
        // Profile Update
        document.getElementById('profile-form').addEventListener('submit', function(e)
        {
            e.preventDefault();
            alert('Perfil actualizado con éxito.');
        });