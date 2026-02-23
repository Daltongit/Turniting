document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------
    // 1. SISTEMA DE NAVEGACIÓN DE DIAPOSITIVAS
    // ----------------------------------------------------
    const slides = document.querySelectorAll(".slide");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const progressBar = document.getElementById("progress");

    let currentSlideIndex = 0;
    const totalSlides = slides.length;

    // Se expone al contexto global para el botón "Iniciar Recorrido"
    window.nextSlide = () => {
        if (currentSlideIndex < totalSlides - 1) {
            currentSlideIndex++;
            updateSlide();
        }
    };

    function prevSlide() {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlide();
        }
    }

    function updateSlide() {
        slides.forEach(slide => slide.classList.remove("active"));
        slides[currentSlideIndex].classList.add("active");

        const progressPercentage = ((currentSlideIndex) / (totalSlides - 1)) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        btnPrev.style.opacity = currentSlideIndex === 0 ? "0.3" : "1";
        btnPrev.style.pointerEvents = currentSlideIndex === 0 ? "none" : "auto";
        btnNext.style.opacity = currentSlideIndex === totalSlides - 1 ? "0.3" : "1";
        btnNext.style.pointerEvents = currentSlideIndex === totalSlides - 1 ? "none" : "auto";

        // Reiniciar animaciones especiales si es necesario
        if(currentSlideIndex === 0 && !typewriterDone) {
            startTypewriter();
        }
    }

    btnNext.addEventListener("click", window.nextSlide);
    btnPrev.addEventListener("click", prevSlide);

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") window.nextSlide();
        else if (e.key === "ArrowLeft") prevSlide();
    });

    // ----------------------------------------------------
    // 2. EFECTO MAQUINA DE ESCRIBIR (TYPEWRITER)
    // ----------------------------------------------------
    const titleText = "Historia de la IA & \nLa Máquina de Turing";
    const titleElement = document.getElementById("typewriter-title");
    let i = 0;
    let typewriterDone = false;

    function startTypewriter() {
        titleElement.innerHTML = "";
        i = 0;
        typeWriter();
    }

    function typeWriter() {
        if (i < titleText.length) {
            if(titleText.charAt(i) === '\n'){
                titleElement.innerHTML += '<br>';
            } else {
                titleElement.innerHTML += titleText.charAt(i);
            }
            i++;
            setTimeout(typeWriter, 50); // Velocidad de escritura
        } else {
            typewriterDone = true;
        }
    }
    
    // Iniciar el efecto al cargar
    setTimeout(startTypewriter, 500);

    // ----------------------------------------------------
    // 3. INTERACTIVIDAD DE LA LÍNEA DE TIEMPO
    // ----------------------------------------------------
    const timelineBtns = document.querySelectorAll('.tl-btn');
    const timelinePanels = document.querySelectorAll('.tl-panel');

    timelineBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Quitar clase activa a todos los botones y paneles
            timelineBtns.forEach(b => b.classList.remove('active'));
            timelinePanels.forEach(p => p.classList.remove('active'));

            // Añadir clase activa al botón presionado y a su panel
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // ----------------------------------------------------
    // 4. SIMULADOR DEL TEST DE TURING
    // ----------------------------------------------------
    let simulationRunning = false;
    
    window.startTuringSimulation = () => {
        if(simulationRunning) return; // Evitar multiples clicks
        simulationRunning = true;

        const chatBody = document.getElementById('chat-body');
        chatBody.innerHTML = '<div class="message system">Iniciando protocolo de prueba...</div>';

        const script = [
            { type: 'evaluator', text: 'Hola, ¿puedes escribir un poema sobre la lluvia?', delay: 1000 },
            { type: 'entity', text: 'Las gotas caen, el cielo llora, la tierra bebe en esta hora. ¿Te gusta así?', delay: 3500 },
            { type: 'evaluator', text: 'Nada mal. Ahora dime, ¿qué sientes al ver la lluvia?', delay: 2000 },
            { type: 'entity', text: 'Como un programa de computadora, no tengo emociones. Pero estadísticamente, la gente la asocia con melancolía.', delay: 4000 },
            { type: 'system', text: '>> ALERTA: Sujeto B ha revelado su naturaleza no humana. Test Fallido.', delay: 2000 }
        ];

        let accumulatedDelay = 0;

        script.forEach((msg) => {
            accumulatedDelay += msg.delay;
            setTimeout(() => {
                const msgDiv = document.createElement('div');
                msgDiv.className = `message ${msg.type}`;
                msgDiv.textContent = msg.text;
                chatBody.appendChild(msgDiv);
                
                // Auto-scroll al fondo
                chatBody.scrollTop = chatBody.scrollHeight;

                if (msg === script[script.length - 1]) {
                    simulationRunning = false; // Permitir reiniciar al final
                }
            }, accumulatedDelay);
        });
    };

    // Inicialización del estado de los botones
    updateSlide();
});
