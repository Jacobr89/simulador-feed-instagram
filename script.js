// --- Variables Globales ---
let planolyData = JSON.parse(localStorage.getItem('insimuPlanolyData')) || {};
let activeAccount = ''; // Nombre de usuario de la cuenta activa
let currentEditingPostId = null; // Guarda el ID de la publicación que se está editando
let currentScheduledMediaURLs = []; // Guarda los IDs de los medios seleccionados para la publicación en el modal de programación
let filesToUpload = []; // Guarda los objetos de archivo originales para la subida al mediaLibrary

// Estado actual del calendario
let currentCalendarDate = new Date(); // Usamos esto para navegar meses

// --- Elementos del DOM ---
// Header y selector de cuenta
const accountSelector = document.getElementById('account-selector');
const addAccountBtn = document.getElementById('add-account-btn');
const addMediaHeaderBtn = document.getElementById('add-media-to-library-btn');

// Layout principal
const sidebar = document.getElementById('sidebar');
const mainContentArea = document.getElementById('main-content-area');

// Vistas principales
const calendarView = document.getElementById('calendar-view');
const mediaLibraryView = document.getElementById('media-library-view');
const instagramFeedPreview = document.getElementById('instagram-feed-preview');
const analyticsReportView = document.getElementById('analytics-report-view');

// Controles del calendario
const prevMonthBtn = document.getElementById('prev-month-btn');
const nextMonthBtn = document.getElementById('next-month-btn');
const currentMonthYearSpan = document.getElementById('current-month-year');
const calendarDaysGrid = document.getElementById('calendar-days-grid');

// Biblioteca de medios
const mediaGrid = document.getElementById('media-grid');

// Modales de Instagram (preexistentes, adaptados)
const modalOverlay = document.getElementById('modal-overlay');
const postModal = document.getElementById('post-modal');
const storyReelViewer = document.getElementById('story-reel-viewer');

// Modal para subir medios a la biblioteca (nuevo)
const uploadMediaOverlay = document.getElementById('upload-media-overlay');
const mediaInput = document.getElementById('media-input');
const uploadMediaPreviewContainer = document.getElementById('upload-media-preview-container');
const addMediaToLibraryBtn = document.getElementById('add-to-library-btn'); // Botón dentro del modal

// Modal para Crear/Editar Publicación Programada (nuevo)
const schedulePostOverlay = document.getElementById('schedule-post-overlay');
const scheduleModalTitle = document.getElementById('schedule-modal-title');
const scheduledMediaPreview = document.getElementById('scheduled-media-preview');
const postTypeSelect = document.getElementById('post-type-select');
const scheduleDateInput = document.getElementById('schedule-date-input');
const scheduleCaptionInput = document.getElementById('schedule-caption');
const postStatusSelect = document.getElementById('post-status-select');
const saveScheduledPostBtn = document.getElementById('save-scheduled-post-btn');
const deleteScheduledPostBtn = document.getElementById('delete-scheduled-post-btn');

// Elemento para las analíticas
const reportData = document.getElementById('report-data');


// --- Funciones de Gestión de Datos ---

// Guarda los datos en localStorage
const savePlanolyData = () => {
    localStorage.setItem('insimuPlanolyData', JSON.stringify(planolyData));
    console.log('Datos guardados:', planolyData);
};

