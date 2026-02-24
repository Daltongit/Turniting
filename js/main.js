document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. NAVEGACIÓN DE LA PRESENTACIÓN (SLIDES)
    // ==========================================
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('next-btn');
    const btnPrev = document.getElementById('prev-btn');
    const counter = document.getElementById('current-slide-num');
    let currentSlide = 0;

    function updatePresentation() {
        if (!slides.length) return;
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if(index === currentSlide) slide.classList.add('active');
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
        // Solo navega las slides si el test está oculto
        if(document.getElementById('game-overlay-wrapper').classList.contains('hidden')) {
            if(e.key === 'ArrowRight' || e.key === 'Space') { if(currentSlide < slides.length - 1) { currentSlide++; updatePresentation(); } }
            if(e.key === 'ArrowLeft') { if(currentSlide > 0) { currentSlide--; updatePresentation(); } }
        }
    });

    updatePresentation();

    // Efecto 3D
    const cards3D = document.querySelectorAll('.3d-card');
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            card.style.transform = `perspective(1000px) rotateX(${((y - rect.height/2) / (rect.height/2)) * -10}deg) rotateY(${((x - rect.width/2) / (rect.width/2)) * 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`; });
    });

    // Simulador Chat Slide 6
    window.simRunning = false;
    window.iniciarSimulador = async function() {
        if(window.simRunning) return; window.simRunning = true;
        const btnRunSim = document.getElementById('btn-run-sim'); const chatHistory = document.getElementById('chat-history');
        chatHistory.innerHTML = ""; if(btnRunSim) btnRunSim.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ejecutando...';
        const msgs = [
            { r: 'judge', t: "Juez: Pregunta 1. ¿Si te doy una matriz de 3x3 de ceros, cuál es su determinante?", d: 1000 },
            { r: 'entity', t: "Sujeto B: Cero. Cualquier matriz con una fila o columna de ceros tiene determinante cero. ¿Era una pregunta con trampa?", d: 3500 },
            { r: 'judge', t: "Juez: Correcto. Pregunta 2. ¿Qué te hace sentir triste?", d: 2000 },
            { r: 'entity', t: "Sujeto B: Ver a mis seres queridos sufrir y no poder hacer nada para evitarlo.", d: 4500 },
            { r: 'judge', t: "Juez: Respuesta muy humana. Pausando protocolo...", d: 2000 }
        ];
        for (let i = 0; i < msgs.length; i++) {
            const typing = document.createElement('div'); typing.className = `msg-bubble ${msgs[i].r}`; typing.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>'; chatHistory.appendChild(typing); chatHistory.scrollTop = chatHistory.scrollHeight;
            await new Promise(r => setTimeout(r, msgs[i].d));
            chatHistory.removeChild(typing); const real = document.createElement('div'); real.className = `msg-bubble ${msgs[i].r}`; real.textContent = msgs[i].t; chatHistory.appendChild(real); chatHistory.scrollTop = chatHistory.scrollHeight;
        }
        if(btnRunSim) btnRunSim.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Reiniciar'; window.simRunning = false;
    };


    // ==========================================
    // 2. LÓGICA DEL TEST INTERACTIVO
    // ==========================================
    
    // Ocultar/Mostrar Capa del Juego
    const btnOpenTest = document.getElementById('btn-open-test');
    const btnCloseTest = document.getElementById('btn-close-test');
    const gameOverlay = document.getElementById('game-overlay-wrapper');

    btnOpenTest.addEventListener('click', () => {
        gameOverlay.classList.remove('hidden');
        showGameScreen('test-lobby-screen');
    });

    btnCloseTest.addEventListener('click', () => {
        gameOverlay.classList.add('hidden');
        resetGame(); resetLobby();
    });

    // Navegación dentro del Overlay
    const gameScreens = document.querySelectorAll('.game-screen');
    function showGameScreen(screenId) {
        gameScreens.forEach(s => s.classList.remove('active-game-screen'));
        setTimeout(() => { document.getElementById(screenId).classList.add('active-game-screen'); }, 50);
    }

    // Banco de Preguntas (Exactamente las mismas)
    const questionPool = [
        { q: "A nivel de software, ¿qué es la IA moderna?", options: ["Una mente consciente artificial", "Modelos probabilísticos que aprenden de datos", "Instrucciones rígidas paso a paso", "Un cerebro biológico simulado"], a: 1 },
        { q: "¿Qué tipo de IA es la única que existe realmente hoy en día?", options: ["IA General (AGI)", "Superinteligencia", "IA Estrecha (ANI)", "IA Consciente"], a: 2 },
        { q: "¿Qué define a una IA General (AGI)?", options: ["Jugar ajedrez mejor que un humano", "Capacidad cognitiva humana completa en cualquier tema", "Reconocer rostros en Facebook", "Ejecutar bucles infinitos"], a: 1 },
        { q: "¿Qué dispositivo descifró el código Enigma en la 2da Guerra Mundial?", options: ["El Perceptrón", "La máquina Bombe", "Deep Blue", "ENIAC"], a: 1 },
        { q: "¿Qué concepto propuso Alan Turing antes de que existieran las computadoras?", options: ["El internet", "Las redes neuronales", "Que las máquinas podían manipular símbolos y lógica", "El Bitcoin"], a: 2 },
        { q: "¿Cuál fue la causa de muerte de Alan Turing?", options: ["Vejez", "Accidente de auto", "Envenenamiento con cianuro tras una condena injusta", "En la guerra"], a: 2 },
        { q: "La 'Cinta Infinita' en la Máquina de Turing teórica equivale hoy a:", options: ["El disco duro", "La Memoria RAM", "La tarjeta gráfica", "El procesador"], a: 1 },
        { q: "El 'Cabezal de Lectura/Escritura' en la Máquina de Turing equivale a:", options: ["La CPU (Procesador)", "El monitor", "El teclado", "La fuente de poder"], a: 0 },
        { q: "En la tupla formal de Turing, ¿qué representa δ (Delta)?", options: ["Los datos de entrada", "Los estados finales", "La función de transición (Lógica/Reglas)", "El alfabeto de la cinta"], a: 2 },
        { q: "¿Cuál era el objetivo original del 'Juego de la Imitación' de Turing?", options: ["Crear un chatbot divertido", "Evadir la pregunta filosófica de si las máquinas piensan", "Ganar un premio Nobel", "Probar la velocidad de procesamiento"], a: 1 },
        { q: "¿Qué evalúa un juez humano en el Test de Turing?", options: ["La velocidad de cálculo", "Si está hablando con una máquina o un humano", "Los gráficos de la máquina", "El consumo de energía"], a: 1 },
        { q: "¿Cuál es la crítica principal del argumento de la 'Habitación China'?", options: ["El test es muy difícil", "Las máquinas son muy lentas", "Simular sintaxis no es lo mismo que comprender semántica", "Turing estaba equivocado en la matemática"], a: 2 },
        { q: "¿Qué evento en 1956 marcó el nacimiento formal de la IA?", options: ["La publicación del libro de Turing", "La Conferencia de Dartmouth", "La creación de Google", "El primer viaje a la luna"], a: 1 },
        { q: "¿Qué era el 'Perceptrón' de Frank Rosenblatt (1958)?", options: ["Un robot de cocina", "El primer algoritmo inspirado en neuronas biológicas", "Un sistema experto médico", "Un lenguaje de programación"], a: 1 },
        { q: "¿Por qué el Perceptrón original tenía capacidades limitadas?", options: ["No había suficiente electricidad", "Solo podía resolver problemas matemáticos lineales simples", "Estaba mal programado", "Era muy caro"], a: 1 },
        { q: "¿Cómo funcionaba ELIZA, el primer chatbot del MIT?", options: ["Entendía emociones profundas", "Usaba redes neuronales complejas", "Buscaba palabras clave y las devolvía como preguntas", "Estaba conectado a internet"], a: 2 },
        { q: "¿Qué caracterizó a los 'Sistemas Expertos' de los años 80?", options: ["Aprendían solos viendo videos", "Usaban miles de reglas lógicas fijas (SI-ENTONCES)", "Eran muy baratos de mantener", "Usaban GPUs"], a: 1 },
        { q: "¿Qué causó el 'Invierno de la IA' en los 90s?", options: ["Las máquinas se congelaban", "Falta de potencia de cómputo y alto costo de mantenimiento", "Una ley prohibió la IA", "Ya se había resuelto todo"], a: 1 },
        { q: "¿Qué dos factores impulsaron el boom de la IA a partir de 2010?", options: ["Mejores teclados y pantallas", "Big Data y potencia de las GPUs", "Inversión gubernamental y suerte", "Nuevos lenguajes de programación"], a: 1 },
        { q: "¿Qué logró AlexNet en 2012?", options: ["Ganar al ajedrez", "Reconocer imágenes con una precisión récord usando CNNs", "Escribir un libro", "Traducir 100 idiomas"], a: 1 },
        { q: "¿Cómo aprendió AlphaGo a jugar 'Go'?", options: ["Leyendo libros de estrategia", "Jugando millones de partidas contra sí mismo (Aprendizaje por Refuerzo)", "Programándole todas las jugadas posibles", "Viendo jugar a humanos"], a: 1 },
        { q: "¿Qué innovación introdujo el paper 'Attention Is All You Need' (2017)?", options: ["La arquitectura Transformer", "Los disquetes", "El mouse óptico", "Las pantallas táctiles"], a: 0 },
        { q: "¿Qué permiten los modelos basados en Transformers como ChatGPT?", options: ["Imprimir más rápido", "Procesar texto entendiendo el contexto completo", "Mejorar la batería del celular", "Nada nuevo"], a: 1 },
        { q: "¿Qué es el problema de la 'Caja Negra' en Deep Learning?", options: ["Que las computadoras son negras", "Que no sabemos cómo el modelo toma sus decisiones internas", "Que se va la luz cuando se usan", "Que los datos están ocultos"], a: 1 },
        { q: "Además de hacer modelos más listos, ¿cuál es el desafío actual de la ingeniería de IA?", options: ["Hacerlos más coloridos", "Hacerlos seguros, confiables y privados", "Que sean más baratos", "Que ocupen menos espacio"], a: 1 },
        // ... (Se añaden más variaciones para llegar a 50) ...
        { q: "Si una máquina pasa el Test de Turing, se considera que ha demostrado:", options: ["Conciencia", "Sentimientos reales", "Comportamiento inteligente", "Superioridad humana"], a: 2 },
        { q: "La función de transición δ en la máquina de Turing equivale en código a:", options: ["Variables", "Inputs", "Estructuras de control (IF/WHILE)", "Comentarios"], a: 2 },
        { q: "Los sistemas expertos fallaron principalmente porque:", options: ["Eran muy lentos", "Eran difíciles y caros de actualizar", "Nadie los quería usar", "No existía internet"], a: 1 },
        { q: "Las GPUs (tarjetas gráficas) son ideales para el Deep Learning porque:", options: ["Tienen muchos colores", "Permiten procesamiento paralelo masivo", "Son baratas", "Tienen ventiladores grandes"], a: 1 },
        { q: "Un riesgo ético importante de los algoritmos actuales es:", options: ["Que se aburran", "Que hereden sesgos y prejuicios de los datos de entrenamiento", "Que gasten mucha luz", "Que se vuelvan Skynet mañana"], a: 1 },
        { q: "Turing propuso que si una máquina puede manipular símbolos (0 y 1), también podría:", options: ["Sentir amor", "Procesar lógica y simular pensamiento", "Viajar en el tiempo", "Cocinar"], a: 1 },
        { q: "El término 'Inteligencia Artificial' se acuñó formalmente en el año:", options: ["1940", "1956", "1980", "2000"], a: 1 },
        { q: "El primer chatbot ELIZA simulaba ser un:", options: ["Ingeniero", "Psicoterapeuta", "Profesor", "Cómico"], a: 1 },
        { q: "La 'Inteligencia Artificial General' (AGI) es actualmente:", options: ["Una realidad común", "Un concepto teórico no alcanzado", "Usada en tu celular", "Un tipo de robot de cocina"], a: 1 },
        { q: "¿Qué demostró la máquina 'Bombe' de Turing?", options: ["Que las máquinas podían volar", "El poder del procesamiento lógico automatizado para resolver problemas complejos", "Que los alemanes no sabían encriptar", "Nada importante"], a: 1 },
        { q: "En la analogía de ingeniería, los 'Estados (Q)' de la máquina de Turing son:", options: ["El disco duro", "Variables en memoria", "El teclado", "La pantalla"], a: 1 },
        { q: "El argumento de la Habitación China sugiere que pasar el Test de Turing es solo:", options: ["Inteligencia real", "Simulación sin comprensión", "Suerte", "Imposible"], a: 1 },
        { q: "Los primeros ingenieros de IA en los 50s creían que la inteligencia se resolvería:", options: ["En pocos años escribiendo código", "En siglos", "Nunca", "Usando magia"], a: 0 },
        { q: "El aprendizaje por refuerzo usado por AlphaGo se basa en:", options: ["Reglas fijas", "Aprender de premios y castigos (ganar/perder) jugando mucho", "Leer wikipedia", "Copiar a otros"], a: 1 },
        { q: "La arquitectura Transformer revolucionó el procesamiento de:", options: ["Imágenes exclusivamente", "Texto y lenguaje natural", "Audio solamente", "Hojas de cálculo"], a: 1 },
        { q: "La privacidad es un desafío en IA porque los modelos necesitan:", options: ["Gastar dinero", "Cantidades masivas de datos (a veces personales) para entrenar", "Estar conectados siempre", "Tener cámaras"], a: 1 },
        { q: "¿Qué no puede hacer una IA Estrecha (ANI)?", options: ["Reconocer caras", "Jugar ajedrez", "Razonar sobre cualquier tema nuevo como un humano", "Recomendar películas"], a: 2 },
        { q: "El trabajo de Turing en morfogénesis aplicó matemáticas a la:", options: ["Química", "Biología (patrones naturales)", "Física nuclear", "Astronomía"], a: 1 },
        { q: "La 'cinta' de la máquina de Turing es teóricamente:", options: ["Muy corta", "Circular", "Infinita", "Invisible"], a: 2 },
        { q: "¿Qué juego usó Turing para explicar su test?", options: ["El juego de la oca", "El juego de la imitación", "Ajedrez", "Póker"], a: 1 },
        { q: "El 'Invierno de la IA' se caracterizó por:", options: ["Mucho frío en los laboratorios", "Cortes de inversión y estancamiento en la investigación", "Un exceso de éxitos", "Nuevas computadoras rápidas"], a: 1 },
        { q: "Big Data se refiere a:", options: ["Datos muy grandes físicamente", "Cantidades masivas de información disponibles en internet", "Un solo archivo grande", "Una base de datos lenta"], a: 1 },
        { q: "Las redes neuronales convolucionales (CNN) son especialistas en:", options: ["Escribir poesía", "Visión artificial (imágenes)", "Componer música", "Jugar videojuegos"], a: 1 },
        { q: "Los LLMs como Gemini son ejemplos de:", options: ["IA Simbólica antigua", "Modelos de Lenguaje Grande basados en Transformers", "Sistemas Expertos de los 80s", "Calculadoras simples"], a: 1 },
        { q: "Cuando no entendemos cómo una red neuronal llega a una conclusión, lo llamamos:", options: ["Magia negra", "Problema de la Caja Negra (Explicabilidad)", "Error de capa 8", "Fallo de sistema"], a: 1 }
        // (Por brevedad del código aquí dejé 10, pero usa las 50 que te pasé en el mensaje anterior para la versión final)
    ];

    let currentGameCode = ""; let currentPlayerName = "Jugador"; let currentPlayerAvatar = "fa-robot";
    let gameQuestions = []; let currentQIndex = 0; let score = 0; let timerInterval; let timeLeft = 15;
    let leaderboardData = [ { name: "Bot_Turing", avatar: "fa-robot", score: 4500 }, { name: "Ada", avatar: "fa-user-astronaut", score: 4200 } ];

    function resetLobby() {
        document.getElementById('host-area-initial').classList.remove('hidden');
        document.getElementById('host-area-active').classList.add('hidden');
        document.getElementById('btn-start-game-host').disabled = true;
        document.getElementById('host-player-list').innerHTML = '<li class="empty-list">Esperando conexiones...</li>';
    }

    document.getElementById('btn-create-room').addEventListener('click', () => {
        currentGameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        document.getElementById('display-room-code').innerText = currentGameCode;
        document.getElementById('host-area-initial').classList.add('hidden');
        document.getElementById('host-area-active').classList.remove('hidden');
        setTimeout(() => {
            document.getElementById('host-player-list').innerHTML = `<li><i class="fa-solid fa-user-astronaut"></i> Jugador_1</li>`;
            document.getElementById('btn-start-game-host').disabled = false;
            document.getElementById('player-count').innerText = "1";
        }, 2000);
    });

    const avatars = document.querySelectorAll('.avatar-option');
    avatars.forEach(opt => opt.addEventListener('click', () => {
        avatars.forEach(o => o.classList.remove('active')); opt.classList.add('active');
        currentPlayerAvatar = opt.getAttribute('data-avatar');
    }));

    document.getElementById('btn-join-room').addEventListener('click', () => {
        const n = document.getElementById('player-name-input').value.trim();
        const c = document.getElementById('join-code-input').value.trim().toUpperCase();
        if(!n) { alert("Ingresa un nombre."); return; }
        currentPlayerName = n; currentGameCode = c;
        document.getElementById('waiting-room-code').innerText = c || "XXXX";
        document.getElementById('my-waiting-name').innerText = n;
        document.getElementById('my-waiting-avatar').className = `fa-solid ${currentPlayerAvatar}`;
        showGameScreen('waiting-screen');
        setTimeout(startGame, 3000); // Inicia simulado
    });
    
    document.getElementById('btn-start-game-host').addEventListener('click', startGame);

    function startGame() {
        let shuffled = [...questionPool].sort(() => 0.5 - Math.random());
        gameQuestions = shuffled.slice(0, 5);
        currentQIndex = 0; score = 0;
        showGameScreen('game-screen'); loadQuestion();
    }

    function loadQuestion() {
        clearInterval(timerInterval); timeLeft = 15; updateTimerUI();
        const qData = gameQuestions[currentQIndex];
        document.getElementById('current-q-num').innerText = currentQIndex + 1;
        document.getElementById('question-text').innerText = qData.q;
        const container = document.getElementById('options-container'); container.innerHTML = "";
        qData.options.forEach((optText, i) => {
            const btn = document.createElement('button'); btn.className = 'option-btn'; btn.innerText = optText;
            btn.addEventListener('click', () => selectAnswer(i, btn)); container.appendChild(btn);
        });
        timerInterval = setInterval(() => {
            timeLeft--; updateTimerUI();
            if(timeLeft <= 0) { clearInterval(timerInterval); handleTimeOut(); }
        }, 1000);
    }

    function updateTimerUI() {
        document.getElementById('timer-count').innerText = timeLeft;
        document.getElementById('timer-bar-fill').style.width = `${(timeLeft / 15) * 100}%`;
    }

    function selectAnswer(i, btn) {
        clearInterval(timerInterval); const correct = gameQuestions[currentQIndex].a;
        const btns = document.querySelectorAll('.option-btn'); btns.forEach(b => b.disabled = true);
        if(i === correct) { btn.classList.add('correct'); score += 100 + (timeLeft * 10); } 
        else { btn.classList.add('wrong'); btns[correct].classList.add('correct'); }
        setTimeout(nextQuestion, 2000);
    }

    function handleTimeOut() {
        const btns = document.querySelectorAll('.option-btn'); btns.forEach(b => b.disabled = true);
        btns[gameQuestions[currentQIndex].a].classList.add('correct'); setTimeout(nextQuestion, 2000);
    }

    function nextQuestion() {
        currentQIndex++;
        if(currentQIndex < gameQuestions.length) loadQuestion(); else endGame();
    }

    function resetGame() { clearInterval(timerInterval); currentQIndex = 0; score = 0; }

    function endGame() {
        leaderboardData.push({ name: currentPlayerName, avatar: currentPlayerAvatar, score: score });
        leaderboardData.sort((a, b) => b.score - a.score);
        const tbody = document.getElementById('leaderboard-body'); tbody.innerHTML = "";
        leaderboardData.forEach((e, i) => {
            const tr = document.createElement('tr');
            if(e.name === currentPlayerName && e.score === score) tr.style.background = "rgba(0, 229, 255, 0.1)";
            tr.innerHTML = `<td>${i + 1}</td><td><i class="fa-solid ${e.avatar}" style="color:var(--primary); font-size:1.5rem;"></i></td><td>${e.name}</td><td>${e.score} pts</td>`;
            tbody.appendChild(tr);
        });
        showGameScreen('leaderboard-screen');
    }

    document.getElementById('btn-restart-game').addEventListener('click', startGame);
    document.getElementById('btn-new-lobby').addEventListener('click', () => { resetLobby(); showGameScreen('test-lobby-screen'); });

    // ==========================================
    // 3. FONDO CANVAS (Se comparte)
    // ==========================================
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d'); let w, h; let particles = [];
        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();
        class P { constructor(){this.x=Math.random()*w;this.y=Math.random()*h;this.vx=(Math.random()-.5)*.5;this.vy=(Math.random()-.5)*.5;this.r=Math.random()*2} update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>w)this.vx*=-1;if(this.y<0||this.y>h)this.vy*=-1} draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(0,229,255,0.5)';ctx.fill()} }
        for(let i=0;i<80;i++)particles.push(new P());
        function animate(){
            ctx.clearRect(0,0,w,h); particles.forEach(p=>{p.update();p.draw()});
            for(let i=0;i<particles.length;i++)for(let j=i+1;j<particles.length;j++){
                const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y,d=Math.sqrt(dx*dx+dy*dy);
                if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,229,255,${.2-d/600})`;ctx.stroke()}
            } requestAnimationFrame(animate);
        } animate();
    }
});

