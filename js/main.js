document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todas las diapositivas y botones
    const slides = document.querySelectorAll(".slide");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const progressBar = document.getElementById("progress");

    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // Función para actualizar la diapositiva mostrada
    function updateSlide() {
        // Quitamos la clase 'active' a todas
        slides.forEach(slide => {
            slide.classList.remove("active");
        });

        // Añadimos 'active' a la diapositiva actual
        slides[currentSlideIndex].classList.add("active");

        // Actualizamos la barra de progreso
        const progressPercentage = ((currentSlideIndex) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Gestionamos la visibilidad de los botones
        if (currentSlideIndex === 0) {
            btnPrev.style.opacity = "0.3";
            btnPrev.style.cursor = "default";
        } else {
            btnPrev.style.opacity = "1";
            btnPrev.style.cursor = "pointer";
        }

        if (currentSlideIndex === totalSlides - 1) {
            btnNext.style.opacity = "0.3";
            btnNext.style.cursor = "default";
        } else {
            btnNext.style.opacity = "1";
            btnNext.style.cursor = "pointer";
        }
    }

    // Navegar a la siguiente diapositiva
    function nextSlide() {
        if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            updateSlide();
        }
    }

    // Navegar a la diapositiva anterior
    function prevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlide();
        }
    }

    // Event Listeners para los botones
    btnNext.addEventListener("click", nextSlide);
    btnPrev.addEventListener("click", prevSlide);

    // Event Listeners para el teclado (Flechas)
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "Space") {
            nextSlide();
        } else if (e.key === "ArrowLeft") {
            prevSlide();
        }
    });

    // Soporte básico para pantallas táctiles (Swipe)
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        // Si desliza a la izquierda
        if (touchEndX < touchStartX - 50) nextSlide();
        // Si desliza a la derecha
        if (touchEndX > touchStartX + 50) prevSlide();
    }

    // Inicializar presentación
    updateSlide();
});