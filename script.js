document.addEventListener('DOMContentLoaded', () => {
    // 1. Tooltips para Palabras Clave (Módulo 1)
    const keywords = document.querySelectorAll('.keyword');
    keywords.forEach(keyword => {
        const metric = keyword.getAttribute('data-metric');
        const tooltip = document.createElement('span');
        tooltip.classList.add('tooltip');
        tooltip.textContent = metric;
        keyword.appendChild(tooltip);
    });

    // 2. Botón Copiar Frases (Módulo 2)
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const textToCopy = button.getAttribute('data-text');
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    // Opcional: Feedback visual de "Copiado!"
                    const originalIcon = button.innerHTML;
                    button.innerHTML = '<i class="fas fa-check"></i> Copiado!';
                    setTimeout(() => {
                        button.innerHTML = originalIcon;
                    }, 1500);
                })
                .catch(err => {
                    console.error('Error al copiar el texto: ', err);
                });
        });
    });

    // 3. Colores Dinámicos para KPI (Módulo 4)
    const resultsTableBody = document.querySelector('.results-table tbody');
    if (resultsTableBody) {
        resultsTableBody.querySelectorAll('tr').forEach(row => {
            const objective = parseFloat(row.getAttribute('data-objective').replace(/,/g, ''));
            const current = parseFloat(row.getAttribute('data-current').replace(/,/g, ''));
            const percentageCell = row.querySelector('.percentage');
            const progressValueCell = row.querySelector('.progress-value'); // La celda con el valor numérico

            if (isNaN(objective) || isNaN(current) || !percentageCell || !progressValueCell) {
                console.warn('Datos KPI incompletos para la fila:', row);
                return;
            }

            const percentage = (current / objective) * 100;
            percentageCell.textContent = `${Math.round(percentage)}%`; // Actualiza el porcentaje mostrado

            let colorClass = '';
            if (percentage < 30) { // Umbral bajo
                colorClass = 'color-red';
            } else if (percentage >= 30 && percentage < 70) { // Umbral medio
                colorClass = 'color-yellow';
            } else { // Umbral alto
                colorClass = 'color-green';
            }

            // Aplica el color a la celda del porcentaje y al valor numérico
            percentageCell.classList.add(colorClass);
            progressValueCell.classList.add(colorClass);
        });
    }

    // 4. Funcionalidad de Exportar a PDF (Módulo de Exportación)
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', () => {
            window.print(); // Esto activa el diálogo de impresión del navegador
        });
    }

    // 5. Interacción con Pilares de Comunicación (Módulo 2) - Ejemplo simple
    // Para una interacción más compleja (filtrar el calendario), necesitarías más lógica.
    const pilares = document.querySelectorAll('.pilar');
    pilares.forEach(pilar => {
        pilar.addEventListener('click', () => {
            const pilarName = pilar.getAttribute('data-pilar');
            alert(`Haz clic en el pilar: ${pilarName}. Aquí se filtraría o mostraría más información relacionada.`);
            // Implementa aquí la lógica para filtrar el calendario (Módulo 3)
            // Por ejemplo, añadiendo/quitando clases para mostrar/ocultar tareas.
        });
    });

    // 6. Interacción con Tareas de la Línea de Tiempo (Módulo 3) - Ejemplo simple
    const tasks = document.querySelectorAll('.timeline .task');
    tasks.forEach(task => {
        task.addEventListener('click', () => {
            const detail = task.getAttribute('data-detail');
            alert(`Detalles de la tarea:\n${task.textContent.trim()}\n\n${detail}`);
            // En un caso real, podrías abrir un modal con más detalles.
        });
    });

    // 7. Interacción con el Equipo Responsable (Módulo 5) - Ejemplo simple
    const teamMembers = document.querySelectorAll('.team-members ul li');
    teamMembers.forEach(member => {
        member.addEventListener('click', () => {
            const name = member.firstChild.textContent.trim();
            alert(`Haz clic en ${name}. Aquí se abriría una tarjeta de contacto completa.`);
            // En un caso real, podrías abrir un modal con la información de contacto.
        });
    });
});
