document.addEventListener('DOMContentLoaded', () => {
    const imageUpload = document.getElementById('imageUpload');
    const instagramFeed = document.getElementById('instagramFeed');
    const generateLinkButton = document.getElementById('generateLink');
    const uploadButton = document.getElementById('uploadButton');
    const headerTitle = document.getElementById('headerTitle');
    const noPostsMessage = document.getElementById('noPostsMessage');

    let uploadedImagesData = []; // Almacena objetos {src: base64, description: string}

    // --- Funciones Principales ---

    // Muestra una publicación en el feed
    function displayPost(imageData, description = "Haz clic para añadir una descripción...") {
        // Oculta el mensaje "Sube tus fotos..."
        if (noPostsMessage) {
            noPostsMessage.style.display = 'none';
        }

        const postDiv = document.createElement('div');
        postDiv.classList.add('instagram-post');

        const imgElement = document.createElement('img');
        imgElement.src = imageData;
        imgElement.alt = "Publicación de Instagram";

        const textElement = document.createElement('p');
        textElement.contentEditable = "true";
        textElement.textContent = description;

        // Guarda la descripción cuando el usuario deja de editar
        textElement.addEventListener('blur', () => {
            const index = Array.from(instagramFeed.children).indexOf(postDiv);
            if (index !== -1 && uploadedImagesData[index]) {
                uploadedImagesData[index].description = textElement.textContent;
            }
        });

        postDiv.appendChild(imgElement);
        postDiv.appendChild(textElement);
        instagramFeed.appendChild(postDiv);
    }

    // --- Manejadores de Eventos ---

    // Maneja la carga de imágenes
    imageUpload.addEventListener('change', (event) => {
        const files = event.target.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const base64Image = e.target.result;
                    uploadedImagesData.push({ src: base64Image, description: "Haz clic para añadir una descripción..." });
                    displayPost(base64Image);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Por favor, selecciona solo archivos de imagen.');
            }
        }
    });

    // Genera el link compartible
    generateLinkButton.addEventListener('click', () => {
        if (uploadedImagesData.length === 0) {
            alert('¡Sube al menos una imagen para generar el link!');
            return;
        }

        // Serializa los datos (imágenes y descripciones) a JSON
        const dataToShare = JSON.stringify(uploadedImagesData);
        // Codifica el JSON a Base64 para que sea seguro en el URL
        const encodedData = btoa(dataToShare);

        // Construye el URL. window.location.origin es "http://tudominio.com"
        // window.location.pathname es "/tu_carpeta/index.html" (o solo "/" si está en la raíz)
        const shareableLink = `${window.location.origin}${window.location.pathname}?data=${encodedData}`;

        // Copiar al portapapeles
        navigator.clipboard.writeText(shareableLink).then(() => {
            alert('¡Link copiado al portapapeles! Compártelo para la aprobación:\n' + shareableLink);
        }).catch(err => {
            console.error('Error al copiar el link: ', err);
            alert('No se pudo copiar el link automáticamente. Cópialo manualmente:\n' + shareableLink);
        });
    });

    // --- Lógica de Carga al Abrir el Link ---

    // Carga las publicaciones si el URL tiene el parámetro 'data'
    function loadPostsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedData = urlParams.get('data');

        if (encodedData) {
            try {
                // Decodifica de Base64 y luego parsea el JSON
                const decodedData = atob(encodedData);
                uploadedImagesData = JSON.parse(decodedData);

                // Muestra cada publicación
                uploadedImagesData.forEach(item => displayPost(item.src, item.description));

                // Configura el modo de "solo lectura"
                document.body.classList.add('shared-mode');
                headerTitle.textContent = 'Feed para Aprobación';
                uploadButton.style.display = 'none'; // Oculta el botón de subir
                generateLinkButton.style.display = 'none'; // Oculta el botón de generar link

                // Deshabilita la edición de texto en modo compartido
                document.querySelectorAll('.instagram-post p').forEach(p => {
                    p.contentEditable = "false";
                });

            } catch (e) {
                console.error('Error al decodificar o parsear datos del URL:', e);
                alert('Hubo un problema al cargar el feed compartido. El enlace podría estar corrupto.');
                // En caso de error, muestra los controles normales
                document.body.classList.remove('shared-mode');
            }
        } else {
            // Si no hay parámetro 'data', asegúrate de que los controles estén visibles
            document.body.classList.remove('shared-mode');
        }
    }

    // Ejecuta la carga de posts al inicio
    loadPostsFromURL();

    // Muestra el mensaje inicial si no hay posts y no se cargó desde un link
    if (uploadedImagesData.length === 0 && !new URLSearchParams(window.location.search).get('data')) {
        if (noPostsMessage) {
            noPostsMessage.style.display = 'block';
        }
    }
});