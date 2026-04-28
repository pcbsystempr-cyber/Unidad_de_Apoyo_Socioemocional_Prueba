/* ==============================================================
   Referido Único al Equipo Interdisciplinario Socioemocional
   Lógica del formulario: validación, borradores (localStorage),
   vista oficial y exportación a PDF (jsPDF + html2canvas).
   ============================================================== */

(function () {
    'use strict';

    const STORAGE_KEY = 'pcb_referido_eis_borrador_v1';
    const form = document.getElementById('formReferidoEIS');
    if (!form) return;

    // ---------- Utilidades ----------
    const $ = (id) => document.getElementById(id);
    const fmtFecha = (iso) => {
        if (!iso) return '_______________';
        const [y, m, d] = iso.split('-');
        return `${d}/${m}/${y}`;
    };
    const esc = (s) => String(s == null ? '' : s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const CHK_ON = '☒';
    const CHK_OFF = '☐';

    // ---------- Recolección de datos ----------
    function recolectar() {
        const datos = {
            estudiante: $('estudiante').value.trim(),
            edad: $('edad').value.trim(),
            numeroEstudiante: $('numeroEstudiante').value.trim(),
            grado: $('grado').value.trim(),
            grupo: $('grupo').value.trim(),
            eduEspecial: (form.querySelector('input[name="eduEspecial"]:checked') || {}).value || '',
            fechaRadicacion: $('fechaRadicacion').value,
            direccion: $('direccion').value.trim(),
            encargado: $('encargado').value.trim(),
            telMadre: $('telMadre').value.trim(),
            telPadre: $('telPadre').value.trim(),
            telTutor: $('telTutor').value.trim(),
            personaRefiere: $('personaRefiere').value.trim(),
            firmaPersonaRefiere: $('firmaPersonaRefiere').value.trim(),

            academicoOtro: $('academicoOtro').value.trim(),
            saludMentalOtro: $('saludMentalOtro').value.trim(),
            saludOtro: $('saludOtro').value.trim(),
            ocupacionalOtro: $('ocupacionalOtro').value.trim(),
            gestionOtros: $('gestionOtros').value.trim(),
            gestionDirectorOtros: $('gestionDirectorOtros').value.trim(),
            historialOtros: $('historialOtros').value.trim(),

            maltratoNumRef: $('maltratoNumRef').value.trim(),
            maltratoFecha: $('maltratoFecha').value,
            maltratoPersonaAtendio: $('maltratoPersonaAtendio').value.trim(),
            maltratoNaturaleza: $('maltratoNaturaleza').value.trim(),

            acuerdo1: $('acuerdo1').value.trim(),
            acuerdo1Cumplio: (form.querySelector('input[name="acuerdo1Cumplio"]:checked') || {}).value || '',
            acuerdo2: $('acuerdo2').value.trim(),
            acuerdo2Cumplio: (form.querySelector('input[name="acuerdo2Cumplio"]:checked') || {}).value || '',

            nombreDirector: $('nombreDirector').value.trim(),
            firmaDirector: $('firmaDirector').value.trim(),
            fechaEntregaDirector: $('fechaEntregaDirector').value,
            personalApoyo: collectChecks('personalApoyo'),
            nombreProfesionalApoyo: $('nombreProfesionalApoyo').value.trim(),
            firmaProfesionalApoyo: $('firmaProfesionalApoyo').value.trim(),

            descripcionDirector: $('descripcionDirector').value.trim(),
            nombreDirectorSeg: $('nombreDirectorSeg').value.trim(),
            firmaDirectorSeg: $('firmaDirectorSeg').value.trim(),
            fechaDirectorSeg: $('fechaDirectorSeg').value,

            descripcionHistorial: $('descripcionHistorial').value.trim(),
            nombreHistorial: $('nombreHistorial').value.trim(),
            firmaHistorial: $('firmaHistorial').value.trim(),
            fechaHistorial: $('fechaHistorial').value,

            categorias: {
                academico: collectChecks('academico'),
                asistencia: collectChecks('asistencia'),
                salud_mental: collectChecks('salud_mental'),
                salud: collectChecks('salud'),
                ocupacional: collectChecks('ocupacional'),
                acoso: collectChecks('acoso'),
                maltrato: collectChecks('maltrato'),
                educacion_especial: collectChecks('educacion_especial')
            },
            gestionMaestro: collectChecks('gestion_maestro'),
            gestionDirector: collectChecks('gestion_director'),
            eis: collectChecks('eis'),
            historial: collectChecks('historial')
        };
        return datos;
    }

    function collectChecks(name) {
        return Array.from(form.querySelectorAll(`input[type="checkbox"][name="${name}"]:checked`))
            .map(i => i.value);
    }

    // ---------- Validación ----------
    function validarReferido() {
        const d = recolectar();
        const errores = [];
        const obligatorios = [
            ['estudiante', 'Nombre del estudiante'],
            ['edad', 'Edad'],
            ['numeroEstudiante', 'Número de estudiante (SIE)'],
            ['grado', 'Grado'],
            ['grupo', 'Grupo'],
            ['fechaRadicacion', 'Fecha de radicación'],
            ['personaRefiere', 'Persona que refiere'],
            ['firmaPersonaRefiere', 'Firma de la persona que refiere']
        ];
        obligatorios.forEach(([id, etiqueta]) => {
            const el = $(id);
            if (!el.value.trim()) { errores.push(etiqueta); el.classList.add('is-invalid'); }
            else el.classList.remove('is-invalid');
        });
        if (!d.eduEspecial) errores.push('Educación Especial (Sí / No)');

        const totalCategorias = Object.values(d.categorias).reduce((s, a) => s + a.length, 0);
        if (totalCategorias === 0) errores.push('Al menos una categoría marcada (Secciones I–VIII)');

        if (d.gestionMaestro.length < 3) errores.push('Mínimo 3 gestiones realizadas por el maestro (Sección IX)');

        if ((d.acuerdo1 && !d.acuerdo1Cumplio) || (d.acuerdo2 && !d.acuerdo2Cumplio)) {
            errores.push('Indicar si los acuerdos con padres o estudiante se cumplieron (Sí / No)');
        }
        return { ok: errores.length === 0, errores, datos: d };
    }


    // ---------- Borradores en localStorage ----------
    function guardarBorradorReferido() {
        try {
            const snapshot = serializarFormulario();
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                guardado_en: new Date().toISOString(),
                datos: snapshot
            }));
            mostrarToast('Borrador guardado correctamente.', 'success');
        } catch (e) {
            mostrarToast('No se pudo guardar el borrador.', 'danger');
        }
    }

    function cargarBorradorReferido() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) { mostrarToast('No hay borrador guardado.', 'warning'); return; }
        try {
            const { datos } = JSON.parse(raw);
            restaurarFormulario(datos);
            actualizarProgreso();
            mostrarToast('Borrador cargado.', 'info');
        } catch (e) {
            mostrarToast('El borrador está dañado.', 'danger');
        }
    }

    function limpiarFormularioReferido() {
        if (!confirm('¿Está seguro de limpiar todo el formulario? Esta acción no se puede deshacer.')) return;
        form.reset();
        form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
        actualizarProgreso();
        mostrarToast('Formulario limpiado.', 'secondary');
    }

    function serializarFormulario() {
        const obj = {};
        form.querySelectorAll('input, select, textarea').forEach(el => {
            if (!el.id && !el.name) return;
            const key = el.id || el.name;
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (!obj[key]) obj[key] = [];
                if (el.checked) obj[key].push(el.value);
            } else {
                obj[key] = el.value;
            }
        });
        return obj;
    }

    function restaurarFormulario(datos) {
        form.querySelectorAll('input, select, textarea').forEach(el => {
            const key = el.id || el.name;
            if (!key || !(key in datos)) return;
            if (el.type === 'checkbox' || el.type === 'radio') {
                el.checked = Array.isArray(datos[key]) && datos[key].includes(el.value);
            } else {
                el.value = datos[key] || '';
            }
        });
    }

    // ---------- Toast / mensajes ----------
    function mostrarToast(msg, tipo) {
        const cont = getToastContainer();
        const id = 't_' + Date.now();
        cont.insertAdjacentHTML('beforeend', `
            <div id="${id}" class="toast align-items-center text-bg-${tipo} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body small">${esc(msg)}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`);
        const el = document.getElementById(id);
        const t = new bootstrap.Toast(el, { delay: 2800 });
        t.show();
        el.addEventListener('hidden.bs.toast', () => el.remove());
    }
    function getToastContainer() {
        let c = document.getElementById('toastContainer');
        if (!c) {
            c = document.createElement('div');
            c.id = 'toastContainer';
            c.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            c.style.zIndex = 1080;
            document.body.appendChild(c);
        }
        return c;
    }

    // ---------- Barra de progreso ----------
    function actualizarProgreso() {
        const camposReq = ['estudiante', 'edad', 'numeroEstudiante', 'grado', 'grupo',
            'fechaRadicacion', 'personaRefiere', 'firmaPersonaRefiere'];
        let llenos = camposReq.filter(id => $(id).value.trim()).length;
        if (form.querySelector('input[name="eduEspecial"]:checked')) llenos++;
        const totalCat = collectChecks('academico').length + collectChecks('asistencia').length
            + collectChecks('salud_mental').length + collectChecks('salud').length
            + collectChecks('ocupacional').length + collectChecks('acoso').length
            + collectChecks('maltrato').length + collectChecks('educacion_especial').length;
        if (totalCat > 0) llenos++;
        if (collectChecks('gestion_maestro').length >= 3) llenos++;
        const total = camposReq.length + 3;
        const pct = Math.round((llenos / total) * 100);
        $('progresoBarra').style.width = pct + '%';
        $('progresoTexto').textContent = pct + '%';
        $('progresoBarra').classList.toggle('bg-success', pct >= 90);
        $('progresoBarra').classList.toggle('bg-warning', pct < 90 && pct >= 50);
        $('progresoBarra').classList.toggle('bg-danger', pct < 50);
    }


    // ---------- Vista oficial (HTML estilo documento DEPR) ----------
    function generarVistaOficialPDF(d) {
        const cat = d.categorias;
        const chk = (lista, val) => `<span class="chk-line"><span class="chk">${lista.includes(val) ? CHK_ON : CHK_OFF}</span> ${esc(val)}</span>`;

        // Listas oficiales (mismas etiquetas que el formulario)
        const listas = {
            academico: ['Bajo aprovechamiento académico','Falta de requisito de graduación','Riesgo de abandonar la escuela','Fracaso o posible fracaso escolar','Problemas de aprendizaje','Lectura','Escritura','Matemáticas','Invierte o traspone letras al escribir o leer','Se tarda en copiar o no copia','Dos o más años por debajo del nivel de grado que debe cursar','No ha desarrollado el establecimiento de metas y toma asertiva de decisiones','Necesidad de establecer programa especial de clases','Posible dotado','Otro'],
            asistencia: ['Tardanzas','Cortes de clase','Ausencias injustificadas','Ausencias por hospitalizaciones o reposo en casa prolongada'],
            sm_a: ['Lanza objetos hacia otros','Rompe objetos','Empuja','Utiliza palabras soeces hacia sí mismo u otros','Patrón de golpear a otros estudiantes','Violencia en el noviazgo'],
            sm_b: ['Intranquilidad','Tristeza','Desánimo','Llanto frecuente','Retraído','Frustrado','Apático / falta de interés','Baja motivación','Irritabilidad / coraje frecuente','Falta de apetito / come en exceso','Aislamiento','Se duerme en clase','Insomnio','Hiperactivo','Hipoactivo','Dificultad para manejar emociones','Dificultad para manejar el estrés','Signos y síntomas de trauma'],
            sm_c: ['Dificultad en relaciones interpersonales','Maestro / personal escolar','Compañeros / pares','Familiares o encargados','Situaciones familiares','Violencia de género o maltrato en el hogar','Problemas económicos','Relaciones inadecuadas con padres o encargados'],
            sm_d: ['Lenguaje sexualizado','Preocupación sexual','Conductas sexualmente explícitas'],
            sm_e: ['Uso de drogas','Uso de alcohol','Uso de cigarrillo o vape','Automutilación','Ideas suicidas','Intentos suicidas','Ideas homicidas','Intento homicida','Exposición a conductas de alto riesgo','Otro'],
            salud_a: ['Asma','Alergias','Epilepsia','Diabetes','Pediculosis','Problemas auditivos','Problemas de visión','Problemas de la piel','Otro'],
            salud_b: ['Sospecha de embarazo','Embarazo confirmado','Estudiante con hijo/s'],
            ocup: ['Decisión vocacional','Evaluación ocupacional','Administración de inventarios de intereses','Destrezas de empleabilidad','Proceso de transición a la vida universitaria','Rehabilitación vocacional','Otro'],
            acoso: ['Víctima','Bravucón','Espectador activo','Espectador pasivo'],
            maltrato: ['Explotación','Maltrato psicológico','Maltrato institucional','Maltrato físico','Abuso sexual','Trata humana','Negligencia educativa','Negligencia institucional'],
            ee: ['Cernimiento para posible registro en el Programa de Educación Especial inicial','Seguimiento a referido al Programa de Educación Especial psicosocial','Análisis de Evaluación de la Escala de Conducta','Historial psicosocial','Revisión del historial'],
            gMaestro: ['Orientación a estudiantes','Asignar tareas especiales','Entrevistas a padres / encargados','Implementación de estrategias de manejo de la conducta','Envío de notificaciones por diversos medios de comunicación','Referido previo al EIS','Ajustes o acomodos académicos o sala de clases','Otros'],
            gDirector: ['Discusión de referido con el personal de apoyo','Discusión de referido con maestros','Orientación a estudiante','Orientación a padres / encargados','Labor comunitaria','Aplicación reglamento escolar','Referido al Comité de Disciplina','Otros'],
            eis: ['Trabajador social','Consejero profesional','Enfermero escolar','Psicólogo'],
            historial: ['Referido al Departamento de la Familia','Referido a ASSMCA','Referido al Departamento de Vivienda','Referido a APS','Orientación al estudiante','Orientación a padres o encargados sobre situación del estudiante','Referido a consejero profesional en el escenario escolar','Referido a Educación Especial','Referido a la Policía de Puerto Rico','Referido al Departamento de Salud','Referido al trabajador social escolar','Otros']
        };

        const renderLista = (lista, marcadas, cls = 'col-list') =>
            `<div class="${cls}">${lista.map(v => chk(marcadas, v)).join('')}</div>`;

        const fechaImpresion = new Date().toLocaleDateString('es-PR');

        const pagina1 = `
            <div class="doc-oficial">
                <div class="doc-encabezado">
                    <div class="institucional">
                        ESTADO LIBRE ASOCIADO DE PUERTO RICO<br>
                        DEPARTAMENTO DE EDUCACIÓN<br>
                        Escuela Superior Vocacional Pablo Colón Berdecia<br>
                        Unidad de Apoyo Socioemocional
                    </div>
                    <div class="titulo-doc">Anexo 1 — Referido Único al Equipo Interdisciplinario Socioemocional</div>
                </div>
                <div class="conf-banner">DOCUMENTO CONFIDENCIAL — Forma parte del expediente psicosocial del estudiante</div>

                <table>
                    <tr>
                        <th style="width:18%">Estudiante</th><td style="width:42%">${esc(d.estudiante)}</td>
                        <th style="width:8%">Edad</th><td style="width:10%">${esc(d.edad)}</td>
                        <th style="width:12%">Núm. estudiante</th><td>${esc(d.numeroEstudiante)}</td>
                    </tr>
                    <tr>
                        <th>Grado</th><td>${esc(d.grado)}</td>
                        <th>Grupo</th><td>${esc(d.grupo)}</td>
                        <th>Educación Especial</th>
                        <td><span class="chk">${d.eduEspecial==='Sí'?CHK_ON:CHK_OFF}</span> Sí &nbsp; <span class="chk">${d.eduEspecial==='No'?CHK_ON:CHK_OFF}</span> No</td>
                    </tr>
                    <tr><th>Dirección residencial</th><td colspan="5">${esc(d.direccion)}</td></tr>
                    <tr>
                        <th>Madre, padre, encargado o tutor legal</th><td colspan="3">${esc(d.encargado)}</td>
                        <th>Fecha de radicación</th><td>${fmtFecha(d.fechaRadicacion)}</td>
                    </tr>
                    <tr>
                        <th>Tel. madre</th><td>${esc(d.telMadre)}</td>
                        <th>Tel. padre</th><td>${esc(d.telPadre)}</td>
                        <th>Tel. encargado/tutor</th><td>${esc(d.telTutor)}</td>
                    </tr>
                    <tr>
                        <th>Persona que refiere</th><td colspan="3">${esc(d.personaRefiere)}</td>
                        <th>Firma</th><td>${esc(d.firmaPersonaRefiere)}</td>
                    </tr>
                </table>

                <h3>I. Académico</h3>
                ${renderLista(listas.academico, cat.academico, 'col-list')}
                ${d.academicoOtro ? `<div class="small">Otro: <span class="campo">${esc(d.academicoOtro)}</span></div>` : ''}

                <h3>II. Asistencia</h3>
                ${renderLista(listas.asistencia, cat.asistencia, 'col-list')}

                <h3>III. Salud mental</h3>
                <h4>A. Conducta recurrente de agresividad / violencia</h4>
                ${renderLista(listas.sm_a, cat.salud_mental, 'col-list')}
                <h4>B. Necesidades psicológicas</h4>
                ${renderLista(listas.sm_b, cat.salud_mental, 'col-list-3')}
                <h4>C. Relaciones interpersonales</h4>
                ${renderLista(listas.sm_c, cat.salud_mental, 'col-list')}
                <h4>D. Comportamiento relacionado con la sexualidad</h4>
                ${renderLista(listas.sm_d, cat.salud_mental, 'col-list')}
                <h4>E. Conductas de alto riesgo</h4>
                ${renderLista(listas.sm_e, cat.salud_mental, 'col-list')}
                ${d.saludMentalOtro ? `<div class="small">Otro: <span class="campo">${esc(d.saludMentalOtro)}</span></div>` : ''}

                <div class="pie-pagina">Página 1 de 3 — Anexo 1 — Generado el ${esc(fechaImpresion)}</div>
            </div>`;

        const pagina2 = `
            <div class="doc-oficial page-break">
                <div class="conf-banner">DOCUMENTO CONFIDENCIAL — Anexo 1 (continuación)</div>

                <h3>IV. Salud</h3>
                <h4>A. Condiciones de salud</h4>
                ${renderLista(listas.salud_a, cat.salud, 'col-list-3')}
                ${d.saludOtro ? `<div class="small">Otro: <span class="campo">${esc(d.saludOtro)}</span></div>` : ''}
                <h4>B. Embarazadas</h4>
                ${renderLista(listas.salud_b, cat.salud, 'col-list')}

                <h3>V. Ocupacional o de carrera</h3>
                ${renderLista(listas.ocup, cat.ocupacional, 'col-list')}
                ${d.ocupacionalOtro ? `<div class="small">Otro: <span class="campo">${esc(d.ocupacionalOtro)}</span></div>` : ''}

                <h3>VI. Posible acoso escolar / cibernético</h3>
                ${renderLista(listas.acoso, cat.acoso, 'col-list')}

                <h3>VII. Posible maltrato / negligencia</h3>
                <table>
                    <tr>
                        <th style="width:22%">Núm. de referido</th><td style="width:28%">${esc(d.maltratoNumRef)}</td>
                        <th style="width:22%">Fecha al Depto. de la Familia</th><td>${fmtFecha(d.maltratoFecha)}</td>
                    </tr>
                    <tr>
                        <th>Persona que atendió la llamada</th><td>${esc(d.maltratoPersonaAtendio)}</td>
                        <th>Naturaleza de la situación</th><td>${esc(d.maltratoNaturaleza)}</td>
                    </tr>
                </table>
                ${renderLista(listas.maltrato, cat.maltrato, 'col-list')}

                <h3>VIII. Educación especial</h3>
                ${renderLista(listas.ee, cat.educacion_especial, 'col-list')}

                <h3>IX. Gestiones realizadas por el maestro</h3>
                <div class="small" style="font-style:italic;margin-bottom:4px;">Mínimo 3 gestiones previas al referido. Adjunte evidencias cuando aplique.</div>
                ${renderLista(listas.gMaestro, d.gestionMaestro, 'col-list')}
                ${d.gestionOtros ? `<div class="small">Otros: <span class="campo">${esc(d.gestionOtros)}</span></div>` : ''}

                <table style="margin-top:6px;">
                    <tr><th style="width:18%">Acuerdo 1</th><td>${esc(d.acuerdo1)}</td>
                        <th style="width:14%">Cumplió</th>
                        <td style="width:14%"><span class="chk">${d.acuerdo1Cumplio==='Sí'?CHK_ON:CHK_OFF}</span> Sí &nbsp; <span class="chk">${d.acuerdo1Cumplio==='No'?CHK_ON:CHK_OFF}</span> No</td></tr>
                    <tr><th>Acuerdo 2</th><td>${esc(d.acuerdo2)}</td>
                        <th>Cumplió</th>
                        <td><span class="chk">${d.acuerdo2Cumplio==='Sí'?CHK_ON:CHK_OFF}</span> Sí &nbsp; <span class="chk">${d.acuerdo2Cumplio==='No'?CHK_ON:CHK_OFF}</span> No</td></tr>
                </table>

                <table>
                    <tr>
                        <th style="width:25%">Director de escuela</th><td style="width:35%">${esc(d.nombreDirector)}</td>
                        <th style="width:15%">Firma</th><td style="width:15%">${esc(d.firmaDirector)}</td>
                        <th style="width:10%">Fecha</th><td>${fmtFecha(d.fechaEntregaDirector)}</td>
                    </tr>
                </table>
                <div class="small" style="margin-top:4px;"><strong>Personal de apoyo al que se entregó el referido:</strong>
                    <span class="chk">${d.personalApoyo.includes('Trabajador social')?CHK_ON:CHK_OFF}</span> Trabajador social &nbsp;
                    <span class="chk">${d.personalApoyo.includes('Consejero profesional')?CHK_ON:CHK_OFF}</span> Consejero profesional &nbsp;
                    <span class="chk">${d.personalApoyo.includes('Psicólogo')?CHK_ON:CHK_OFF}</span> Psicólogo &nbsp;
                    <span class="chk">${d.personalApoyo.includes('Enfermero')?CHK_ON:CHK_OFF}</span> Enfermero
                </div>
                <table>
                    <tr>
                        <th style="width:30%">Profesional de apoyo</th><td>${esc(d.nombreProfesionalApoyo)}</td>
                        <th style="width:15%">Firma</th><td>${esc(d.firmaProfesionalApoyo)}</td>
                    </tr>
                </table>

                <div class="pie-pagina">Página 2 de 3 — Anexo 1 — Generado el ${esc(fechaImpresion)}</div>
            </div>`;

        const pagina3 = `
            <div class="doc-oficial page-break">
                <div class="conf-banner">DOCUMENTO CONFIDENCIAL — Anexo 1 (seguimiento)</div>

                <h3>Gestiones realizadas por el director de escuela</h3>
                ${renderLista(listas.gDirector, d.gestionDirector, 'col-list')}
                ${d.gestionDirectorOtros ? `<div class="small">Otros: <span class="campo">${esc(d.gestionDirectorOtros)}</span></div>` : ''}
                <h4>Breve descripción del problema y seguimiento</h4>
                <div class="campo-largo" style="min-height:50px;">${esc(d.descripcionDirector).replace(/\n/g, '<br>')}</div>
                <table>
                    <tr>
                        <th style="width:30%">Nombre</th><td>${esc(d.nombreDirectorSeg)}</td>
                        <th style="width:15%">Firma</th><td>${esc(d.firmaDirectorSeg)}</td>
                        <th style="width:10%">Fecha</th><td>${fmtFecha(d.fechaDirectorSeg)}</td>
                    </tr>
                </table>

                <h3>Gestiones realizadas por el Equipo Interdisciplinario Socioemocional</h3>
                ${renderLista(listas.eis, d.eis, 'col-list')}

                <h3>Historial de referidos y servicios prestados anteriormente</h3>
                ${renderLista(listas.historial, d.historial, 'col-list')}
                ${d.historialOtros ? `<div class="small">Otros: <span class="campo">${esc(d.historialOtros)}</span></div>` : ''}
                <h4>Breve descripción y seguimiento de las gestiones realizadas</h4>
                <div class="campo-largo" style="min-height:50px;">${esc(d.descripcionHistorial).replace(/\n/g, '<br>')}</div>
                <table>
                    <tr>
                        <th style="width:30%">Nombre</th><td>${esc(d.nombreHistorial)}</td>
                        <th style="width:15%">Firma</th><td>${esc(d.firmaHistorial)}</td>
                        <th style="width:10%">Fecha</th><td>${fmtFecha(d.fechaHistorial)}</td>
                    </tr>
                </table>

                <div class="pie-pagina">Página 3 de 3 — Anexo 1 — Generado el ${esc(fechaImpresion)}</div>
            </div>`;

        return pagina1 + pagina2 + pagina3;
    }

    // ---------- Exportación a PDF ----------
    async function exportarReferidoPDF() {
        const v = validarReferido();
        if (!v.ok) { mostrarErrores(v.errores); return; }
        const datos = v.datos;

        const contenedor = document.getElementById('vista-oficial-pdf');
        contenedor.innerHTML = generarVistaOficialPDF(datos);
        contenedor.style.display = 'block';

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'in', format: 'letter', orientation: 'portrait' });
        const paginas = contenedor.querySelectorAll('.doc-oficial');

        try {
            for (let i = 0; i < paginas.length; i++) {
                const canvas = await html2canvas(paginas[i], { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                const img = canvas.toDataURL('image/png');
                if (i > 0) pdf.addPage('letter', 'portrait');
                // Carta = 8.5 x 11 in
                pdf.addImage(img, 'PNG', 0, 0, 8.5, 11, undefined, 'FAST');
            }
            const nombreSeguro = (datos.estudiante || 'Estudiante').replace(/[^\w\sñÑáéíóúÁÉÍÓÚ-]/g, '').replace(/\s+/g, '_');
            const fecha = (datos.fechaRadicacion || new Date().toISOString().slice(0, 10)).replace(/-/g, '');
            pdf.save(`Referido_EIS_${nombreSeguro}_${fecha}.pdf`);
            mostrarToast('PDF generado correctamente.', 'success');
        } catch (err) {
            mostrarToast('Ocurrió un error al generar el PDF.', 'danger');
        } finally {
            contenedor.style.display = '';
        }
    }


    function mostrarErrores(lista) {
        const ul = document.getElementById('listaErrores');
        ul.innerHTML = lista.map(e => `<li>${esc(e)}</li>`).join('');
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalErrores'));
        modal.show();
    }

    function mostrarVistaPrevia() {
        const datos = recolectar();
        const cont = document.getElementById('contenedorVistaPrevia');
        cont.innerHTML = generarVistaOficialPDF(datos);
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalVistaPrevia'));
        modal.show();
    }

    // ---------- Eventos ----------
    function bindEventos() {
        $('btnGuardarBorrador').addEventListener('click', guardarBorradorReferido);
        $('btnGuardarBorradorBottom').addEventListener('click', guardarBorradorReferido);
        $('btnCargarBorrador').addEventListener('click', cargarBorradorReferido);
        $('btnLimpiar').addEventListener('click', limpiarFormularioReferido);
        $('btnVistaPrevia').addEventListener('click', mostrarVistaPrevia);
        $('btnVistaPreviaBottom').addEventListener('click', mostrarVistaPrevia);
        $('btnExportarPDF').addEventListener('click', exportarReferidoPDF);
        $('btnExportarPDFBottom').addEventListener('click', exportarReferidoPDF);
        $('btnExportarDesdeVista').addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalVistaPrevia'));
            if (modal) modal.hide();
            exportarReferidoPDF();
        });

        form.addEventListener('input', actualizarProgreso);
        form.addEventListener('change', actualizarProgreso);
        form.addEventListener('submit', (e) => { e.preventDefault(); exportarReferidoPDF(); });

        // Cargar borrador automáticamente si existe (solo prefill, sin alerta intrusiva)
        if (localStorage.getItem(STORAGE_KEY)) {
            try {
                const { datos } = JSON.parse(localStorage.getItem(STORAGE_KEY));
                restaurarFormulario(datos);
            } catch (e) { /* noop */ }
        }
        actualizarProgreso();
    }

    document.addEventListener('DOMContentLoaded', bindEventos);

    // Exposición global para depuración / integración futura
    window.PCBReferidoEIS = {
        validarReferido,
        guardarBorradorReferido,
        cargarBorradorReferido,
        limpiarFormularioReferido,
        exportarReferidoPDF,
        generarVistaOficialPDF
    };
})();

