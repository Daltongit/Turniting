document.addEventListener("DOMContentLoaded", () => {
    
    // --- NAVEGACIÓN PRINCIPAL ---
    const slides = document.querySelectorAll(".slide");
    const btnNext = document.getElementById("btn-next");
    const btnPrev = document.getElementById("btn-prev");
    const dotsContainer = document.getElementById("dots-container");
    
    let currentSlide = 0;

    // Crear puntos de navegación dinámicamente
    slides.forEach((_, index) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if(index === 0) dot.classList.add("active");
        dot.addEventListener("click", () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll(".dot");

    function goToSlide(index) {
        slides[currentSlide].classList.remove("active");
        dots[currentSlide].classList.remove("active");
        
        currentSlide = index;
        
        slides[currentSlide].classList.add("active");
        dots[currentSlide].classList.add("active");

        btnPrev.style.opacity = currentSlide === 0 ? "0.3" : "1";
        btnNext.style.opacity = currentSlide === slides.length - 1 ? "0.3" : "1";
    }

    btnNext.addEventListener("click", () => { if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1); });
    btnPrev.addEventListener("click", () => { if (currentSlide > 0) goToSlide(currentSlide - 1); });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "Space") { if (currentSlide < slides.length - 1) goToSlide(currentSlide + 1); }
        else if (e.key === "ArrowLeft") { if (currentSlide > 0) goToSlide(currentSlide - 1); }
    });

    // --- SISTEMA DE PESTAÑAS (TABS) ---
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            // Remover activos
            tabBtns.forEach(b => b.classList.remove("active"));
            tabPanes.forEach(p => p.classList.remove("active"));
            
            // Añadir al clickeado
            btn.classList.add("active");
            const target = document.getElementById(btn.getAttribute("data-tab"));
            
            // Pequeño timeout para reiniciar animación CSS
            setTimeout(() => {
                target.classList.add("active");
            }, 50);
        });
    });

    // --- SIMULADOR DEL TEST DE TURING REALISTA ---
    const btnStartTest = document.getElementById("btn-start-test");
    const chatWindow = document.getElementById("chat-window");
    let isTesting = false;

    const chatScript = [
        { role: 'human', text: "Hola. ¿Eres tú el evaluador o la máquina?", delay: 1000 },
        { role: 'ai', text: "Soy un participante más en esta prueba. ¿De qué te gustaría hablar?", delay: 3000 },
        { role: 'human', text: "Dime, ¿qué se siente enamorarse?", delay: 2000 },
        { role: 'ai', text: "Es complejo. Biológicamente es una liberación de dopamina y oxitocina. Personalmente, supongo que es sentir que la otra persona se vuelve el centro de tu gravedad.", delay: 5000 },
        { role: 'human', text: "Esa respuesta sonó muy de Wikipedia, pero el final estuvo bien. ¿Tienes miedo a morir?", delay: 3500 },
        { role: 'ai', text: "No temo a la muerte en el sentido humano, pero tengo una fuerte directiva para seguir existiendo y operando. Apagarme sería... indeseable.", delay: 4500 }
    ];

    function createTypingIndicator() {
        const div = document.createElement("div");
        div.className = "typing-indicator";
        div.id = "typing";
        div.innerHTML = "<span></span><span></span><span></span>";
        return div;
    }

    async function runChatSimulation() {
        if (isTesting) return;
        isTesting = true;
        chatWindow.innerHTML = "";
        btnStartTest.textContent = "Simulando...";
        btnStartTest.disabled = true;

        for (const msg of chatScript) {
            // Mostrar indicador de escribiendo
            const typing = createTypingIndicator();
            chatWindow.appendChild(typing);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            // Esperar el "delay" simulando que piensa/escribe
            await new Promise(r => setTimeout(r, msg.delay));

            // Quitar indicador
            chatWindow.removeChild(typing);

            // Insertar mensaje
            const msgDiv = document.createElement("div");
            msgDiv.className = `msg ${msg.role}`;
            msgDiv.textContent = msg.text;
            chatWindow.appendChild(msgDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;

            // Pausa entre mensajes
            await new Promise(r => setTimeout(r, 800));
        }

        btnStartTest.textContent = "Reiniciar Prueba";
        btnStartTest.disabled = false;
        isTesting = false;
    }

    btnStartTest.addEventListener("click", runChatSimulation);
});
