document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const storiesSection = document.getElementById('stories-section');
    const modalOverlay = document.getElementById('modal-overlay');
    const postModal = document.getElementById('post-modal');
    const storyReelViewer = document.getElementById('story-reel-viewer');
    const newPostBtn = document.getElementById('new-post-btn');
    const createPostOverlay = document.getElementById('create-post-overlay');
    const createPostModal = document.getElementById('create-post-modal');
    const postTypeSelector = createPostModal.querySelector('.post-type-selector');
    const mediaInput = document.getElementById('media-input');
    const mediaPreviewContainer = document.getElementById('media-preview-container');
    const postCaptionInput = document.getElementById('post-caption');
    const publishPostBtn = document.getElementById('publish-post-btn');
    const accountSelector = document.getElementById('account-selector');
    const addAccountBtn = document.getElementById('add-account-btn');

    let currentMediaType = 'feed'; // Tipo de publicación seleccionado en el modal de creación
    let selectedMediaFiles = []; // Archivos seleccionados para la publicación
    let activeAccount = ''; // Cuenta de usuario activa

    // --- Cuentas y Datos de Simulación ---
    // Estructura de datos:
    // {
    //   'nombreUsuario1': {
    //     avatar: 'url_avatar',
    //     stories: [{ type: 'video', url: '...', duration: 5 }, ...],
    //     feed: [{ id: '...', type: 'feed', media: '...', caption: '...', ... }, ...]
    //   },
    //   'nombreUsuario2': { ... }
    // }
    let appData = JSON.parse(localStorage.getItem('insimuAppData')) || {
        'mi_usuario_ejemplo': {
            avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ME',
            stories: [
                { id: 'story_init_1', type: 'video', url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', duration: 5 },
                { id: 'story_init_2', type: 'image', url: 'https://via.placeholder.com/400x700/FFA07A/000000?text=Mi+historia', duration: 3 }
            ],
            feed: [
                { id: 'post_init_1', type: 'feed', user: 'mi_usuario_ejemplo', avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ME', media: 'https://via.placeholder.com/600x600/FFD700/000000?text=Mi+Primera+Publicacion', caption: '¡Hola, mundo! Esta es mi primera publicación en Insimu. #bienvenido', likes: 120, comments: [], time: '1h' },
                { id: 'post_init_2', type: 'carousel', user: 'mi_usuario_ejemplo', avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ME', media: ['https://via.placeholder.com/600x600/ADD8E6/000000?text=Carrusel+1', 'https://via.placeholder.com/600x600/B0E0E6/000000?text=Carrusel+2'], caption: 'Un pequeño carrusel de mis momentos favoritos. #recuerdos', likes: 80, comments: [], time: '3h' },
                { id: 'post_init_3', type: 'reel', user: 'mi_usuario_ejemplo', avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ME', media: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', caption: 'Mi primer reel, ¡probando nuevos bailes! #reel #dance', audio: 'Música Viral', likes: 300, comments: [], time: '5h' }
            ]
        }
    };

    // Función para guardar los datos en localStorage
    const saveAppData = () => {
        localStorage.setItem('insimuAppData', JSON.stringify(appData));
    };

    // --- Gestión de Cuentas ---
    const loadAccounts = () => {
        accountSelector.innerHTML = '';
        const usernames = Object.keys(appData);
        if (usernames.length === 0) {
            // Si no hay cuentas, crea una por defecto
            appData['usuario_demo'] = {
                avatar: 'https://via.placeholder.com/32x32/CCCCCC/000000?text=UD',
                stories: [],
                feed: []
            };
            saveAppData();
            usernames.push('usuario_demo');
        }

        usernames.forEach(username => {
            const option = document.createElement('option');
            option.value = username;
            option.textContent = username;
            accountSelector.appendChild(option);
        });

        // Seleccionar la cuenta activa guardada o la primera disponible
        activeAccount = localStorage.getItem('activeInsimuAccount') || usernames[0];
        if (!appData[activeAccount]) { // Si la cuenta activa guardada ya no existe
            activeAccount = usernames[0];
        }
        accountSelector.value = activeAccount;
        loadFeedForAccount(activeAccount);
    };

    const loadFeedForAccount = (username) => {
        activeAccount = username;
        localStorage.setItem('activeInsimuAccount', activeAccount);
        renderFeed(appData[activeAccount].feed);
        renderStories(appData[activeAccount].stories);
    };

    accountSelector.addEventListener('change', (e) => {
        loadFeedForAccount(e.target.value);
    });

    addAccountBtn.addEventListener('click', () => {
        const newUsername = prompt('Ingresa el nombre de la nueva cuenta:');
        if (newUsername && newUsername.trim() !== '' && !appData[newUsername]) {
            appData[newUsername] = {
                avatar: `https://via.placeholder.com/32x32/ABCDEF/000000?text=${newUsername.substring(0,2).toUpperCase()}`,
                stories: [],
                feed: []
            };
            saveAppData();
            loadAccounts(); // Recarga el selector para mostrar la nueva cuenta
            loadFeedForAccount(newUsername); // Cambia a la nueva cuenta
        } else if (newUsername) {
            alert('El nombre de usuario ya existe o no es válido.');
        }
    });

    // --- Funciones para abrir/cerrar modales ---
    const closeView = () => {
        modalOverlay.classList.add('hidden');
        storyReelViewer.classList.add('hidden');
        postModal.innerHTML = '';
        storyReelViewer.innerHTML = '';
        const activeMedia = document.querySelector('.story-reel-media, .modal-content video');
        if (activeMedia && typeof activeMedia.pause === 'function') {
            activeMedia.pause();
            activeMedia.currentTime = 0;
        }
    };
    window.closeView = closeView; // Hacer global para HTML

    const openCreatePostModal = () => {
        createPostOverlay.classList.remove('hidden');
        // Resetear el modal al abrirlo
        currentMediaType = 'feed';
        postTypeSelector.querySelector('.type-btn.active').classList.remove('active');
        postTypeSelector.querySelector('[data-type="feed"]').classList.add('active');
        mediaInput.value = '';
        selectedMediaFiles = [];
        mediaPreviewContainer.innerHTML = '';
        postCaptionInput.value = '';
    };

    const closeCreatePostModal = () => {
        createPostOverlay.classList.add('hidden');
    };
    window.closeCreatePostModal = closeCreatePostModal; // Hacer global

    newPostBtn.addEventListener('click', openCreatePostModal);

    // --- Lógica del Modal de Creación de Publicación ---
    postTypeSelector.addEventListener('click', (e) => {
        const btn = e.target.closest('.type-btn');
        if (btn) {
            postTypeSelector.querySelector('.type-btn.active')?.classList.remove('active');
            btn.classList.add('active');
            currentMediaType = btn.dataset.type;
            // Limpiar archivos y previsualizaciones al cambiar de tipo
            mediaInput.value = '';
            selectedMediaFiles = [];
            mediaPreviewContainer.innerHTML = '';
            // Restringir tipo de archivo para historias/reels (solo 1 video)
            if (currentMediaType === 'story' || currentMediaType === 'reel') {
                mediaInput.accept = 'image/*,video/*';
                mediaInput.removeAttribute('multiple');
            } else {
                mediaInput.accept = 'image/*,video/*';
                mediaInput.setAttribute('multiple', '');
            }
        }
    });

    mediaInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        selectedMediaFiles = []; // Reiniciar para nuevas selecciones

        // Lógica para limitar a un solo archivo para historias/reels
        if ((currentMediaType === 'story' || currentMediaType === 'reel') && files.length > 1) {
            alert('Para Historias y Reels, solo puedes seleccionar un archivo.');
            mediaInput.value = ''; // Limpiar la selección
            return;
        }

        mediaPreviewContainer.innerHTML = ''; // Limpiar previsualizaciones anteriores
        files.forEach(file => {
            selectedMediaFiles.push(file); // Guardar el archivo real

            const reader = new FileReader();
            reader.onload = (event) => {
                const previewItem = document.createElement('div');
                previewItem.className = 'media-preview-item';
                let mediaElement;
                if (file.type.startsWith('image/')) {
                    mediaElement = document.createElement('img');
                } else if (file.type.startsWith('video/')) {
                    mediaElement = document.createElement('video');
                    mediaElement.muted = true; // Silenciar previsualización
                    mediaElement.autoplay = true; // Autoplay en previsualización
                    mediaElement.loop = true;
                }
                mediaElement.src = event.target.result;
                previewItem.appendChild(mediaElement);

                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-media-btn';
                removeBtn.innerHTML = '&times;';
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evitar que el clic en el botón active el label
                    selectedMediaFiles = selectedMediaFiles.filter(f => f !== file);
                    previewItem.remove();
                    if (selectedMediaFiles.length === 0) {
                        mediaInput.value = ''; // Resetear input si no hay archivos
                    }
                });
                previewItem.appendChild(removeBtn);
                mediaPreviewContainer.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        });
    });


    // Función para "Publicar" el contenido
    publishPostBtn.addEventListener('click', () => {
        if (selectedMediaFiles.length === 0) {
            alert('Por favor, sube al menos una foto o video.');
            return;
        }

        if (currentMediaType === 'story' || currentMediaType === 'reel') {
            if (!selectedMediaFiles[0].type.startsWith('video/')) {
                 alert('Para Historias y Reels, por favor sube un video.');
                 return;
            }
        }


        const newPost = {
            id: 'post_' + Date.now(), // ID único
            user: activeAccount,
            avatar: appData[activeAccount].avatar,
            caption: postCaptionInput.value.trim(),
            likes: 0,
            comments: [],
            time: 'justo ahora'
        };

        // Convertir archivos a URL Blob para simular URLs de medios persistentes
        const mediaUrls = selectedMediaFiles.map(file => URL.createObjectURL(file));

        if (currentMediaType === 'feed') {
            newPost.type = 'feed';
            newPost.media = mediaUrls[0]; // Solo el primer archivo para feed simple
            appData[activeAccount].feed.unshift(newPost); // Añadir al principio del feed
        } else if (currentMediaType === 'carousel') {
            newPost.type = 'carousel';
            newPost.media = mediaUrls;
            appData[activeAccount].feed.unshift(newPost);
        } else if (currentMediaType === 'story') {
            newPost.type = 'story';
            // Para historias, necesitamos un formato de array de objetos con tipo y URL
            newPost.stories = mediaUrls.map(url => ({
                id: 'story_item_' + Date.now() + Math.random().toString(36).substr(2, 5),
                type: selectedMediaFiles[0].type.startsWith('image/') ? 'image' : 'video',
                url: url,
                duration: selectedMediaFiles[0].type.startsWith('video/') ? 10 : 5 // Duración predeterminada para simulación
            }));
            appData[activeAccount].stories.unshift(newPost.stories[0]); // Añadir la primera historia al array de historias del usuario
        } else if (currentMediaType === 'reel') {
            newPost.type = 'reel';
            newPost.media = mediaUrls[0];
            newPost.audio = 'Sonido Personalizado'; // Simulación
            appData[activeAccount].feed.unshift(newPost);
        }

        saveAppData();
        loadFeedForAccount(activeAccount); // Recargar feed y historias
        closeCreatePostModal();
        alert('Publicación creada con éxito!');
    });


    // --- Funciones de Renderizado de Contenido ---
    const renderFeed = (posts) => {
        feedContainer.innerHTML = '';
        if (posts.length === 0) {
            feedContainer.innerHTML = '<p class="no-posts">No hay publicaciones en este feed. ¡Publica algo!</p>';
            return;
        }
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.dataset.postId = post.id;
            postCard.dataset.postType = post.type;

            let mediaSrc = '';
            if (post.type === 'carousel') {
                mediaSrc = post.media[0]; // Muestra solo la primera imagen del carrusel en el feed
                postCard.innerHTML = `<img src="${mediaSrc}" alt="Publicación de Carrusel"><i class="fas fa-images carousel-indicator-icon"></i>`;
            } else if (post.type === 'reel') {
                mediaSrc = post.media; // URL del video del reel
                postCard.innerHTML = `<img src="${mediaSrc}" alt="Publicación de Reel" style="object-fit: cover; filter: brightness(0.8);">
                                       <i class="fas fa-video reel-indicator-icon"></i>`;
            } else { // feed
                mediaSrc = post.media;
                postCard.innerHTML = `<img src="${mediaSrc}" alt="Publicación de Feed">`;
            }
            feedContainer.appendChild(postCard);
        });
    };

    const renderStories = (stories) => {
        storiesSection.innerHTML = '';
        // Añadir "Tu Historia" si hay una cuenta activa y tiene historias
        const userStories = appData[activeAccount]?.stories || [];
        if (userStories.length > 0) {
            const yourStoryCard = document.createElement('div');
            yourStoryCard.className = 'post-card story-card';
            yourStoryCard.dataset.postType = 'story';
            yourStoryCard.dataset.postId = 'your-story-id'; // ID especial para tu historia
            yourStoryCard.innerHTML = `
                <div class="story-avatar-wrapper">
                    <img src="${appData[activeAccount].avatar}" alt="${activeAccount}">
                </div>
                <span>Tu historia</span>
            `;
            storiesSection.appendChild(yourStoryCard);
        }
        // Aquí podrías añadir historias de otros usuarios simulados si los tuvieras en `appData`
    };

    // --- Renderizado de Modales de Previsualización (con ligeras mejoras) ---

    // Las funciones `renderFeedPost`, `renderCarouselPost`, `renderStory`, `renderReel`
    // se mantienen muy similares a la versión anterior, con el `container.className`
    // ajustado para aplicar los estilos correctos de cada vista.
    // Asegúrate de que las URLs de medios sean `Blob URLs` si estás usando `URL.createObjectURL`.

    // Renderizado de publicación de Feed
    function renderFeedPost(post, container) {
        container.className = 'modal-content feed-post-view';
        container.innerHTML = `
            <button class="close-btn" onclick="closeView()"><i class="fas fa-times"></i></button>
            <div class="media-section">
                <img src="${post.media}" alt="Publicación de Feed">
            </div>
            <div class="info-section">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                    <span class="username">${post.user}</span>
                    <button class="follow-btn">Seguir</button>
                </div>
                <div class="comments-section">
                    <p class="caption-text"><strong>${post.user}</strong> ${post.caption}</p>
                    ${post.comments.map(c => `<p><strong>${c.user}</strong> ${c.text}</p>`).join('')}
                </div>
                <div class="post-actions-footer">
                    <div class="action-icons">
                        <i class="far fa-heart"></i>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                        <i class="far fa-bookmark" style="margin-left: auto;"></i>
                    </div>
                    <p class="likes-count">${post.likes.toLocaleString()} me gusta</p>
                    <p class="time-ago">HACE ${post.time}</p>
                    <div class="comment-input-section">
                        <input type="text" placeholder="Añade un comentario...">
                        <button>Publicar</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Renderizado de publicación de Carrusel
    function renderCarouselPost(post, container) {
        container.className = 'modal-content carousel-post-view';
        let mediaHtml = post.media.map((src, index) => `<img src="${src}" class="carousel-item ${index === 0 ? 'active' : ''}" alt="Carrusel Imagen ${index + 1}">`).join('');
        let indicatorsHtml = post.media.map((_, index) => `<span class="indicator ${index === 0 ? 'active' : ''}"></span>`).join('');

        container.innerHTML = `
            <button class="close-btn" onclick="closeView()"><i class="fas fa-times"></i></button>
            <div class="carousel-media-container">
                <button class="carousel-nav prev hidden"><i class="fas fa-chevron-left"></i></button>
                <div class="carousel-track">
                    ${mediaHtml}
                </div>
                <button class="carousel-nav next ${post.media.length <= 1 ? 'hidden' : ''}"><i class="fas fa-chevron-right"></i></button>
                <div class="carousel-indicators">${indicatorsHtml}</div>
            </div>
            <div class="info-section">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                    <span class="username">${post.user}</span>
                    <button class="follow-btn">Seguir</button>
                </div>
                <div class="comments-section">
                    <p class="caption-text"><strong>${post.user}</strong> ${post.caption}</p>
                    ${post.comments.map(c => `<p><strong>${c.user}</strong> ${c.text}</p>`).join('')}
                </div>
                <div class="post-actions-footer">
                    <div class="action-icons">
                        <i class="far fa-heart"></i>
                        <i class="far fa-comment"></i>
                        <i class="far fa-paper-plane"></i>
                        <i class="far fa-bookmark" style="margin-left: auto;"></i>
                    </div>
                    <p class="likes-count">${post.likes.toLocaleString()} me gusta</p>
                    <p class="time-ago">HACE ${post.time}</p>
                    <div class="comment-input-section">
                        <input type="text" placeholder="Añade un comentario...">
                        <button>Publicar</button>
                    </div>
                </div>
            </div>
        `;

        const track = container.querySelector('.carousel-track');
        const items = container.querySelectorAll('.carousel-item');
        const prevBtn = container.querySelector('.carousel-nav.prev');
        const nextBtn = container.querySelector('.carousel-nav.next');
        const indicators = container.querySelectorAll('.carousel-indicators .indicator');
        let currentIndex = 0;

        const updateCarousel = () => {
            track.style.transform = `translateX(-${currentIndex * 100}%)`;
            indicators.forEach((ind, i) => {
                ind.classList.toggle('active', i === currentIndex);
            });
            prevBtn.classList.toggle('hidden', currentIndex === 0);
            nextBtn.classList.toggle('hidden', currentIndex === items.length - 1);
        };

        nextBtn.addEventListener('click', () => {
            if (currentIndex < items.length - 1) {
                currentIndex++;
                updateCarousel();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateCarousel();
            }
        });
        updateCarousel();
    }

    // Renderizado de Historia
    function renderStory(postData, container) { // postData aquí es el objeto de la HISTORIA, no una publicación de feed
        container.className = 'story-reel-content';
        // Si el click es en "Tu historia" (ID especial), usa las historias de la cuenta activa
        const storiesToRender = postData.id === 'your-story-id' ? appData[activeAccount].stories : postData.stories;
        if (!storiesToRender || storiesToRender.length === 0) {
            alert('No hay historias disponibles.');
            closeView();
            return;
        }

        let currentStoryIndex = 0;
        let storyInterval;

        const startStoryTimer = () => {
            clearInterval(storyInterval);
            const currentStoryItem = storiesToRender[currentStoryIndex];
            // Asegurarse de que el elemento media existe antes de intentar reproducir
            const mediaElement = container.querySelector('.story-reel-media');
            if (mediaElement && currentStoryItem.type === 'video') {
                mediaElement.play().catch(e => console.error("Error al reproducir video:", e));
            }

            const duration = (currentStoryItem.duration || (currentStoryItem.type === 'video' ? 15 : 5)) * 1000;

            const progressBarSegments = container.querySelectorAll('.progress-segment');
            progressBarSegments.forEach((seg, i) => {
                seg.style.transition = 'none'; // Eliminar transición para resetear
                if (i < currentStoryIndex) {
                    seg.style.width = '100%';
                    seg.style.backgroundColor = '#fff';
                } else if (i === currentStoryIndex) {
                    seg.style.width = '0%';
                    seg.style.backgroundColor = 'rgba(255,255,255,0.4)';
                } else {
                    seg.style.width = '0%';
                    seg.style.backgroundColor = 'rgba(255,255,255,0.4)';
                }
            });

            setTimeout(() => { // Pequeño retraso para que el "transition: none" surta efecto
                if (progressBarSegments[currentStoryIndex]) {
                    progressBarSegments[currentStoryIndex].style.transition = `width ${duration / 1000}s linear`;
                    progressBarSegments[currentStoryIndex].style.width = '100%';
                    progressBarSegments[currentStoryIndex].style.backgroundColor = '#fff';
                }
            }, 50); // Mínimo retraso

            storyInterval = setTimeout(() => {
                nextStory();
            }, duration);
        };


        const renderCurrentStory = () => {
            if (currentStoryIndex >= storiesToRender.length) {
                closeView();
                return;
            }
            const currentStoryItem = storiesToRender[currentStoryIndex];
            const mediaTag = currentStoryItem.type === 'video' ?
                `<video src="${currentStoryItem.url}" autoplay muted playsinline class="story-reel-media"></video>` :
                `<img src="${currentStoryItem.url}" class="story-reel-media">`;

            const progressBars = storiesToRender.map((_, i) => `<div class="progress-segment ${i < currentStoryIndex ? 'active' : ''}"></div>`).join('');

            container.innerHTML = `
                <div class="story-reel-overlay">
                    <div class="top-bar">
                        <div class="progress-bar-container">${progressBars}</div>
                        <button class="close-btn" onclick="closeView()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="user-info">
                        <img src="${appData[activeAccount].avatar}" alt="${postData.user}" class="user-avatar">
                        <span class="username">${postData.user}</span>
                        <span class="time-elapsed">hace 2h</span>
                    </div>
                    <div class="bottom-bar">
                        <input type="text" placeholder="Enviar mensaje..." class="message-input">
                        <i class="far fa-heart action-icon"></i>
                        <i class="far fa-smile action-icon"></i>
                    </div>
                </div>
                ${mediaTag}
                <div class="story-nav-area left" onclick="prevStory()"></div>
                <div class="story-nav-area right" onclick="nextStory()"></div>
            `;
            startStoryTimer();
        };

        const nextStory = () => {
            currentStoryIndex++;
            if (currentStoryIndex < storiesToRender.length) {
                renderCurrentStory();
            } else {
                closeView();
            }
        };

        const prevStory = () => {
            if (currentStoryIndex > 0) {
                currentStoryIndex--;
                renderCurrentStory();
            }
        };

        window.nextStory = nextStory;
        window.prevStory = prevStory;

        renderCurrentStory();
    }


    // Renderizado de Reel
    function renderReel(post, container) {
        container.className = 'story-reel-content';
        container.innerHTML = `
            <video src="${post.media}" autoplay loop muted playsinline class="story-reel-media"></video>
            <div class="story-reel-overlay">
                <div class="top-bar">
                    <div class="user-info">
                        <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                        <span class="username">${post.user}</span>
                    </div>
                    <button class="close-btn" onclick="closeView()"><i class="fas fa-times"></i></button>
                </div>
                <div class="reel-info-bottom-left">
                    <p class="username-reel"><strong>${post.user}</strong></p>
                    <p class="reel-caption">${post.caption || ''}</p>
                    <p class="reel-audio"><i class="fas fa-music"></i> ${post.audio}</p>
                </div>
                <div class="reel-actions-vertical">
                    <div class="action-item"><i class="fas fa-heart"></i><span>${post.likes.toLocaleString()}</span></div>
                    <div class="action-item"><i class="fas fa-comment"></i><span>${post.comments.length}</span></div>
                    <div class="action-item"><i class="fas fa-paper-plane"></i><span></span></div>
                    <div class="action-item"><i class="fas fa-bookmark"></i><span></span></div>
                    <div class="action-item"><i class="fas fa-ellipsis-h"></i><span></span></div>
                </div>
                <div class="bottom-bar">
                    <input type="text" placeholder="Añade un comentario..." class="message-input">
                    <i class="far fa-smile action-icon"></i>
                </div>
            </div>
        `;
        const videoElement = container.querySelector('.story-reel-media');
        if (videoElement) {
            videoElement.play().catch(e => console.error("Error al reproducir reel:", e));
        }
    }

    // --- Delegación de eventos para la previsualización ---
    // Este manejador de eventos principal se asegura de que cuando hagas clic en una publicación
    // en el feed o una historia, se abra el modal de previsualización correcto.
    document.body.addEventListener('click', async (e) => {
        let targetElement = e.target;
        let postCard = targetElement.closest('.post-card');

        if (!postCard) return;

        const postId = postCard.dataset.postId;
        const postType = postCard.dataset.postType;

        closeView(); // Cierra cualquier vista abierta antes de abrir una nueva

        let postData;

        if (postType === 'story' && postId === 'your-story-id') {
            // Clic en "Tu Historia"
            postData = { id: 'your-story-id', user: activeAccount, stories: appData[activeAccount].stories };
        } else {
            // Buscar la publicación en el feed de la cuenta activa
            postData = appData[activeAccount].feed.find(p => p.id === postId);
            // Si no es del feed (ej. si implementas historias de otros usuarios), buscar en historias
            if (!postData && postType === 'story') {
                // Aquí deberías tener una lógica para buscar historias de otros usuarios
                // Por ahora, solo simulará si es "tu historia"
                postData = { id: postId, user: 'OtroUsuario', stories: [{ type: 'image', url: 'https://via.placeholder.com/400x700/808080/FFFFFF?text=Historia+de+Otro', duration: 5 }] };
            }
        }

        if (!postData) {
            console.error('No se encontraron datos para la publicación:', postId, postType);
            return;
        }

        switch (postType) {
            case 'feed':
            case 'carousel':
                renderFeedPost(postData, postModal); // Usa renderFeedPost para ambos si tienen la misma estructura de modal
                if (postType === 'carousel') {
                    renderCarouselPost(postData, postModal); // Sobrescribe para la lógica del carrusel
                }
                modalOverlay.classList.remove('hidden');
                break;
            case 'story':
                renderStory(postData, storyReelViewer);
                storyReelViewer.classList.remove('hidden');
                break;
            case 'reel':
                renderReel(postData, storyReelViewer);
                storyReelViewer.classList.remove('hidden');
                break;
            default:
                console.warn('Tipo de publicación desconocido:', postType);
        }
    });

    // Cargar cuentas y feed inicial al cargar la página
    loadAccounts();
});
