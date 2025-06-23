document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const modalOverlay = document.getElementById('modal-overlay');
    const postModal = document.getElementById('post-modal');
    const storyReelViewer = document.getElementById('story-reel-viewer');

    // Función para cerrar cualquier vista modal/pantalla completa
    const closeView = () => {
        modalOverlay.classList.add('hidden');
        storyReelViewer.classList.add('hidden');
        // Limpiar contenido previo y detener videos
        postModal.innerHTML = '';
        storyReelViewer.innerHTML = '';
        const activeMedia = document.querySelector('.story-reel-media');
        if (activeMedia && typeof activeMedia.pause === 'function') {
            activeMedia.pause();
            activeMedia.currentTime = 0; // Reiniciar video
        }
    };

    // Asignar función closeView al objeto window para poder llamarla desde el HTML
    window.closeView = closeView;

    // Cerrar con la tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeView();
        }
    });

    // Cerrar el modal al hacer clic fuera de su contenido (solo para Feed/Carrusel)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeView();
        }
    });

    // Delegación de eventos para manejar clics en publicaciones
    feedContainer.addEventListener('click', async (e) => {
        let postCard = e.target.closest('.post-card');
        if (!postCard) return; // Si no se hizo clic en una tarjeta de publicación, salir

        const postId = postCard.dataset.postId;
        const postType = postCard.dataset.postType;

        // Simula la obtención de datos de la publicación (aquí deberías integrar tu API)
        const postData = await fetchPostData(postId);

        if (!postData) {
            console.error('No se encontraron datos para la publicación:', postId);
            return;
        }

        // Limpia cualquier vista abierta antes de mostrar una nueva
        closeView();

        switch (postType) {
            case 'feed':
                renderFeedPost(postData, postModal);
                modalOverlay.classList.remove('hidden');
                break;
            case 'carousel':
                renderCarouselPost(postData, postModal);
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

    // --- Funciones de Simulación de Datos (Reemplazar con tu API Real) ---
    async function fetchPostData(id) {
        // Simula una llamada a la API con datos de ejemplo
        return new Promise(resolve => {
            setTimeout(() => {
                const data = {
                    'post1': {
                        id: 'post1', type: 'feed', user: 'explorador_digital', avatar: 'https://via.placeholder.com/32x32/FFC0CB/000000?text=ED',
                        media: 'https://via.placeholder.com/600x600/FFD700/000000?text=Foto+Feed+1', caption: 'Capturando momentos increíbles. #viaje #aventura',
                        likes: 1250, comments: [{user: 'viajero_pro', text: '¡Qué foto tan genial!'}, {user: 'fotografo_novato', text: 'Me encanta la composición.'}],
                        time: '1h'
                    },
                    'post2': {
                        id: 'post2', type: 'carousel', user: 'arte_urbano', avatar: 'https://via.placeholder.com/32x32/87CEEB/000000?text=AU',
                        media: ['https://via.placeholder.com/600x600/ADD8E6/000000?text=Mural+1', 'https://via.placeholder.com/600x600/B0E0E6/000000?text=Mural+2', 'https://via.placeholder.com/600x600/AFEEEE/000000?text=Mural+3'],
                        caption: 'Descubriendo el arte callejero de la ciudad. Cada rincón es una obra. #streetart #graffiti',
                        likes: 890, comments: [{user: 'critico_arte', text: 'Impresionante colección.'}, {user: 'curioso_urbano', text: '¿Dónde es esto?'}],
                        time: '3h'
                    },
                    'post3': {
                        id: 'post3', type: 'feed', user: 'cocina_creativa', avatar: 'https://via.placeholder.com/32x32/98FB98/000000?text=CC',
                        media: 'https://via.placeholder.com/600x600/90EE90/000000?text=Plato+del+dia', caption: 'Nuevo experimento culinario. ¡Delicioso y saludable! #receta #saludable',
                        likes: 2100, comments: [{user: 'foodie_feliz', text: '¡Se ve increíble!'}, {user: 'chef_casero', text: 'Comparte la receta por favor!'}],
                        time: '5h'
                    },
                    'story1': {
                        id: 'story1', type: 'story', user: 'aventurero_extremo', avatar: 'https://via.placeholder.com/32x32/FF6347/000000?text=AE',
                        media: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', // Video de ejemplo
                        // Puedes tener un array de historias para un mismo usuario
                        stories: [
                            { type: 'video', url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', duration: 5 },
                            { type: 'image', url: 'https://via.placeholder.com/400x700/FFA07A/000000?text=Historia+2', duration: 3 }
                        ]
                    },
                    'reel1': {
                        id: 'reel1', type: 'reel', user: 'bailarina_moderna', avatar: 'https://via.placeholder.com/32x32/DA70D6/000000?text=BM',
                        media: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', // Video de ejemplo
                        caption: 'Un poco de movimiento para empezar la semana. 💃 #dance #reel #goodvibes',
                        audio: 'Ritmo Pegadizo - Artista Genérico',
                        likes: 7500, comments: [{user: 'fan_1', text: '¡Increíble energía!'}, {user: 'coreografo', text: 'Me encanta tu estilo.'}],
                    }
                };
                resolve(data[id]);
            }, 100);
        });
    }

    // --- Funciones de Renderizado de Contenido ---

    function renderFeedPost(post, container) {
        container.className = 'modal-content feed-post-view'; // Clases para el estilo
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

    function renderCarouselPost(post, container) {
        container.className = 'modal-content carousel-post-view'; // Clases para el estilo
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

        // Lógica del carrusel
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
        updateCarousel(); // Inicializar vista
    }


    function renderStory(post, container) {
        container.className = 'story-reel-content'; // Clases para el estilo
        let currentStoryIndex = 0;
        let storyInterval;
        const stories = post.stories; // Array de objetos {type: 'image'|'video', url: '...', duration: N}

        const startStoryTimer = () => {
            clearInterval(storyInterval); // Limpiar cualquier intervalo anterior
            const currentStory = stories[currentStoryIndex];
            const duration = currentStory.duration * 1000; // ms

            const progressBarSegments = container.querySelectorAll('.progress-segment');
            // Resetear progreso para la historia actual
            for (let i = 0; i < progressBarSegments.length; i++) {
                progressBarSegments[i].style.width = '0%';
                if (i > currentStoryIndex) progressBarSegments[i].style.backgroundColor = 'rgba(255,255,255,0.4)'; // Pendiente
                else if (i < currentStoryIndex) progressBarSegments[i].style.backgroundColor = '#fff'; // Ya vista
            }

            // Animar la barra de progreso
            if (progressBarSegments[currentStoryIndex]) {
                 progressBarSegments[currentStoryIndex].style.transition = `width ${duration / 1000}s linear`;
                 progressBarSegments[currentStoryIndex].style.width = '100%';
                 progressBarSegments[currentStoryIndex].style.backgroundColor = '#fff';
            }


            storyInterval = setTimeout(() => {
                nextStory();
            }, duration);

            // Asegurarse de que el video se reproduce si es el caso
            const mediaElement = container.querySelector('.story-reel-media');
            if (mediaElement && currentStory.type === 'video') {
                mediaElement.play();
            }
        };


        const renderCurrentStory = () => {
            if (currentStoryIndex >= stories.length) {
                closeView();
                return;
            }
            const currentStory = stories[currentStoryIndex];
            const mediaTag = currentStory.type === 'video' ? `<video src="${currentStory.url}" autoplay muted playsinline class="story-reel-media"></video>` : `<img src="${currentStory.url}" class="story-reel-media">`;

            const progressBars = stories.map((_, i) => `<div class="progress-segment ${i < currentStoryIndex ? 'active' : ''}"></div>`).join('');

            container.innerHTML = `
                <div class="story-reel-overlay">
                    <div class="top-bar">
                        <div class="progress-bar-container">${progressBars}</div>
                        <button class="close-btn" onclick="closeView()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="user-info">
                        <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                        <span class="username">${post.user}</span>
                        <span class="time-elapsed">hace 2h</span> </div>
                    <div class="bottom-bar">
                        <input type="text" placeholder="Enviar mensaje..." class="message-input">
                        <i class="far fa-heart action-icon"></i>
                        <i class="far fa-paper-plane action-icon"></i>
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
            if (currentStoryIndex < stories.length) {
                renderCurrentStory();
            } else {
                closeView(); // Todas las historias vistas
            }
        };

        const prevStory = () => {
            if (currentStoryIndex > 0) {
                currentStoryIndex--;
                renderCurrentStory();
            }
        };

        // Asignar funciones de navegación al window para que el HTML pueda llamarlas
        window.nextStory = nextStory;
        window.prevStory = prevStory;

        renderCurrentStory();
    }


    function renderReel(post, container) {
        container.className = 'story-reel-content'; // Clases para el estilo
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
                    <div class="action-item"><i class="fas fa-paper-plane"></i><span>Compartir</span></div>
                    <div class="action-item"><i class="fas fa-bookmark"></i><span>Guardar</span></div>
                </div>
                <div class="bottom-bar">
                    <input type="text" placeholder="Añade un comentario..." class="message-input">
                    <i class="far fa-grin action-icon"></i>
                </div>
            </div>
        `;
        // Asegurarse de que el video se reproduzca
        const videoElement = container.querySelector('.story-reel-media');
        if (videoElement) {
             videoElement.play();
        }
    }
});
