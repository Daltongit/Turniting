document.addEventListener('DOMContentLoaded', () => {

    try {
        // ==========================================
        // 1. NAVEGACIÓN DE DIAPOSITIVAS Y FLECHAS
        // ==========================================
        const slides = document.querySelectorAll('.slide');
        const btnNext = document.getElementById('next-btn');
        const btnPrev = document.getElementById('prev-btn');
        const counter = document.getElementById('current-slide-num');
        let currentSlide = 0;

        function updateSlides() {
            if (!slides.length) return;
            
            // Ocultar todas y mostrar la actual
            slides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (index === currentSlide) slide.classList.add('active');
            });
            
            // Actualizar texto del contador sin que se rompa
            if (counter) {
                counter.innerText = (currentSlide + 1) + " / " + slides.length;
            }
            
            // Opacidad de botones
            if (btnPrev) {
                btnPrev.style.opacity = currentSlide === 0 ? "0.3" : "1";
            }
            if (btnNext) {
                btnNext.style.opacity = currentSlide === slides.length - 1 ? "0.3" : "1";
            }
        }

        // EVENTOS DE LOS BOTONES INFERIORES (FLECHAS)
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (currentSlide < slides.length - 1) { currentSlide++; updateSlides(); }
            });
        }
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentSlide > 0) { currentSlide--; updateSlides(); }
            });
        }

        // FLECHAS DEL TECLADO
        document.addEventListener('keydown', (e) => {
            const overlay = document.getElementById('game-overlay-wrapper');
            // Solo avanza si el test está cerrado
            if (!overlay || overlay.classList.contains('hidden')) {
                if (e.key === 'ArrowRight' || e.key === 'Space') { 
                    if (currentSlide < slides.length - 1) { currentSlide++; updateSlides(); } 
                }
                if (e.key === 'ArrowLeft') { 
                    if (currentSlide > 0) { currentSlide--; updateSlides(); } 
                }
            }
        });

        // Iniciar estado
        updateSlides();


        // ==========================================
        // 2. SIMULADOR DEL CHAT (Slide 6)
        // ==========================================
        const btnRunSim = document.getElementById('btn-run-sim');
        let simRunning = false;

        if (btnRunSim) {
            btnRunSim.addEventListener('click', async () => {
                if (simRunning) return; 
                simRunning = true;
                
                const chatHistory = document.getElementById('chat-history');
                if (!chatHistory) return;

                chatHistory.innerHTML = ""; 
                btnRunSim.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ejecutando...';
                
                const msgs = [
                    { r: 'judge', t: "Juez: Pregunta 1. ¿Si te doy una matriz de 3x3 de ceros, cuál es su determinante?", d: 1000 },
                    { r: 'entity', t: "Sujeto B: Cero. Cualquier matriz con una fila o columna de ceros tiene determinante cero. ¿Era una trampa?", d: 3500 },
                    { r: 'judge', t: "Juez: Correcto. Pregunta 2. ¿Qué te hace sentir triste?", d: 2000 },
                    { r: 'entity', t: "Sujeto B: Ver a mis seres queridos sufrir y no poder evitarlo.", d: 4500 },
                    { r: 'judge', t: "Juez: Respuesta muy humana. Pausando protocolo...", d: 2000 }
                ];
                
                for (let i = 0; i < msgs.length; i++) {
                    const typing = document.createElement('div'); 
                    typing.className = `msg-bubble ${msgs[i].r}`; 
                    typing.innerHTML = '<i class="fa-solid fa-ellipsis fa-fade"></i>'; 
                    chatHistory.appendChild(typing); 
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                    
                    await new Promise(resolve => setTimeout(resolve, msgs[i].d));
                    
                    chatHistory.removeChild(typing); 
                    const real = document.createElement('div'); 
                    real.className = `msg-bubble ${msgs[i].r}`; 
                    real.textContent = msgs[i].t; 
                    chatHistory.appendChild(real); 
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }
                btnRunSim.innerHTML = '<i class="fa-solid fa-play"></i> EJECUTAR SIMULACIÓN'; 
                simRunning = false;
            });
        }


        // ==========================================
        // 3. ABRIR Y CERRAR EL TEST INTERACTIVO
        // ==========================================
        const btnOpenTest = document.getElementById('btn-open-test');
        const btnCloseTest = document.getElementById('btn-close-test');
        const gameOverlay = document.getElementById('game-overlay-wrapper');

        function showGameScreen(screenId) {
            const gameScreens = document.querySelectorAll('.game-screen');
            gameScreens.forEach(s => s.classList.remove('active-game-screen'));
            setTimeout(() => { 
                const target = document.getElementById(screenId);
                if(target) target.classList.add('active-game-screen'); 
            }, 50);
        }

        if (btnOpenTest) {
            btnOpenTest.addEventListener('click', () => {
                if(gameOverlay) {
                    gameOverlay.classList.remove('hidden');
                    showGameScreen('test-lobby-screen');
                }
            });
        }

        if (btnCloseTest) {
            btnCloseTest.addEventListener('click', () => {
                if(gameOverlay) gameOverlay.classList.add('hidden');
                resetGame(); 
                resetLobby();
            });
        }


        // ==========================================
        // 4. LÓGICA DEL JUEGO (LOBBY Y PREGUNTAS)
        // ==========================================
        const questionPool = [
            { q: "A nivel de software, ¿qué es la IA moderna?", options: ["Una mente consciente artificial", "Modelos probabilísticos que aprenden de datos", "Instrucciones rígidas paso a paso", "Un cerebro biológico simulado"], a: 1 },
            { q: "¿Qué tipo de IA es la única que existe realmente hoy en día?", options: ["IA General (AGI)", "Superinteligencia", "IA Estrecha (ANI)", "IA Consciente"], a: 2 },
            { q: "¿Qué define a una IA General (AGI)?", options: ["Jugar ajedrez", "Capacidad cognitiva humana completa", "Reconocer rostros", "Crear videos"], a: 1 },
            { q: "¿Qué dispositivo descifró el código Enigma en la 2da Guerra Mundial?", options: ["El Perceptrón", "La máquina Bombe", "Deep Blue", "ENIAC"], a: 1 },
            { q: "¿Qué propuso Alan Turing sobre las máquinas?", options: ["Que tendrían sentimientos", "Que podían manipular símbolos y procesar lógica", "Que volarían", "Que destruirían el mundo"], a: 1 },
            { q: "La 'Cinta Infinita' en la Máquina de Turing equivale hoy a:", options: ["El disco duro", "La Memoria RAM", "La tarjeta gráfica", "El procesador"], a: 1 },
            { q: "El 'Cabezal de Lectura/Escritura' equivale a:", options: ["La CPU", "El monitor", "El teclado", "La fuente de poder"], a: 0 },
            { q: "En la tupla de Turing, ¿qué representa δ (Delta)?", options: ["Los datos", "Los estados", "La función de transición (Lógica IF/ELSE)", "El alfabeto"], a: 2 },
            { q: "¿Cuál era el objetivo del 'Juego de la Imitación'?", options: ["Un juego de mesa", "Evadir la pregunta de si las máquinas piensan", "Aprender a escribir", "Vender computadoras"], a: 1 },
            { q: "¿Qué se evalúa en el Test de Turing?", options: ["La velocidad de internet", "Si un evaluador puede distinguir a la máquina de un humano", "El consumo eléctrico", "La memoria"], a: 1 },
            { q: "¿Cuál es la crítica de la 'Habitación China'?", options: ["Las máquinas son lentas", "Simular respuestas perfectas no significa comprenderlas", "El chino es muy difícil", "Turing se equivocó"], a: 1 },
            { q: "¿Qué evento en 1956 bautizó a la IA?", options: ["Lanzamiento de Apple", "La Conferencia de Dartmouth", "Fin de la guerra", "Lanzamiento de Windows"], a: 1 },
            { q: "¿Qué era el 'Perceptrón' (1958)?", options: ["Un robot", "Algoritmo inspirado en neuronas biológicas", "Un antivirus", "Una supercomputadora"], a: 1 },
            { q: "¿Cómo funcionaba ELIZA, el primer chatbot?", options: ["Tenía conciencia", "Buscaba palabras clave y devolvía preguntas", "Estaba conectado a Google", "Hablaba por voz"], a: 1 },
            { q: "¿Qué caracterizó a los 'Sistemas Expertos' de los 80s?", options: ["Aprendían viendo videos", "Tenían miles de reglas fijas (SI pasa A, ENTONCES B)", "Eran baratos", "Usaban GPUs"], a: 1 },
            { q: "¿Por qué ocurrió el 'Invierno de la IA'?", options: ["Costos altos de mantenimiento y falta de potencia computacional", "Un virus mundial", "Falta de electricidad", "Nadie quería usarla"], a: 0 },
            { q: "¿Qué dos factores impulsaron el boom actual del Deep Learning?", options: ["Fibra óptica y teclados", "Big Data (Datos masivos) y potencia de las GPUs", "Satélites", "Nuevos lenguajes"], a: 1 },
            { q: "¿Qué logró la red neuronal AlexNet en 2012?", options: ["Jugar póker", "Reconocer imágenes con precisión récord", "Traducir textos", "Manejar un auto"], a: 1 },
            { q: "¿Cómo aprendió AlphaGo a jugar 'Go'?", options: ["Leyendo libros", "Jugando millones de partidas contra sí mismo", "Hackeando", "Con reglas fijas"], a: 1 },
            { q: "¿Qué innovación introdujo el paper 'Attention Is All You Need'?", options: ["La arquitectura Transformer", "Las memorias USB", "Pantallas 4K", "Procesadores cuánticos"], a: 0 },
            { q: "¿Qué permiten hacer los Transformers (como Gemini)?", options: ["Imprimir en 3D", "Procesar texto entendiendo todo el contexto de una frase", "Ahorrar batería", "Minería de Bitcoin"], a: 1 },
            { q: "¿Qué es el problema de la 'Caja Negra' en IA?", options: ["Falla de hardware", "Que el proceso de decisión de la red neuronal es incomprensible", "La computadora se apaga", "Pérdida de datos"], a: 1 },
            { q: "¿Cuál es un gran desafío actual en ingeniería de IA?", options: ["Hacerla más rápida", "Que hereda sesgos de los datos y necesita auditoría", "El tamaño del código", "Que hable más fuerte"], a: 1 },
            { q: "Alan Turing murió en el año:", options: ["1980", "1954", "2000", "1945"], a: 1 },
            { q: "La máquina Bombe fue crucial en la:", options: ["1ra Guerra Mundial", "Guerra Fría", "2da Guerra Mundial", "Guerra de Vietnam"], a: 2 },
            { q: "La cinta de la máquina de Turing se consideraba:", options: ["Corta", "Infinita", "Circular", "Virtual"], a: 1 },
            { q: "En la máquina de Turing, Q representa:", options: ["Queso", "Quantums", "Variables de estado", "Velocidad"], a: 2 },
            { q: "El test de Turing originalmente se probaba mediante:", options: ["Voz", "Texto escrito", "Video", "Presencialmente"], a: 1 },
            { q: "El optimismo sobre la IA ocurrió principalmente en:", options: ["1990-2000", "Años 50s y 60s", "2010-2020", "1920-1930"], a: 1 },
            { q: "Marvin Minsky y John McCarthy fueron figuras clave en:", options: ["La creación de Apple", "La Conferencia de Dartmouth", "La Máquina de Turing", "AlphaGo"], a: 1 },
            { q: "El algoritmo del Perceptrón estaba limitado a:", options: ["Problemas matemáticos complejos", "Problemas lineales muy simples", "Procesar videos", "Generar imágenes"], a: 1 },
            { q: "El primer invierno de la IA fue causado por:", options: ["Expectativas irreales y límites de hardware", "Falta de interés", "Leyes del gobierno", "Internet lento"], a: 0 },
            { q: "Los Sistemas Expertos se usaron mucho en:", options: ["Videojuegos", "Medicina y empresas corporativas", "Celulares", "Autos autónomos"], a: 1 },
            { q: "El entrenamiento de AlphaGo se conoce como:", options: ["Aprendizaje Supervisado", "Aprendizaje por Refuerzo", "Programación Lineal", "Sistemas Expertos"], a: 1 },
            { q: "Las siglas LLM significan:", options: ["Large Language Model", "Low Level Machine", "Logic Language Method", "Linear Logic Model"], a: 0 },
            { q: "El Deep Learning está basado en:", options: ["Reglas SI/ENTONCES", "Redes Neuronales Profundas (Múltiples capas)", "Árboles de decisión", "Bases de datos relacionales"], a: 1 },
            { q: "El principal combustible del Deep Learning es:", options: ["El código", "Big Data", "Las pantallas", "Los algoritmos simples"], a: 1 },
            { q: "Una GPU es mejor para IA que una CPU porque:", options: ["Es más barata", "Permite cálculos matemáticos paralelos masivos", "Es más pequeña", "Usa menos luz"], a: 1 },
            { q: "¿Qué pasa si entrenamos una IA con datos racistas?", options: ["Se rompe", "La IA será racista (hereda el sesgo)", "Los ignora", "Los borra"], a: 1 },
            { q: "¿Quién propuso el argumento de la Habitación China?", options: ["Alan Turing", "John Searle", "Bill Gates", "Elon Musk"], a: 1 },
            { q: "El modelo matemático de la máquina de Turing tiene:", options: ["5 elementos", "7 elementos (tupla)", "3 elementos", "10 elementos"], a: 1 },
            { q: "En Turing, Σ (Sigma) representa:", options: ["El resultado", "La cinta", "Los inputs/entradas", "La memoria"], a: 2 },
            { q: "El Perceptrón fue inventado por:", options: ["Turing", "Frank Rosenblatt", "McCarthy", "Hinton"], a: 1 },
            { q: "El chatbot ELIZA fue desarrollado en:", options: ["Google", "Stanford", "MIT", "Harvard"], a: 2 },
            { q: "AlexNet revolucionó el campo de la:", options: ["Visión Artificial", "Música generativa", "Robótica", "Traducción"], a: 0 },
            { q: "La arquitectura que superó la lectura secuencial de texto es:", options: ["Perceptrón", "Transformer", "CNN", "RNN"], a: 1 },
            { q: "El problema de la explicabilidad exige modelos que sean:", options: ["Más rápidos", "Auditables y transparentes", "Más baratos", "Coloridos"], a: 1 },
            { q: "El concepto de AGI busca igualar:", options: ["A una calculadora", "La inteligencia general de un ser humano", "A un insecto", "A un auto"], a: 1 },
            { q: "El juego de la imitación se jugaba con:", options: ["Un humano y una máquina", "Dos máquinas", "Tres humanos", "Solo humanos"], a: 0 },
            { q: "¿Por qué el software clásico no es IA?", options: ["Porque usa reglas estrictas y no aprende de datos", "Porque es muy viejo", "Porque no usa internet", "Porque es gratis"], a: 0 }
        ];

        let currentGameCode = ""; let currentPlayerName = ""; let currentPlayerAvatar = "fa-robot";
        let gameQuestions = []; let currentQIndex = 0; let score = 0; let timerInterval; let timeLeft = 15;
        let leaderboardData = [ { name: "Bot_Turing", avatar: "fa-user-astronaut", score: 850 } ];

        function resetLobby() {
            const hInit = document.getElementById('host-area-initial');
            const hAct = document.getElementById('host-area-active');
            const btnStart = document.getElementById('btn-start-game-host');
            const hList = document.getElementById('host-player-list');
            const pName = document.getElementById('player-name-input');
            
            if(hInit) hInit.classList.remove('hidden');
            if(hAct) hAct.classList.add('hidden');
            if(btnStart) btnStart.disabled = true;
            if(hList) hList.innerHTML = '<li class="empty-list">Esperando conexiones...</li>';
            if(pName) pName.value = "";
        }

        function resetGame() { 
            clearInterval(timerInterval); 
            currentQIndex = 0; 
            score = 0; 
        }

        const btnCreateRoom = document.getElementById('btn-create-room');
        if(btnCreateRoom) {
            btnCreateRoom.addEventListener('click', () => {
                currentGameCode = Math.random().toString(36).substring(2, 6).toUpperCase();
                document.getElementById('display-room-code').innerText = currentGameCode;
                document.getElementById('host-area-initial').classList.add('hidden');
                document.getElementById('host-area-active').classList.remove('hidden');
                
                setTimeout(() => {
                    document.getElementById('host-player-list').innerHTML = `<li><i class="fa-solid fa-user-astronaut"></i> Estudiante_UPEC</li>`;
                    document.getElementById('btn-start-game-host').disabled = false;
                    document.getElementById('player-count').innerText = "1";
                }, 2000);
            });
        }

        const avatars = document.querySelectorAll('.avatar-option');
        avatars.forEach(opt => opt.addEventListener('click', () => {
            avatars.forEach(o => o.classList.remove('active')); 
            opt.classList.add('active');
            currentPlayerAvatar = opt.getAttribute('data-avatar');
        }));

        const btnJoin = document.getElementById('btn-join-room');
        if(btnJoin) {
            btnJoin.addEventListener('click', () => {
                const n = document.getElementById('player-name-input').value.trim();
                const c = document.getElementById('join-code-input').value.trim().toUpperCase();
                if(!n) { alert("¡Pon un nombre de usuario primero!"); return; }
                
                currentPlayerName = n; 
                currentGameCode = c;
                
                document.getElementById('waiting-room-code').innerText = c || "UPEC";
                document.getElementById('my-waiting-name').innerText = n;
                document.getElementById('my-waiting-avatar').className = `fa-solid ${currentPlayerAvatar}`;
                
                showGameScreen('waiting-screen');
                setTimeout(startGame, 3000); 
            });
        }
        
        const btnStartHost = document.getElementById('btn-start-game-host');
        if(btnStartHost) btnStartHost.addEventListener('click', startGame);

        function startGame() {
            let shuffled = [...questionPool].sort(() => 0.5 - Math.random());
            gameQuestions = shuffled.slice(0, 5);
            currentQIndex = 0; 
            score = 0;
            showGameScreen('game-screen'); 
            loadQuestion();
        }

        function loadQuestion() {
            clearInterval(timerInterval); timeLeft = 15; updateTimerUI();
            
            const qData = gameQuestions[currentQIndex];
            document.getElementById('current-q-num').innerText = currentQIndex + 1;
            document.getElementById('question-text').innerText = qData.q;
            
            const container = document.getElementById('options-container'); 
            container.innerHTML = "";
            
            qData.options.forEach((optText, i) => {
                const btn = document.createElement('button'); 
                btn.className = 'option-btn'; 
                btn.innerText = optText;
                btn.addEventListener('click', () => selectAnswer(i, btn)); 
                container.appendChild(btn);
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
            clearInterval(timerInterval); 
            const correct = gameQuestions[currentQIndex].a;
            const btns = document.querySelectorAll('.option-btn'); 
            btns.forEach(b => b.disabled = true);
            
            if(i === correct) { 
                btn.classList.add('correct'); 
                score += 100 + (timeLeft * 10); 
            } else { 
                btn.classList.add('wrong'); 
                btns[correct].classList.add('correct'); 
            }
            setTimeout(nextQuestion, 2000);
        }

        function handleTimeOut() {
            const btns = document.querySelectorAll('.option-btn'); 
            btns.forEach(b => b.disabled = true);
            btns[gameQuestions[currentQIndex].a].classList.add('correct'); 
            setTimeout(nextQuestion, 2000);
        }

        function nextQuestion() {
            currentQIndex++;
            if(currentQIndex < gameQuestions.length) loadQuestion(); else endGame();
        }

        function endGame() {
            leaderboardData.push({ name: currentPlayerName, avatar: currentPlayerAvatar, score: score });
            leaderboardData.sort((a, b) => b.score - a.score);
            
            const tbody = document.getElementById('leaderboard-body'); 
            tbody.innerHTML = "";
            
            leaderboardData.forEach((e, i) => {
                const tr = document.createElement('tr');
                if(e.name === currentPlayerName && e.score === score) tr.style.background = "rgba(0, 229, 255, 0.1)";
                tr.innerHTML = `<td>${i + 1}</td><td><i class="fa-solid ${e.avatar}" style="color:var(--primary); font-size:1.5rem;"></i></td><td>${e.name}</td><td>${e.score} pts</td>`;
                tbody.appendChild(tr);
            });
            showGameScreen('leaderboard-screen');
        }

        const btnRestart = document.getElementById('btn-restart-game');
        if(btnRestart) btnRestart.addEventListener('click', startGame);
        
        const btnNewLobby = document.getElementById('btn-new-lobby');
        if(btnNewLobby) btnNewLobby.addEventListener('click', () => { 
            resetLobby(); 
            showGameScreen('test-lobby-screen'); 
        });

        // ==========================================
        // 5. FONDO CANVAS DE RED NEURONAL
        // ==========================================
        const canvas = document.getElementById('network-canvas');
        if (canvas) {
            const ctx = canvas.getContext('2d'); 
            let w, h; let particles = [];
            const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
            window.addEventListener('resize', resize); resize();
            
            class P { 
                constructor(){this.x=Math.random()*w;this.y=Math.random()*h;this.vx=(Math.random()-.5)*.5;this.vy=(Math.random()-.5)*.5;this.r=Math.random()*2} 
                update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>w)this.vx*=-1;if(this.y<0||this.y>h)this.vy*=-1} 
                draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(0,229,255,0.5)';ctx.fill()} 
            }
            
            for(let i=0;i<80;i++) particles.push(new P());
            
            function animate(){
                ctx.clearRect(0,0,w,h); 
                particles.forEach(p=>{p.update();p.draw()});
                for(let i=0;i<particles.length;i++){
                    for(let j=i+1;j<particles.length;j++){
                        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
                        if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(0,229,255,${.2-d/600})`;ctx.stroke()}
                    }
                }
                requestAnimationFrame(animate);
            } 
            animate();
        }
        
    } catch (error) {
        console.error("Error cargando la aplicación:", error);
    }
});
