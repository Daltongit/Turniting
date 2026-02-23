document.addEventListener('DOMContentLoaded', () => {

    // --- 1. NAVEGACIÓN DE DIAPOSITIVAS ---
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('next-btn');
    const btnPrev = document.getElementById('prev-btn');
    const counter = document.getElementById('current-slide-num');
    let currentSlide = 0;

    function updatePresentation() {
        if (!slides.length) return; // Validación de seguridad
        
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if(index === currentSlide) {
                slide.classList.add('active');
            }
        });
        
        if (counter) counter.innerText = currentSlide + 1;
        
        if (btnPrev) {
            btnPrev.style.opacity = currentSlide === 0 ? "0.3" : "1";
            btnPrev.style.pointerEvents = currentSlide === 0 ? "none" : "auto";
        }
        if (btnNext) {
            btnNext.style.opacity = currentSlide === slides.length - 1 ? "0.3" : "1";
            btnNext.style.pointerEvents = currentSlide === slides.length - 1 ? "none" : "auto";
        }
    }

    if (btnNext) btnNext.addEventListener('click', () => { if(currentSlide < slides.length - 1) { currentSlide++; updatePresentation(); } });
    if (btnPrev) btnPrev.addEventListener('click', () => { if(currentSlide > 0) { currentSlide--; updatePresentation(); } });

    document.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight' || e.key === 'Space') { if(currentSlide < slides.length - 1) { currentSlide++; updatePresentation(); } }
        if(e.key === 'ArrowLeft') { if(currentSlide > 0) { currentSlide--; updatePresentation(); } }
    });

    updatePresentation();

    // --- 2. EFECTO 3D TILT EN TARJETAS (Parallax) ---
    const cards3D = document.querySelectorAll('.3d-card');
    
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -10;
            const rotateY = ((x - centerX) / centerX) * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none';
        });
    });

    // --- 3. SIMULADOR TEST DE TURING ---
    const btnRunSim = document.getElementById('btn-run-sim');
    const chatHistory = document.getElementById('chat-history');
    let simRunning = false;

    // Cambié el nombre de la variable a chatMessages para evitar conflictos
    const chatMessages = [
        { role: 'judge', text: "Juez: Pregunta 1. ¿Si te doy una matriz de 3x3 de ceros, cuál es su determinante?", delay: 800 },
        { role: 'entity', text: "Sujeto B: Cero. Cualquier matriz con una fila o columna de ceros tiene determinante cero. ¿Era una pregunta con trampa?", delay: 3000 },
        { role: 'judge', text: "Juez: Correcto. Pregunta 2. ¿Qué te hace sentir triste?", delay: 2000 },
        { role: 'entity', text: "Sujeto B: Ver a mis seres queridos sufrir y no poder hacer nada para evitarlo. Creo que a todos nos pasa, ¿no?", delay: 4000 },
        { role: 'judge', text: "Juez: Respuesta muy humana. Pausando protocolo...", delay: 2000 }
    ];

    if (btnRunSim && chatHistory) {
        btnRunSim.addEventListener('click', async () => {
            // Si ya está corriendo, ignorar clics para no duplicar
            if(simRunning) return;
            simRunning = true;
            
            // Limpiar chat y actualizar botón
            chatHistory.innerHTML = "";
            btnRunSim.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ejecutando...';

            // Bucle asíncrono
            for (let i = 0; i < chatMessages.length; i++) {
                const msg = chatMessages[i];
                
                // --- Nuevo: Indicador de 'Escribiendo...' ---
                const typingDiv = document.createElement('div');
                typingDiv.className = `msg-bubble ${msg.role}`;
                typingDiv.style.opacity = '0.5';
                typingDiv.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>'; // Icono de 3 puntos animado
                chatHistory.appendChild(typingDiv);
                chatHistory.scrollTop = chatHistory.scrollHeight;

                // Esperar el retraso (simula el tiempo de escritura)
                await new Promise(resolve => setTimeout(resolve, msg.delay));
                
                // Remover el indicador y añadir el texto real
                chatHistory.removeChild(typingDiv);
                const div = document.createElement('div');
                div.className = `msg-bubble ${msg.role}`;
                div.textContent = msg.text;
                chatHistory.appendChild(div);
                chatHistory.scrollTop = chatHistory.scrollHeight;
            }

            // Restaurar estado del botón
            btnRunSim.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Reiniciar Simulación';
            simRunning = false;
        });
    }

    // --- 4. FONDO INTERACTIVO (Network Canvas) ---
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if(this.x < 0 || this.x > width) this.vx *= -1;
                if(this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0, 229, 255, 0.5)';
                ctx.fill();
            }
        }

        for(let i=0; i<80; i++) particles.push(new Particle());

        function animateBg() {
            ctx.clearRect(0, 0, width, height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            for(let i=0; i<particles.length; i++) {
                for(let j=i+1; j<particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    
                    if(dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(0, 229, 255, ${0.2 - dist/600})`;
                        ctx.stroke();
                    }
                }
            }
            requestAnimationFrame(animateBg);
        }
        animateBg();
    }
});