// Carga y gestiona las cuentas
const loadAccounts = () => {
    accountSelector.innerHTML = '';
    const usernames = Object.keys(planolyData);

    if (usernames.length === 0) {
        // Si no hay cuentas, crea una por defecto con estructura Planoly
        const defaultUsername = 'insimu_user';
        planolyData[defaultUsername] = {
            avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ME',
            mediaLibrary: [
                { id: 'media_initial_1', url: 'https://via.placeholder.com/600x600/FFD700/000000?text=Media+1', type: 'image', uploadedAt: new Date().toISOString() },
                { id: 'media_initial_2', url: 'https://via.placeholder.com/600x600/ADD8E6/000000?text=Media+2', type: 'image', uploadedAt: new Date().toISOString() },
                { id: 'media_initial_3', url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', type: 'video', uploadedAt: new Date().toISOString() }
            ],
            calendarPosts: [
                {
                    id: 'post_initial_1',
                    mediaIds: ['media_initial_1'],
                    caption: '¡Hola Insimu! Esta es una publicación de ejemplo.',
                    postType: 'feed',
                    scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
                    status: 'posted', // Ya "publicada"
                    likes: 150,
                    comments: [{ user: 'amigo1', text: '¡Genial!' }],
                },
                {
                    id: 'post_initial_2',
                    mediaIds: ['media_initial_2', 'media_initial_3'], // Ejemplo de carrusel
                    caption: 'Planificando mi semana con Insimu. #planner',
                    postType: 'carousel',
                    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // En 3 días
                    status: 'scheduled', // Programada
                    likes: 0, // No tiene likes hasta que se "publique"
                    comments: [],
                }
            ],
            analytics: {
                totalPosts: 0,
                totalLikes: 0,
                totalComments: 0,
                audienceReach: 1000,
            }
        };
        savePlanolyData();
        usernames.push(defaultUsername);
    }

    usernames.forEach(username => {
        const option = document.createElement('option');
        option.value = username;
        option.textContent = username;
        accountSelector.appendChild(option);
    });

    activeAccount = localStorage.getItem('activeInsimuAccount') || usernames[0];
    if (!planolyData[activeAccount]) {
        activeAccount = usernames[0];
    }
    accountSelector.value = activeAccount;
    loadAccountData(activeAccount);
};

// Carga los datos específicos de la cuenta activa y renderiza la vista
const loadAccountData = (username) => {
    activeAccount = username;
    localStorage.setItem('activeInsimuAccount', activeAccount);
    console.log(`Cargando datos para ${activeAccount}:`, planolyData[activeAccount]);
    renderCurrentView(); // Renderiza la vista activa después de cambiar de cuenta
};

// --- Gestión de Vistas (Navegación de la Barra Lateral) ---
const showView = (viewId) => {
    // Oculta todas las vistas principales
    document.querySelectorAll('.main-view').forEach(view => {
        view.classList.add('hidden');
    });

    // Muestra la vista seleccionada
    document.getElementById(viewId).classList.remove('hidden');

    // Actualiza la clase 'active' en la barra lateral
    document.querySelectorAll('#sidebar li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`#sidebar li[data-view="${viewId}"]`).classList.add('active');

    // Guarda la última vista activa
    localStorage.setItem('lastInsimuView', viewId);

    // Renderiza la vista específica al mostrarla
    if (viewId === 'calendar-view') {
        renderCalendar();
    } else if (viewId === 'media-library-view') {
        renderMediaLibrary();
    } else if (viewId === 'instagram-feed-preview') {
        renderInstagramFeedPreview();
    } else if (viewId === 'analytics-report-view') {
        renderAnalyticsReport();
    }
};

// Renderiza la vista actual al cargar la página o cambiar de cuenta
const renderCurrentView = () => {
    const lastView = localStorage.getItem('lastInsimuView') || 'calendar-view';
    const targetView = document.getElementById(lastView) ? lastView : 'calendar-view';
    showView(targetView);
};

// --- Funciones del Calendario ---
const renderCalendar = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth(); // 0-11

    currentMonthYearSpan.textContent = new Date(year, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    calendarDaysGrid.innerHTML = ''; // Limpia la cuadrícula actual

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 para domingo, 1 para lunes, etc.

    // Calcular cuántos días en total se mostrarán (incluyendo días del mes anterior/siguiente)
    const totalDays = lastDayOfMonth.getDate() + startDayOfWeek + (6 - lastDayOfMonth.getDay());

    for (let i = 0; i < totalDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');

        const date = new Date(year, month, 1 - startDayOfWeek + i);
        const dayNumber = date.getDate();
        const monthNumber = date.getMonth();
        const fullDateString = date.toISOString().split('T')[0]; // YYYY-MM-DD

        dayElement.dataset.date = fullDateString
