// scripts.js - Manejo básico de formularios y mensajes

document.addEventListener('DOMContentLoaded', () => {
    // Formulario Enfermería
    const formEnfermeria = document.getElementById('form-enfermeria');
    if (formEnfermeria) {
        // Mostrar/ocultar campo "otro" cuando se selecciona "Otro"
        const tipoConsultaSelect = formEnfermeria.tipoConsulta;
        const otroTipoDiv = document.getElementById('otroTipoEnfermeriaDiv');
        const otroTipoInput = document.getElementById('otroTipoEnfermeria');

        tipoConsultaSelect.addEventListener('change', () => {
            if (tipoConsultaSelect.value === 'otro') {
                otroTipoDiv.style.display = 'block';
                otroTipoInput.required = true;
            } else {
                otroTipoDiv.style.display = 'none';
                otroTipoInput.required = false;
                otroTipoInput.value = '';
            }
        });

        formEnfermeria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formEnfermeria);
            const data = Object.fromEntries(formData);
            const mensajeDiv = document.getElementById('mensaje-enfermeria');

            // Validación básica
            if (!data.nombre || !data.edad || !data.estatura || !data.peso || !data.email || !data.telefono || !data.motivoConsulta || !data.gravedad || !data.horaConsulta) {
                mensajeDiv.textContent = 'Por favor, complete todos los campos.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            if (data.motivoConsulta === 'otro' && !data.otroTipoEnfermeria) {
                mensajeDiv.textContent = 'Por favor, especifique el motivo de la consulta.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Enviar cita al servidor
            try {
                const response = await fetch('http://localhost:3000/api/citas', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        tipoServicio: 'enfermeria',
                        profesional: 'enfermera1',
                        fechaHora: data.horaConsulta,
                        email: data.email,
                        nombre: data.nombre,
                        telefono: data.telefono,
                        motivoConsulta: data.motivoConsulta === 'otro' ? data.otroTipoEnfermeria : data.motivoConsulta
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    mensajeDiv.textContent = 'Cita solicitada con éxito. Recibirá un correo de confirmación.';
                    mensajeDiv.className = 'text-success';
                    formEnfermeria.reset();
                    otroTipoDiv.style.display = 'none';
                } else {
                    mensajeDiv.textContent = result.error || 'Error al solicitar la cita.';
                    mensajeDiv.className = 'text-danger';
                }
            } catch (error) {
                console.error('Error completo:', error);
                mensajeDiv.textContent = 'Error: El servidor no está corriendo. Por favor, inicie el servidor con: cd server && npm install && npm start';
                mensajeDiv.className = 'text-danger';
            }
        });
    }

    // Formulario Psicología
    const formPsicologia = document.getElementById('form-psicologia');
    if (formPsicologia) {
        // Mostrar/ocultar campo "otro" cuando se selecciona "Otro"
        const tipoConsultaSelect = formPsicologia.tipoConsultaPsico;
        const otroTipoDiv = document.getElementById('otroTipoDiv');
        const otroTipoInput = document.getElementById('otroTipo');

        tipoConsultaSelect.addEventListener('change', () => {
            if (tipoConsultaSelect.value === 'otro') {
                otroTipoDiv.style.display = 'block';
                otroTipoInput.required = true;
            } else {
                otroTipoDiv.style.display = 'none';
                otroTipoInput.required = false;
                otroTipoInput.value = '';
            }
        });

        formPsicologia.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formPsicologia);
            const data = Object.fromEntries(formData);
            const mensajeDiv = document.getElementById('mensaje-psicologia');

            // Validación básica
            if (!data.nombrePsico || !data.edadPsico || !data.emailPsico || !data.telefonoPsico || !data.tipoConsultaPsico || !data.profesionalConse || !data.horaConsultaPsico) {
                mensajeDiv.textContent = 'Por favor, complete todos los campos.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            if (data.tipoConsultaPsico === 'otro' && !data.otroTipo) {
                mensajeDiv.textContent = 'Por favor, especifique el tipo de consulta.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Validación de horario para psicología: no permitir martes, miércoles, jueves
            const selectedDateTime = new Date(data.horaConsultaPsico);
            const dayOfWeek = selectedDateTime.getDay(); // 0=Dom, 1=Lun, 2=Mar, 3=Mie, 4=Jue, 5=Vie, 6=Sab
            if (dayOfWeek === 2 || dayOfWeek === 3 || dayOfWeek === 4) {
                mensajeDiv.textContent = 'La cita no pudo ser asignada, ya que el psicólogo escolar se encuentra en reunión. El servicio está disponible los días lunes y viernes';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Usar configuración de EmailJS para el psicólogo
            const config = emailjsConfig.psicologo;
            console.log('Usando configuración del Psicólogo:', config);

            // Preparar datos para EmailJS
            const templateParams = {
                to_email: config.toEmail,
                from_name: data.nombrePsico,
                from_email: data.emailPsico,
                telefono: data.telefonoPsico,
                telefono_alterno: data.telefonoAlternoPsico || 'No proporcionado',
                edad: data.edadPsico,
                motivo_consulta: data.tipoConsultaPsico === 'otro' ? data.otroTipo : data.tipoConsultaPsico,
                gravedad: data.profesionalConse || 'No especificada',
                profesional: 'Psicólogo Escolar',
                hora_consulta: data.horaConsultaPsico
            };

            console.log('Parámetros del template:', templateParams);
            console.log('Enviando con Service ID:', config.serviceID, 'Template ID:', config.templateID);

            try {
                // Enviar email usando EmailJS
                const response = await emailjs.send(config.serviceID, config.templateID, templateParams, config.publicKey);
                console.log('Respuesta de EmailJS:', response);

                mensajeDiv.textContent = 'Cita solicitada con éxito. Recibirá un correo de confirmación.';
                mensajeDiv.className = 'text-success';
                formPsicologia.reset();
                if (otroTipoDiv) {
                    otroTipoDiv.style.display = 'none';
                }
            } catch (error) {
                console.error('Error completo al enviar el email:', error);
                console.error('Detalles del error:', error.text || error.message);
                mensajeDiv.textContent = 'Error al enviar la solicitud: ' + (error.text || error.message || 'Intente nuevamente.');
                mensajeDiv.className = 'text-danger';
            }
        });
    }

    // Formulario Consejería
    const formConsejeria = document.getElementById('form-consejeria');
    if (formConsejeria) {
        formConsejeria.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formConsejeria);
            const data = Object.fromEntries(formData);
            const mensajeDiv = document.getElementById('mensaje-consejeria');

            // Validación básica
            if (!data.nombreConse || !data.edadConse || !data.emailConse || !data.telefonoConse || !data.motivoConsultaConse || !data.gravedadConse || !data.profesionalConse || !data.horaConsultaConse) {
                mensajeDiv.textContent = 'Por favor, complete todos los campos.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Determinar configuración de EmailJS basada en el profesional seleccionado
            let config;
            console.log('Profesional seleccionado:', data.profesionalConse);

            if (data.profesionalConse === 'Consejera Sonia I. Cruz Maldonado') {
                config = emailjsConfig.sonia;
                console.log('Usando configuración de Sonia:', config);
            } else if (data.profesionalConse === 'Consejera Maricarmen García Rivera') {
                config = emailjsConfig.maricarmen;
                console.log('Usando configuración de Maricarmen:', config);
            } else {
                mensajeDiv.textContent = 'Profesional no reconocido: ' + data.profesionalConse;
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Preparar datos para EmailJS - mismo formato para ambas
            const templateParams = {
                to_email: config.toEmail,
                from_name: data.nombreConse,
                from_email: data.emailConse,
                telefono: data.telefonoConse,
                telefono_alterno: data.telefonoAlternoConse || 'No proporcionado',
                edad: data.edadConse,
                motivo_consulta: data.motivoConsultaConse,
                gravedad: data.gravedadConse,
                profesional: data.profesionalConse,
                hora_consulta: data.horaConsultaConse
            };

            console.log('Parámetros del template:', templateParams);
            console.log('Enviando con Service ID:', config.serviceID, 'Template ID:', config.templateID);

            try {
                // Enviar email usando EmailJS
                const response = await emailjs.send(config.serviceID, config.templateID, templateParams, config.publicKey);
                console.log('Respuesta de EmailJS:', response);

                mensajeDiv.textContent = 'Cita solicitada con éxito. Recibirá un correo de confirmación.';
                mensajeDiv.className = 'text-success';
                formConsejeria.reset();
            } catch (error) {
                console.error('Error completo al enviar el email:', error);
                console.error('Detalles del error:', error.text || error.message);
                mensajeDiv.textContent = 'Error al enviar la solicitud: ' + (error.text || error.message || 'Intente nuevamente.');
                mensajeDiv.className = 'text-danger';
            }
        });
    }

    // Formulario Trabajo Social
    const formTrabajoSocial = document.getElementById('form-trabajo-social');
    if (formTrabajoSocial) {
        // Mostrar/ocultar campo "otro" cuando se selecciona "Otro"
        const motivoConsultaSelect = formTrabajoSocial.motivoConsulta;
        const otroMotivoDiv = document.getElementById('otroMotivoTSDiv');
        const otroMotivoInput = document.getElementById('otroMotivoTS');

        if (motivoConsultaSelect && otroMotivoDiv && otroMotivoInput) {
            motivoConsultaSelect.addEventListener('change', () => {
                if (motivoConsultaSelect.value === 'otro') {
                    otroMotivoDiv.style.display = 'block';
                    otroMotivoInput.required = true;
                } else {
                    otroMotivoDiv.style.display = 'none';
                    otroMotivoInput.required = false;
                    otroMotivoInput.value = '';
                }
            });
        }

        formTrabajoSocial.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formTrabajoSocial);
            const data = Object.fromEntries(formData);
            const mensajeDiv = document.getElementById('mensaje-trabajo-social');

            // Validación básica
            if (!data.nombreTS || !data.edadTS || !data.emailTS || !data.telefonoTS || !data.motivoConsulta || !data.gravedadTS || !data.profesionalTS || !data.horaConsultaTS) {
                mensajeDiv.textContent = 'Por favor, complete todos los campos.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            if (data.motivoConsulta === 'otro' && otroMotivoInput && !data.otroMotivoTS) {
                mensajeDiv.textContent = 'Por favor, especifique el motivo de la consulta.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Determinar configuración de EmailJS basada en el profesional seleccionado
            let config;
            console.log('Profesional seleccionado:', data.profesionalTS);

            if (data.profesionalTS === 'Kárem Rivera Moreno') {
                config = emailjsConfig.karem_ts;
                console.log('Usando configuración de Kárem:', config);
            } else if (data.profesionalTS === 'Janelys M. Berrios Zayas') {
                config = emailjsConfig.janelys_ts;
                console.log('Usando configuración de Janelys:', config);
            } else {
                mensajeDiv.textContent = 'Profesional no reconocido: ' + data.profesionalTS;
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Preparar datos para EmailJS
            const templateParams = {
                to_email: config.toEmail,
                from_name: data.nombreTS,
                from_email: data.emailTS,
                telefono: data.telefonoTS,
                telefono_alterno: data.telefonoAlternoTS || 'No proporcionado',
                edad: data.edadTS,
                motivo_consulta: data.motivoConsulta,
                gravedad: data.gravedadTS || 'No especificada',
                profesional: data.profesionalTS,
                hora_consulta: data.horaConsultaTS
            };

            console.log('Parámetros del template:', templateParams);
            console.log('Enviando con Service ID:', config.serviceID, 'Template ID:', config.templateID);

            try {
                // Enviar email usando EmailJS
                const response = await emailjs.send(config.serviceID, config.templateID, templateParams, config.publicKey);
                console.log('Respuesta de EmailJS:', response);

                mensajeDiv.textContent = 'Cita solicitada con éxito. Recibirá un correo de confirmación.';
                mensajeDiv.className = 'text-success';
                formTrabajoSocial.reset();
                if (otroMotivoDiv) {
                    otroMotivoDiv.style.display = 'none';
                }
            } catch (error) {
                console.error('Error completo al enviar el email:', error);
                console.error('Detalles del error:', error.text || error.message);
                mensajeDiv.textContent = 'Error al enviar la solicitud: ' + (error.text || error.message || 'Intente nuevamente.');
                mensajeDiv.className = 'text-danger';
            }
        });
    }

    // Language switching
    const currentLang = localStorage.getItem('lang') || 'es';
    setLanguage(currentLang);

    document.querySelectorAll('[data-lang]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            setLanguage(lang);
            localStorage.setItem('lang', lang);
        });
    });

    function setLanguage(lang) {
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-' + lang + ']').forEach(element => {
            element.textContent = element.getAttribute('data-' + lang);
        });
    }

    // Formulario Contacto
    const formContacto = document.getElementById('form-contacto');
    if (formContacto) {
        const destinatarioSelect = document.getElementById('destinatario');
        const correoDisplay = document.getElementById('correo-destinatario');
        const correoHidden = document.getElementById('correo-destinatario-hidden');
        const destinatarios = {
            psicologo: 'de161266@miescuela.pr',
            trabajo_social: 'trabajo_social@unidadsalud.edu'
        };

        destinatarioSelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            if (selected && destinatarios[selected]) {
                correoDisplay.textContent = 'Correo electrónico: ' + destinatarios[selected];
                correoHidden.value = destinatarios[selected];
            } else {
                correoDisplay.textContent = '';
                correoHidden.value = '';
            }
        });

        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(formContacto);
            const data = Object.fromEntries(formData);
            const mensajeDiv = document.getElementById('mensaje-contacto');

            // Validación básica
            if (!data.nombre || !data.destinatario || !data.email || !data.asunto || !data.mensaje) {
                mensajeDiv.textContent = 'Por favor, complete todos los campos requeridos.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            // Validación de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                mensajeDiv.textContent = 'Por favor, ingrese un correo electrónico válido.';
                mensajeDiv.className = 'text-danger';
                return;
            }

            try {
                const response = await fetch('/api/contacto', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                const result = await response.json();

                if (response.ok) {
                    mensajeDiv.textContent = 'Mensaje enviado con éxito. Recibirá una respuesta pronto.';
                    mensajeDiv.className = 'text-success';
                    formContacto.reset();
                } else {
                    mensajeDiv.textContent = result.error || 'Error al enviar el mensaje. Intente nuevamente.';
                    mensajeDiv.className = 'text-danger';
                }
            } catch (error) {
                console.error('Error:', error);
                mensajeDiv.textContent = 'Error de conexión. Intente nuevamente.';
                mensajeDiv.className = 'text-danger';
            }
        });
    }

    // Formulario Búsqueda Mapa
    const formBusquedaMapa = document.getElementById('form-busqueda-mapa');
    if (formBusquedaMapa) {
        formBusquedaMapa.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = document.getElementById('busqueda-mapa').value.trim();
            if (query) {
                window.open('https://www.google.com/maps/search/' + encodeURIComponent(query), '_blank');
            }
        });
    }

    // Función para alternar descripción en tarjetas de psicología
    window.toggleDescription = function(card) {
        card.classList.toggle('expanded');
    };

    // Slideshow functionality
    let slideIndex = 0;
    const slides = document.querySelectorAll('.slide');

    if (slides.length > 0) {
        // Mostrar la primera imagen inmediatamente
        slides[0].classList.add('active');

        function showSlides() {
            // Remover clase active de todas las slides
            slides.forEach(slide => slide.classList.remove('active'));

            // Incrementar índice
            slideIndex++;
            if (slideIndex >= slides.length) {
                slideIndex = 0;
            }

            // Mostrar slide actual
            slides[slideIndex].classList.add('active');

            // Cambiar imagen cada 5 segundos
            setTimeout(showSlides, 5000);
        }

        // Iniciar slideshow después de 5 segundos
        setTimeout(showSlides, 5000);
    }
});