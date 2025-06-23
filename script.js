document.addEventListener('DOMContentLoaded', () => {
    const feedContainer = document.getElementById('feed-container');
    const modalOverlay = document.getElementById('modal-overlay');
    const postModal = document.getElementById('post-modal');
    const storyReelViewer = document.getElementById('story-reel-viewer');

    // Función para cerrar cualquier vista modal/pantalla completa
    const closeView = () => {
        modalOverlay.classList.add('hidden');
        storyReelViewer.classList.add('hidden');
        // Limpiar contenido previo para evitar parpadeos
        postModal.innerHTML = '';
        storyReelViewer.innerHTML = '';
    };

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeView();
        }
    });

    // Cerrar al hacer clic fuera del modal (para Feed/Carrusel)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeView();
        }
    });

    // Delegación de eventos para manejar clics en publicaciones
    feedContainer.addEventListener('click', async (e) => {
        let postCard = e.target.closest('.post-card');
        if (!postCard) return;

        const postId = postCard.dataset.postId;
        const postType = postCard.dataset.postType;

        // Aquí deberías hacer una llamada a tu API o cargar los datos de la publicación
        const postData = await fetchPostData(postId); // Simula la obtención de datos

        if (!postData) {
            console.error('No se encontraron datos para la publicación:', postId);
            return;
        }

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

    // --- Funciones de Renderizado (Ejemplos simplificados) ---

    async function fetchPostData(id) {
        // Simula una llamada a la API
        return new Promise(resolve => {
            setTimeout(() => {
                const data = {
                    '123': { id: '123', type: 'feed', user: 'usuario_ejemplo', avatar: 'user.jpg', media: 'image1.jpg', caption: 'Mi primera publicación.', likes: 120, comments: ['Genial!', 'Me encanta.'] },
                    '124': { id: '124', type: 'carousel', user: 'fotografo_x', avatar: 'user2.jpg', media: ['car1.jpg', 'car2.jpg', 'car3.jpg'], caption: 'Paisajes increíbles.', likes: 300, comments: ['Espectacular.', 'Quiero ir!'] },
                    '125': { id: '125', type: 'story', user: 'viajero_aventura', avatar: 'user3.jpg', media: 'story_video.mp4', timeElapsed: '2h' },
                    '126': { id: '126', type: 'reel', user: 'bailarin_pro', avatar: 'user4.jpg', media: 'reel_dance.mp4', audio: 'Canción Viral', likes: 5000, comments: ['wow!', 'increíble ritmo.'] }
                };
                resolve(data[id]);
            }, 100);
        });
    }

    function renderFeedPost(post, container) {
        container.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                <span class="username">${post.user}</span>
                <button class="follow-btn">Seguir</button>
                <button class="close-btn" onclick="closeView()">&times;</button>
            </div>
            <div class="post-media">
                <img src="${post.media}" alt="Post Media">
            </div>
            <div class="post-actions">
                <i class="icon-heart"></i>
                <i class="icon-comment"></i>
                <i class="icon-share"></i>
                <i class="icon-save"></i>
            </div>
            <div class="post-details">
                <p class="likes">${post.likes} Me gusta</p>
                <p class="caption"><strong>${post.user}</strong> ${post.caption}</p>
                <div class="comments">
                    ${post.comments.map(c => `<p><strong>Comentario</strong> ${c}</p>`).join('')}
                </div>
                <input type="text" placeholder="Añade un comentario...">
            </div>
        `;
    }

    function renderCarouselPost(post, container) {
        let mediaHtml = post.media.map((src, index) => `<img src="${src}" class="carousel-item ${index === 0 ? 'active' : ''}" alt="Carousel Image ${index + 1}">`).join('');
        let indicatorsHtml = post.media.map((_, index) => `<span class="indicator ${index === 0 ? 'active' : ''}"></span>`).join('');

        container.innerHTML = `
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                <span class="username">${post.user}</span>
                <button class="follow-btn">Seguir</button>
                <button class="close-btn" onclick="closeView()">&times;</button>
            </div>
            <div class="carousel-media-container">
                <button class="carousel-nav prev">&lt;</button>
                <div class="carousel-track">
                    ${mediaHtml}
                </div>
                <button class="carousel-nav next">&gt;</button>
                <div class="carousel-indicators">${indicatorsHtml}</div>
            </div>
            <div class="post-actions">
                <i class="icon-heart"></i>
                <i class="icon-comment"></i>
                <i class="icon-share"></i>
                <i class="icon-save"></i>
            </div>
            <div class="post-details">
                <p class="likes">${post.likes} Me gusta</p>
                <p class="caption"><strong>${post.user}</strong> ${post.caption}</p>
                <div class="comments">
                    ${post.comments.map(c => `<p><strong>Comentario</strong> ${c}</p>`).join('')}
                </div>
                <input type="text" placeholder="Añade un comentario...">
            </div>
        `;

        // Lógica de carrusel (requeriría más JS para funcionalidad de slides)
        // Por ahora, solo es una estructura.
    }

    function renderStory(post, container) {
        container.innerHTML = `
            <div class="story-content">
                <video src="${post.media}" autoplay loop muted class="story-media"></video>
                <div class="story-header">
                    <div class="progress-bar-container">
                        <div class="progress-segment active"></div>
                        </div>
                    <img src="${post.avatar}" alt="${post.user}" class="user-avatar">
                    <span class="username">${post.user}</span>
                    <span class="time-elapsed">${post.timeElapsed}</span>
                    <button class="close-btn" onclick="closeView()">&times;</button>
                </div>
                <div class="story-actions">
                    <input type="text" placeholder="Enviar mensaje...">
                    <i class="icon-heart"></i>
                    <i class="icon-emoji"></i>
                </div>
                <div class="story-nav-area left" onclick="prevStory()"></div>
                <div class="story-nav-area right" onclick="nextStory()"></div>
            </div>
        `;
        // Lógica para avanzar/retroceder historias y barra de progreso
        const videoElement = container.querySelector('.story-media');
        if (videoElement) {
             videoElement.play(); // Asegurarse que se reproduce
        }
    }

    function renderReel(post, container) {
        container.innerHTML = `
            <div class="reel-content">
                <video src="${post.media}" autoplay loop muted class="reel-media"></video>
                <div class="reel-overlay">
                    <button class="close-btn" onclick="closeView()">&times;</button>
                    <div class="reel-info-bottom-left">
                        <p class="username-reel"><strong>${post.user}</strong></p>
                        <p class="reel-caption">${post.caption || ''}</p>
                        <p class="reel-audio"><i class="icon-music"></i> ${post.audio}</p>
                    </div>
                    <div class="reel-actions-right">
                        <div class="action-item"><i class="icon-heart"></i><span>${post.likes}</span></div>
                        <div class="action-item"><i class="icon-comment"></i><span>${post.comments.length}</span></div>
                        <div class="action-item"><i class="icon-share"></i></div>
                        <div class="action-item"><i class="icon-save"></i></div>
                    </div>
                </div>
            </div>
        `;
        const videoElement = container.querySelector('.reel-media');
        if (videoElement) {
             videoElement.play(); // Asegurarse que se reproduce
        }
    }
});
