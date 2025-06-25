document.addEventListener('DOMContentLoaded', () => {
    // --- Variables de Estado Global ---
    let currentMonth = new Date().getMonth();
    let currentYear = new Date().getFullYear();
    let scheduledPosts = []; // Almacena todas las publicaciones programadas
    let mediaLibrary = []; // Almacena los objetos de medios subidos
    let editingPostId = null; // Para saber si estamos editando o creando una publicación

    // --- Referencias a Elementos del DOM ---
    const appContainer = document.getElementById('app-container');
    const mainContentArea = document.getElementById('main-content-area');

    // Navegación Sidebar
    const navCalendar = document.getElementById('nav-calendar');
    const navMediaLibrary = document.getElementById('nav-media-library');
    const navFeedPreview = document.getElementById('nav-feed-preview');
    const navAnalytics = document.getElementById('nav-analytics');
    const navDirectMessages = document.getElementById('nav-direct-messages');
    const allNavItems = [navCalendar, navMediaLibrary, navFeedPreview, navAnalytics, navDirectMessages];

    // Vistas
    const calendarView = document.getElementById('calendar-view');
    const mediaLibraryView = document.getElementById('media-library-view');
    const feedPreviewView = document.getElementById('feed-preview-view');
    const analyticsView = document.getElementById('analytics-view');
    const directMessagesView = document.getElementById('direct-messages-view');
    const allViews = [calendarView, mediaLibraryView, feedPreviewView, analyticsView, directMessagesView];

    // Calendario
    const currentMonthYearSpan = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const calendarDaysGrid = document.getElementById('calendar-days-grid');

    // Biblioteca de Medios
    const mediaGrid = document.getElementById('media-grid');
    const mediaLibraryEmptyState = document.getElementById('media-library-empty-state');

    // Previsualización del Feed
    const feedPreviewGrid = document.getElementById('feed-preview-grid');
    const feedPreviewEmptyState = document.getElementById('feed-preview-empty-state');


    // Modales
    const uploadMediaOverlay = document.getElementById('upload-media-overlay');
    const closeUploadMediaModalBtn = document.getElementById('close-upload-media-modal');
    const dropArea = document.getElementById('drop-area');
    const mediaUploadInput = document.getElementById('media-upload-input');
    const mediaPreviewContainer = document.getElementById('media-preview-container');
    const uploadMediaConfirmBtn = document.getElementById('upload-media-confirm-btn');

    const schedulePostOverlay = document.getElementById('schedule-post-overlay');
    const closeSchedulePostModalBtn = document.getElementById('close-schedule-post-modal');
    const schedulePostModalTitle = document.getElementById('schedule-post-modal-title');
    const scheduleMediaPreviewContainer = document.getElementById('schedule-media-preview-container');
    const postCaptionInput = document.getElementById('post-caption');
    const postDateInput = document.getElementById('post-date');
    const postTimeInput = document.getElementById('post-time');
    const postTypeSelect = document.getElementById('post-type');
    const postStatusSelect = document.getElementById('post-status');
    const savePostBtn = document.getElementById('save-post-btn');
    const deletePostBtn = document.getElementById('delete-post-btn');

    const viewPostOverlay = document.getElementById('view-post-overlay');
    const closeViewPostModalBtn = document.getElementById('close-view-post-modal');
    const singlePostView = document.getElementById('single-post-view');

    const storyReelViewer = document.getElementById('story-reel-viewer');
    const closeStoryReelViewerBtn = document.getElementById('close-story-reel-viewer');


    // Botones de Header adicionales
    const addPublicationBtn = document.getElementById('add-publication-btn');
    const uploadMediaBtnHeader = document.getElementById('upload-media-btn-header');


    // --- Funciones de Utilidad ---

    // Generar ID único
    function generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Guardar datos en localStorage
    function saveData() {
        localStorage.setItem('scheduledPosts', JSON.stringify(scheduledPosts));
        localStorage.setItem('mediaLibrary', JSON.stringify(mediaLibrary));
    }

    // Cargar datos de localStorage
    function loadData() {
        const storedPosts = localStorage.getItem('scheduledPosts');
        const storedMedia = localStorage.getItem('mediaLibrary');
        if (storedPosts) {
            scheduledPosts = JSON.parse(storedPosts);
        }
        if (storedMedia) {
            mediaLibrary = JSON.parse(storedMedia);
        }
    }

    // Mostrar/Ocultar vistas
    function showView(viewToShow) {
        allViews.forEach(view => view.classList.add('hidden'));
        viewToShow.classList.remove('hidden');

        allNavItems.forEach(item => item.classList.remove('active'));
        if (viewToShow === calendarView) navCalendar.classList.add('active');
        else if (viewToShow === mediaLibraryView) navMediaLibrary.classList.add('active');
        else if (viewToShow === feedPreviewView) navFeedPreview.classList.add('active');
        else if (viewToShow === analyticsView) navAnalytics.classList.add('active');
        else if (viewToShow === directMessagesView) navDirectMessages.classList.add('active');

        // Asegurarse de que el scroll se resetee al cambiar de vista
        mainContentArea.scrollTop = 0;

        // Si se cambia a la biblioteca de medios o previsualización, actualizarlas
        if (viewToShow === mediaLibraryView) renderMediaLibrary();
        if (viewToShow === feedPreviewView) renderFeedPreview();
    }


    // --- Funciones del Calendario ---

    function renderCalendar() {
        calendarDaysGrid.innerHTML = ''; // Limpiar el calendario
        currentMonthYearSpan.textContent = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 (Dom) a 6 (Sab)

        // Días del mes anterior para rellenar
        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDayOfWeek; i > 0; i--) {
            const dayNumber = prevMonthLastDay - i + 1;
            createCalendarDay(dayNumber, 'inactive-month', new Date(currentYear, currentMonth - 1, dayNumber));
        }

        // Días del mes actual
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            const classList = [];
            if (date.toDateString() === new Date().toDateString()) {
                classList.push('current-day');
            }
            createCalendarDay(i, classList.join(' '), date);
        }

        // Días del mes siguiente para rellenar
        const totalDaysDisplayed = firstDayOfWeek + daysInMonth;
        const remainingDays = 42 - totalDaysDisplayed; // Mostrar siempre 6 semanas (6 * 7 = 42 días)
        for (let i = 1; i <= remainingDays; i++) {
            createCalendarDay(i, 'inactive-month', new Date(currentYear, currentMonth + 1, i));
        }
    }

    function createCalendarDay(dayNumber, classes, dateObj) {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');
        if (classes) {
            dayDiv.classList.add(...classes.split(' '));
        }
        dayDiv.dataset.date = dateObj.toISOString().split('T')[0]; // Formato YYYY-MM-DD

        const dayNumberSpan = document.createElement('span');
        dayNumberSpan.classList.add('calendar-day-number');
        dayNumberSpan.textContent = dayNumber;
        dayDiv.appendChild(dayNumberSpan);

        // Añadir miniaturas de publicaciones para este día
        const postsForDay = scheduledPosts.filter(post => {
            const postDate = new Date(post.date);
            return postDate.toDateString() === dateObj.toDateString();
        }).sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time)); // Ordenar por hora

        postsForDay.forEach(post => {
            const thumbnailImg = document.createElement('img');
            thumbnailImg.classList.add('calendar-post-thumbnail');
            thumbnailImg.src = post.media[0].url; // Mostrar la primera imagen/video
            thumbnailImg.alt = post.caption.substring(0, 20) + '...';
            thumbnailImg.dataset.postId = post.id;
            thumbnailImg.classList.add(post.status + '-thumbnail'); // draft-thumbnail, scheduled-thumbnail, posted-thumbnail

            const postTypeIcon = document.createElement('span');
            postTypeIcon.classList.add('post-type-icon');
            if (post.type === 'reel') postTypeIcon.innerHTML = '<i class="fas fa-video"></i>';
            if (post.type === 'story') postTypeIcon.innerHTML = '<i class="fas fa-star"></i>'; // Icono de estrella para historias

            thumbnailImg.appendChild(postTypeIcon); // Poner el icono encima de la imagen
            dayDiv.appendChild(thumbnailImg);

            thumbnailImg.addEventListener('click', (e) => {
                e.stopPropagation(); // Evita que el clic se propague al día
                openSchedulePostModal(post.id);
            });
        });

        calendarDaysGrid.appendChild(dayDiv);

        // Eventos de Drag & Drop para el calendario
        dayDiv.addEventListener('dragover', allowDrop);
        dayDiv.addEventListener('drop', handleDrop);
        dayDiv.addEventListener('dragleave', handleDragLeave);
        dayDiv.addEventListener('dragenter', handleDragEnter);
    }

    function changeMonth(delta) {
        currentMonth += delta;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        } else if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    }

    // Drag & Drop para el calendario
    function allowDrop(e) {
        e.preventDefault();
        // Solo permitir soltar si es un medio o una publicación existente
        if (e.dataTransfer.types.includes('text/plain') || e.dataTransfer.types.includes('text/post-id')) {
            e.currentTarget.classList.add('drag-over');
        }
    }

    function handleDragEnter(e) {
        // Nada específico que hacer al entrar, ya se maneja en dragover
    }

    function handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        const droppedDate = e.currentTarget.dataset.date; // YYYY-MM-DD

        // Caso 1: Arrastrar desde la biblioteca de medios (crear nueva publicación)
        if (e.dataTransfer.types.includes('text/plain')) {
            const mediaId = e.dataTransfer.getData('text/plain');
            const selectedMedia = mediaLibrary.find(media => media.id === mediaId);

            if (selectedMedia) {
                // Abrir modal de programar publicación con el medio seleccionado y la fecha del calendario
                openSchedulePostModal(null, [selectedMedia], droppedDate);
            }
        }
        // Caso 2: Arrastrar una publicación existente del calendario (reprogramar)
        else if (e.dataTransfer.types.includes('text/post-id')) {
            const postId = e.dataTransfer.getData('text/post-id');
            const postToMove = scheduledPosts.find(post => post.id === postId);

            if (postToMove) {
                // Actualizar la fecha de la publicación
                postToMove.date = droppedDate;
                saveData();
                renderCalendar(); // Volver a renderizar el calendario para reflejar el cambio
                renderFeedPreview(); // Y también la vista previa del feed
                // Opcional: Mostrar un mensaje de confirmación
                // alert('Publicación reprogramada para ' + droppedDate);
            }
        }
    }


    // --- Funciones de la Biblioteca de Medios ---

    function renderMediaLibrary() {
        mediaGrid.innerHTML = '';
        if (mediaLibrary.length === 0) {
            mediaLibraryEmptyState.classList.remove('hidden');
        } else {
            mediaLibraryEmptyState.classList.add('hidden');
            mediaLibrary.forEach(media => {
                const mediaItem = document.createElement('div');
                mediaItem.classList.add('media-item');
                mediaItem.dataset.mediaId = media.id;
                mediaItem.setAttribute('draggable', true); // Hacer arrastrable

                let mediaElement;
                if (media.type.startsWith('image')) {
                    mediaElement = document.createElement('img');
                } else if (media.type.startsWith('video')) {
                    mediaElement = document.createElement('video');
                    mediaElement.muted = true; // Silenciar por defecto
                    mediaElement.loop = true; // Reproducir en bucle
                    mediaElement.addEventListener('mouseenter', () => mediaElement.play());
                    mediaElement.addEventListener('mouseleave', () => mediaElement.pause());
                }
                mediaElement.src = media.url;
                mediaItem.appendChild(mediaElement);

                const mediaTypeIcon = document.createElement('span');
                mediaTypeIcon.classList.add('media-type-icon');
                if (media.type.startsWith('image')) mediaTypeIcon.innerHTML = '<i class="fas fa-image"></i>';
                if (media.type.startsWith('video')) mediaTypeIcon.innerHTML = '<i class="fas fa-video"></i>';
                mediaItem.appendChild(mediaTypeIcon);

                mediaGrid.appendChild(mediaItem);

                // Evento para arrastrar medios
                mediaItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', media.id);
                    e.dataTransfer.effectAllowed = 'copyMove';
                });
            });
        }
    }

    function openUploadMediaModal() {
        uploadMediaOverlay.classList.remove('hidden');
        mediaPreviewContainer.innerHTML = ''; // Limpiar previsualizaciones anteriores
        uploadMediaInput.value = ''; // Resetear el input de archivo
        uploadMediaConfirmBtn.disabled = true; // Desactivar botón de subir
        // Resetear el estado del drag and drop
        dropArea.classList.remove('drag-over');
    }

    function closeUploadMediaModal() {
        uploadMediaOverlay.classList.add('hidden');
    }

    function handleMediaFiles(files) {
        mediaPreviewContainer.innerHTML = ''; // Limpiar previsualizaciones actuales
        const selectedFiles = Array.from(files);

        if (selectedFiles.length > 0) {
            uploadMediaConfirmBtn.disabled = false;
        } else {
            uploadMediaConfirmBtn.disabled = true;
        }

        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = document.createElement('div');
                previewItem.classList.add('media-preview-item');

                let mediaElement;
                if (file.type.startsWith('image/')) {
                    mediaElement = document.createElement('img');
                } else if (file.type.startsWith('video/')) {
                    mediaElement = document.createElement('video');
                    mediaElement.muted = true;
                    mediaElement.loop = true;
                    // mediaElement.controls = true; // Opcional, para controles en la preview
                }
                mediaElement.src = e.target.result;
                previewItem.appendChild(mediaElement);

                const removeBtn = document.createElement('button');
                removeBtn.classList.add('remove-media-btn');
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', () => {
                    previewItem.remove();
                    // Actualizar el estado del botón de subir si no quedan archivos
                    if (mediaPreviewContainer.children.length === 0) {
                        uploadMediaConfirmBtn.disabled = true;
                    }
                });
                previewItem.appendChild(removeBtn);

                mediaPreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    }

    function uploadMedia() {
        const previewItems = mediaPreviewContainer.querySelectorAll('.media-preview-item');
        previewItems.forEach(item => {
            const mediaElement = item.querySelector('img, video');
            if (mediaElement) {
                const newMedia = {
                    id: generateUniqueId(),
                    url: mediaElement.src,
                    type: mediaElement.tagName === 'IMG' ? 'image/jpeg' : 'video/mp4' // Asume tipo genérico
                };
                mediaLibrary.push(newMedia);
            }
        });
        saveData();
        renderMediaLibrary();
        closeUploadMediaModal();
        showView(mediaLibraryView); // Ir a la biblioteca después de subir
    }


    // --- Funciones de Programación/Edición de Publicaciones ---

    function openSchedulePostModal(postId = null, preselectedMedia = [], targetDate = null) {
        schedulePostOverlay.classList.remove('hidden');
        editingPostId = postId;
        scheduleMediaPreviewContainer.innerHTML = '';
        postCaptionInput.value = '';
        postDateInput.value = '';
        postTimeInput.value = '';
        postTypeSelect.value = 'feed';
        postStatusSelect.value = 'draft';
        deletePostBtn.classList.add('hidden'); // Ocultar botón de eliminar por defecto

        if (postId) {
            schedulePostModalTitle.textContent = 'Editar Publicación';
            deletePostBtn.classList.remove('hidden');
            const post = scheduledPosts.find(p => p.id === postId);
            if (post) {
                postCaptionInput.value = post.caption;
                postDateInput.value = post.date;
                postTimeInput.value = post.time;
                postTypeSelect.value = post.type;
                postStatusSelect.value = post.status;

                post.media.forEach(media => {
                    const previewItem = document.createElement('div');
                    previewItem.classList.add('media-preview-item');
                    let mediaElement;
                    if (media.type.startsWith('image')) {
                        mediaElement = document.createElement('img');
                    } else {
                        mediaElement = document.createElement('video');
                        mediaElement.muted = true;
                        mediaElement.loop = true;
                    }
                    mediaElement.src = media.url;
                    previewItem.appendChild(mediaElement);
                    scheduleMediaPreviewContainer.appendChild(previewItem);
                });
            }
        } else {
            schedulePostModalTitle.textContent = 'Programar Nueva Publicación';
            // Si hay medios preseleccionados (desde arrastrar y soltar en el calendario)
            if (preselectedMedia.length > 0) {
                preselectedMedia.forEach(media => {
                    const previewItem = document.createElement('div');
                    previewItem.classList.add('media-preview-item');
                    let mediaElement;
                    if (media.type.startsWith('image')) {
                        mediaElement = document.createElement('img');
                    } else {
                        mediaElement = document.createElement('video');
                        mediaElement.muted = true;
                        mediaElement.loop = true;
                    }
                    mediaElement.src = media.url;
                    // Añadir un dataset para identificar que es un medio temporalmente para la programación
                    previewItem.dataset.mediaId = media.id;
                    previewItem.dataset.mediaUrl = media.url;
                    previewItem.dataset.mediaType = media.type;
                    previewItem.appendChild(mediaElement);

                    // Botón para remover el medio de la programación
                    const removeBtn = document.createElement('button');
                    removeBtn.classList.add('remove-media-btn');
                    removeBtn.innerHTML = '&times;';
                    removeBtn.addEventListener('click', () => previewItem.remove());
                    previewItem.appendChild(removeBtn);

                    scheduleMediaPreviewContainer.appendChild(previewItem);
                });
            } else {
                // Si no hay medios preseleccionados, mostrar un mensaje o un botón para subir
                scheduleMediaPreviewContainer.innerHTML = '<p style="text-align: center; color: #8E8E8E;">Selecciona medios de la biblioteca o sube nuevos.</p>';
            }

            if (targetDate) {
                postDateInput.value = targetDate;
            } else {
                // Fecha por defecto: hoy
                postDateInput.valueAsDate = new Date();
            }
            // Hora por defecto: una hora en el futuro
            const now = new Date();
            now.setHours(now.getHours() + 1);
            postTimeInput.value = now.toTimeString().substring(0, 5);
        }
    }

    function closeSchedulePostModal() {
        schedulePostOverlay.classList.add('hidden');
        editingPostId = null;
    }

    function savePost() {
        const selectedMediaElements = scheduleMediaPreviewContainer.querySelectorAll('.media-preview-item');
        if (selectedMediaElements.length === 0) {
            alert('Debes seleccionar al menos una imagen o video para la publicación.');
            return;
        }

        const postMedia = Array.from(selectedMediaElements).map(item => {
            const mediaElement = item.querySelector('img, video');
            return {
                id: item.dataset.mediaId || generateUniqueId(), // Si es un medio nuevo, generar ID
                url: mediaElement.src,
                type: mediaElement.tagName === 'IMG' ? 'image/jpeg' : 'video/mp4' // Asume tipo genérico
            };
        });

        const newPost = {
            id: editingPostId || generateUniqueId(),
            media: postMedia,
            caption: postCaptionInput.value,
            date: postDateInput.value,
            time: postTimeInput.value,
            type: postTypeSelect.value,
            status: postStatusSelect.value
        };

        if (editingPostId) {
            // Actualizar publicación existente
            const index = scheduledPosts.findIndex(p => p.id === editingPostId);
            if (index !== -1) {
                scheduledPosts[index] = newPost;
            }
        } else {
            // Añadir nueva publicación
            scheduledPosts.push(newPost);
        }

        saveData();
        renderCalendar(); // Actualizar calendario
        renderFeedPreview(); // Actualizar previsualización del feed
        closeSchedulePostModal();
    }

    function deletePost() {
        if (editingPostId && confirm('¿Estás seguro de que quieres eliminar esta publicación programada?')) {
            scheduledPosts = scheduledPosts.filter(post => post.id !== editingPostId);
            saveData();
            renderCalendar();
            renderFeedPreview();
            closeSchedulePostModal();
        }
    }

    // --- Funciones de Previsualización del Feed ---

    function renderFeedPreview() {
        feedPreviewGrid.innerHTML = '';

        if (scheduledPosts.length === 0) {
            feedPreviewEmptyState.classList.remove('hidden');
        } else {
            feedPreviewEmptyState.classList.add('hidden');
            // Ordenar publicaciones por fecha y hora para simular el feed
            const sortedPosts = [...scheduledPosts].sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            });

            sortedPosts.forEach(post => {
                const previewItem = document.createElement('div');
                previewItem.classList.add('feed-preview-item');
                previewItem.dataset.postId = post.id;

                let mediaElement;
                if (post.media[0].type.startsWith('image')) {
                    mediaElement = document.createElement('img');
                } else if (post.media[0].type.startsWith('video')) {
                    mediaElement = document.createElement('video');
                    mediaElement.muted = true;
                    // No autoplay aquí para no sobrecargar
                }
                mediaElement.src = post.media[0].url;
                previewItem.appendChild(mediaElement);

                const typeIcon = document.createElement('span');
                typeIcon.classList.add('post-type-overlay-icon');
                if (post.type === 'reel') typeIcon.innerHTML = '<i class="fas fa-video"></i>';
                else if (post.type === 'story') typeIcon.innerHTML = '<i class="fas fa-star"></i>';
                else if (post.media.length > 1) typeIcon.innerHTML = '<i class="fas fa-clone"></i>'; // Icono para carrusel
                previewItem.appendChild(typeIcon);


                if (post.status === 'scheduled') {
                    previewItem.classList.add('scheduled-item');
                    const scheduledDateOverlay = document.createElement('div');
                    scheduledDateOverlay.classList.add('scheduled-date-overlay');
                    scheduledDateOverlay.textContent = new Date(`${post.date}T${post.time}`).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                    previewItem.appendChild(scheduledDateOverlay);
                } else if (post.status === 'draft') {
                    previewItem.classList.add('draft-item');
                    const draftLabel = document.createElement('div');
                    draftLabel.classList.add('scheduled-date-overlay'); // Reutilizar estilo, o crear uno nuevo
                    draftLabel.textContent = 'BORRADOR';
                    draftLabel.style.backgroundColor = 'rgba(255, 193, 7, 0.7)'; // Fondo amarillo para borrador
                    previewItem.appendChild(draftLabel);
                }

                feedPreviewGrid.appendChild(previewItem);

                previewItem.addEventListener('click', () => openViewPostModal(post.id));
            });
        }
    }

    // --- Funciones del Visor de Publicaciones (modal grande) ---

    function openViewPostModal(postId) {
        const post = scheduledPosts.find(p => p.id === postId);
        if (!post) return;

        viewPostOverlay.classList.remove('hidden');
        singlePostView.innerHTML = ''; // Limpiar contenido anterior

        // Si es una historia o un reel, abrir el visor de historias/reels
        if (post.type === 'story' || post.type === 'reel') {
            openStoryReelViewer(post);
            return; // No continuar con el modal de post normal
        }

        // Contenido del modal para publicaciones de feed
        const mediaSection = document.createElement('div');
        mediaSection.classList.add('feed-post-media');

        if (post.media.length > 1) {
            // Es un carrusel
            const carouselContainer = document.createElement('div');
            carouselContainer.classList.add('carousel-container');
            let currentMediaIndex = 0;

            post.media.forEach((media, index) => {
                let mediaElement;
                if (media.type.startsWith('image')) {
                    mediaElement = document.createElement('img');
                } else {
                    mediaElement = document.createElement('video');
                    mediaElement.muted = true;
                    mediaElement.controls = true;
                }
                mediaElement.src = media.url;
                mediaElement.classList.add('carousel-image');
                if (index === 0) mediaElement.classList.add('active');
                carouselContainer.appendChild(mediaElement);
            });

            const prevBtn = document.createElement('button');
            prevBtn.classList.add('carousel-button', 'prev');
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            prevBtn.addEventListener('click', () => {
                const images = carouselContainer.querySelectorAll('.carousel-image');
                images[currentMediaIndex].classList.remove('active');
                currentMediaIndex = (currentMediaIndex - 1 + images.length) % images.length;
                images[currentMediaIndex].classList.add('active');
                updateDots();
            });
            carouselContainer.appendChild(prevBtn);

            const nextBtn = document.createElement('button');
            nextBtn.classList.add('carousel-button', 'next');
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            nextBtn.addEventListener('click', () => {
                const images = carouselContainer.querySelectorAll('.carousel-image');
                images[currentMediaIndex].classList.remove('active');
                currentMediaIndex = (currentMediaIndex + 1) % images.length;
                images[currentMediaIndex].classList.add('active');
                updateDots();
            });
            carouselContainer.appendChild(nextBtn);

            const dotsContainer = document.createElement('div');
            dotsContainer.classList.add('carousel-dots');
            const updateDots = () => {
                dotsContainer.innerHTML = '';
                post.media.forEach((_, index) => {
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    if (index === currentMediaIndex) dot.classList.add('active');
                    dot.addEventListener('click', () => {
                        const images = carouselContainer.querySelectorAll('.carousel-image');
                        images[currentMediaIndex].classList.remove('active');
                        currentMediaIndex = index;
                        images[currentMediaIndex].classList.add('active');
                        updateDots();
                    });
                    dotsContainer.appendChild(dot);
                });
            };
            updateDots();
            carouselContainer.appendChild(dotsContainer);

            mediaSection.appendChild(carouselContainer);

        } else {
            // Es una sola imagen o video
            let mediaElement;
            if (post.media[0].type.startsWith('image')) {
                mediaElement = document.createElement('img');
            } else {
                mediaElement = document.createElement('video');
                mediaElement.controls = true;
                mediaElement.autoplay = true; // Autoreproducir video
                mediaElement.loop = true;
            }
            mediaElement.src = post.media[0].url;
            mediaSection.appendChild(mediaElement);
        }

        const detailsSection = document.createElement('div');
        detailsSection.classList.add('feed-post-details');

        detailsSection.innerHTML = `
            <div class="post-header">
                <img src="https://via.placeholder.com/32/cccccc?text=U" alt="User Avatar" class="user-avatar">
                <span class="username">@usuario_insimu_1</span>
            </div>
            <div class="post-caption-comments">
                <div class="post-caption">
                    <span class="username">@usuario_insimu_1</span> ${post.caption}
                </div>
                <div class="post-comments">
                    <div class="comment-item">
                        <span class="username">amigo_x</span> ¡Qué buena foto!
                    </div>
                    <div class="comment-item">
                        <span class="username">fan_page</span> Me encanta tu contenido.
                    </div>
                </div>
            </div>
            <div class="post-actions">
                <div class="action-icons">
                    <i class="far fa-heart"></i>
                    <i class="far fa-comment"></i>
                    <i class="far fa-paper-plane"></i>
                    <i class="far fa-bookmark" style="margin-left: auto;"></i>
                </div>
                <div class="post-likes">
                    Les gusta a <strong>1,234 personas</strong>
                </div>
                <div class="post-timestamp">
                    ${new Date(`${post.date}T${post.time}`).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
            </div>
            <div class="post-comment-input">
                <input type="text" placeholder="Añade un comentario...">
                <button>Publicar</button>
            </div>
        `;
        singlePostView.appendChild(mediaSection);
        singlePostView.appendChild(detailsSection);
    }

    function closeViewPostModal() {
        viewPostOverlay.classList.add('hidden');
        singlePostView.innerHTML = '';
        // Asegurarse de pausar cualquier video si se cierra el modal
        const videoElement = singlePostView.querySelector('video');
        if (videoElement) {
            videoElement.pause();
        }
    }

    // --- Visor de Historias/Reels ---
    function openStoryReelViewer(post) {
        if (!post || !post.media || post.media.length === 0 || !post.media[0].type.startsWith('video')) {
            alert('Contenido no válido para historia/reel.');
            return;
        }
        viewPostOverlay.classList.add('hidden'); // Asegurarse de que el modal normal esté oculto
        storyReelViewer.classList.remove('hidden');

        const storyReelContent = storyReelViewer.querySelector('.story-reel-content');
        storyReelContent.innerHTML = ''; // Limpiar contenido anterior

        const videoElement = document.createElement('video');
        videoElement.src = post.media[0].url;
        videoElement.autoplay = true;
        videoElement.loop = (post.type === 'reel'); // Reels se repiten, historias no
        videoElement.muted = false; // Sin mutear por defecto para mejor experiencia de reel/story
        videoElement.controls = true; // Mostrar controles para debugging o si se desea

        storyReelContent.appendChild(videoElement);

        // Añadir elementos de interfaz de historia/reel (avatar, nombre, etc.)
        const storyHeader = document.createElement('div');
        storyHeader.classList.add('story-header');
        storyHeader.innerHTML = `
            <img src="https://via.placeholder.com/40/cccccc?text=U" alt="User Avatar" class="user-avatar">
            <span class="username">@usuario_insimu_1</span>
            <span class="timestamp">${timeAgo(new Date(`${post.date}T${post.time}`))}</span>
        `;
        storyReelContent.appendChild(storyHeader);

        // Barra de progreso simple (simulada)
        const progressBarContainer = document.createElement('div');
        progressBarContainer.classList.add('story-progress-bars');
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        const progressBarFill = document.createElement('div');
        progressBarFill.classList.add('progress-bar-fill');
        progressBar.appendChild(progressBarFill);
        progressBarContainer.appendChild(progressBar);
        storyReelContent.appendChild(progressBarContainer);

        videoElement.addEventListener('timeupdate', () => {
            if (videoElement.duration) {
                const progress = (videoElement.currentTime / videoElement.duration) * 100;
                progressBarFill.style.width = `${progress}%`;
            }
        });

        videoElement.addEventListener('ended', () => {
            // Aquí podrías cargar la siguiente historia/reel si hubiera un array
            closeStoryReelViewer();
        });
    }

    function closeStoryReelViewer() {
        storyReelViewer.classList.add('hidden');
        const videoElement = storyReelViewer.querySelector('video');
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0; // Resetear el video
        }
    }

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " años";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " meses";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " días";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " horas";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutos";
        return Math.floor(seconds) + " segundos";
    }

    // --- Event Listeners ---

    // Navegación Sidebar
    navCalendar.addEventListener('click', () => showView(calendarView));
    navMediaLibrary.addEventListener('click', () => showView(mediaLibraryView));
    navFeedPreview.addEventListener('click', () => showView(feedPreviewView));
    navAnalytics.addEventListener('click', () => showView(analyticsView));
    navDirectMessages.addEventListener('click', () => showView(directMessagesView));

    // Calendario
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));

    // Modales de Medios y Publicaciones
    addPublicationBtn.addEventListener('click', () => openSchedulePostModal());
    uploadMediaBtnHeader.addEventListener('click', openUploadMediaModal);
    closeUploadMediaModalBtn.addEventListener('click', closeUploadMediaModal);
    uploadMediaConfirmBtn.addEventListener('click', uploadMedia);

    dropArea.addEventListener('click', () => mediaUploadInput.click());
    mediaUploadInput.addEventListener('change', (e) => handleMediaFiles(e.target.files));

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('drag-over');
    });
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        handleMediaFiles(e.dataTransfer.files);
    });

    closeSchedulePostModalBtn.addEventListener('click', closeSchedulePostModal);
    savePostBtn.addEventListener('click', savePost);
    deletePostBtn.addEventListener('click', deletePost);

    closeViewPostModalBtn.addEventListener('click', closeViewPostModal);
    closeStoryReelViewerBtn.addEventListener('click', closeStoryReelViewer);


    // --- Inicialización de la Aplicación ---
    loadData(); // Cargar datos al iniciar
    renderCalendar(); // Renderizar el calendario inicial
    renderMediaLibrary(); // Renderizar la biblioteca de medios
    renderFeedPreview(); // Renderizar la previsualización del feed
    showView(calendarView); // Mostrar la vista de calendario por defecto
});
