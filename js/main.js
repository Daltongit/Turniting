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
        { q: "A nivel de software, ¿qué es la IA moderna?", options: ["Una mente consciente", "Modelos probabilísticos que aprenden de datos", "Instrucciones rígidas", "Un cerebro biológico"], a: 1 },
        { q: "¿Qué tipo de IA existe realmente hoy en día?", options: ["IA General (AGI)", "Superinteligencia", "IA Estrecha (ANI)", "IA Consciente"], a: 2 },
        { q: "¿Qué descifró el código Enigma en la 2da Guerra Mundial?", options: ["El Perceptrón", "La máquina Bombe", "Deep Blue", "ENIAC"], a: 1 },
        { q: "En la tupla de Turing, ¿qué representa δ (Delta)?", options: ["Datos de entrada", "Estados finales", "Función de transición (Lógica)", "El alfabeto"], a: 2 },
        { q: "¿Qué evento marcó el nacimiento formal de la IA en 1956?", options: ["El libro de Turing", "La Conferencia de Dartmouth", "La creación de Google", "El test de Turing"], a: 1 },
        { q: "¿Por qué fallaron los Sistemas Expertos de los 80s?", options: ["Eran lentos", "Eran costosos de mantener y de reglas rígidas", "Nadie los usaba", "No había internet"], a: 1 },
        { q: "¿Qué impulsó el boom actual del Deep Learning?", options: ["Mejores teclados", "Big Data y potencia de GPUs", "Suerte", "Nuevos lenguajes"], a: 1 },
        { q: "Las redes convolucionales (CNN) como AlexNet son expertas en:", options: ["Escribir poesía", "Visión artificial (imágenes)", "Música", "Jugar ajedrez"], a: 1 },
        { q: "¿Qué problema ético heredan las IAs?", options: ["Gasto de luz", "Sesgos y prejuicios de los datos de entrenamiento", "Roban wifi", "Se aburren"], a: 1 },
        { q: "¿Qué arquitectura permite a ChatGPT entender contexto?", options: ["Perceptrón", "Transformer", "Sistemas Expertos", "Máquina de Turing"], a: 1 }
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
