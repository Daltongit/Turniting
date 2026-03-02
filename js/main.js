document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // PARTE 1: LÓGICA DE LA PRESENTACIÓN (100% SEGURA E INDEPENDIENTE)
    // =========================================================================
    
    // --- NAVEGACIÓN DIAPOSITIVAS ---
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('next-btn');
    const btnPrev = document.getElementById('prev-btn');
    const counter = document.getElementById('current-slide-num');
    let currentSlide = 0;

    function updateSlides() {
        if (!slides.length) return;
        slides.forEach((slide, index) => {
            slide.classList.remove('active');
            if (index === currentSlide) slide.classList.add('active');
        });
        if (counter) counter.innerText = (currentSlide + 1) + " / " + slides.length;
        if (btnPrev) btnPrev.style.opacity = currentSlide === 0 ? "0.3" : "1";
        if (btnNext) btnNext.style.opacity = currentSlide === slides.length - 1 ? "0.3" : "1";
    }

    if (btnNext) btnNext.addEventListener('click', () => { if (currentSlide < slides.length - 1) { currentSlide++; updateSlides(); } });
    if (btnPrev) btnPrev.addEventListener('click', () => { if (currentSlide > 0) { currentSlide--; updateSlides(); } });
    
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('game-overlay-wrapper');
        // Solo navega si el juego está cerrado
        if (!overlay || overlay.classList.contains('hidden')) {
            if (e.key === 'ArrowRight' || e.key === 'Space') { if (currentSlide < slides.length - 1) { currentSlide++; updateSlides(); } }
            if (e.key === 'ArrowLeft') { if (currentSlide > 0) { currentSlide--; updateSlides(); } }
        }
    });
    updateSlides();

    // --- EFECTO 3D EN TARJETAS ---
    const cards3D = document.querySelectorAll('.3d-card');
    cards3D.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect(); const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            card.style.transform = `perspective(1000px) rotateX(${((y - rect.height/2) / (rect.height/2)) * -10}deg) rotateY(${((x - rect.width/2) / (rect.width/2)) * 10}deg) scale3d(1.05, 1.05, 1.05)`;
        });
        card.addEventListener('mouseleave', () => { card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`; });
    });

    // --- SIMULADOR DE CHAT (SLIDE 6) ---
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
                
                await new Promise(r => setTimeout(r, msgs[i].d));
                
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

    // --- ABRIR Y CERRAR EL JUEGO DESDE LA PORTADA ---
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
            // Si el juego estaba corriendo, limpiar variables
            if(typeof limpiarJuegoCompleto === 'function') limpiarJuegoCompleto();
        });
    }


    // =========================================================================
    // PARTE 2: LÓGICA DEL JUEGO CON SUPABASE (Con Try/Catch por seguridad)
    // =========================================================================
    
    // Banco de 50 preguntas exactas de la exposición
    const questionPool = [
        { q: "A nivel de software, ¿qué es la IA moderna?", options: ["Una mente consciente artificial", "Modelos probabilísticos que aprenden de datos", "Instrucciones rígidas paso a paso", "Un cerebro biológico simulado"], a: 1 },
        { q: "¿Qué tipo de IA es la única que existe realmente hoy en día?", options: ["IA General (AGI)", "Superinteligencia", "IA Estrecha (ANI)", "IA Consciente"], a: 2 },
        { q: "¿Qué define a una IA General (AGI)?", options: ["Jugar ajedrez", "Capacidad cognitiva humana completa en cualquier tema", "Reconocer rostros en fotos", "Procesar videos 4K"], a: 1 },
        { q: "¿Qué dispositivo liderado por Turing descifró códigos nazis?", options: ["El Perceptrón", "La máquina Bombe", "Deep Blue", "ENIAC"], a: 1 },
        { q: "¿Qué propuso Turing sobre las máquinas antes de que existieran las PC?", options: ["Que tendrían sentimientos", "Que podían manipular símbolos matemáticos y procesar lógica", "Que usarían internet", "Que dominarían el mundo"], a: 1 },
        { q: "La 'Cinta Infinita' de la Máquina de Turing equivale hoy a:", options: ["El disco duro", "La Memoria RAM", "La tarjeta de video", "El procesador"], a: 1 },
        { q: "El 'Cabezal de Lectura/Escritura' de Turing equivale a:", options: ["La CPU (Procesador)", "El monitor", "El teclado", "El mouse"], a: 0 },
        { q: "En la tupla de Turing, ¿qué representa δ (Delta)?", options: ["Los datos de entrada", "Los estados finales", "La función de transición (Las reglas IF/ELSE)", "El abecedario"], a: 2 },
        { q: "¿Por qué Turing creó el 'Juego de la Imitación'?", options: ["Por diversión", "Para evadir la pregunta ambigua de si las máquinas 'piensan'", "Para ganar una apuesta", "Para probar teclados"], a: 1 },
        { q: "¿Qué evalúa el juez humano en el Test de Turing?", options: ["Si la máquina calcula rápido", "Si no puede distinguir entre la máquina y un humano", "El código fuente de la IA", "La energía consumida"], a: 1 },
        { q: "¿Cuál es la crítica principal de la 'Habitación China'?", options: ["El test es lento", "Simular respuestas perfectas (sintaxis) no significa comprender (semántica)", "El chino es difícil", "Turing se equivocó de idioma"], a: 1 },
        { q: "¿Qué evento de 1956 bautizó oficialmente a la Inteligencia Artificial?", options: ["Lanzamiento de IBM", "La Conferencia de Dartmouth", "El fin de la guerra", "Lanzamiento de Apple"], a: 1 },
        { q: "¿Qué era el 'Perceptrón' creado en 1958?", options: ["Un robot humanoide", "El primer algoritmo inspirado en neuronas biológicas", "Un antivirus", "Una supercomputadora"], a: 1 },
        { q: "¿Cómo engañaba a la gente ELIZA, el primer chatbot?", options: ["Tenía conciencia", "Buscaba palabras clave y devolvía la misma frase como pregunta", "Estaba conectado a internet", "Usaba voz humana"], a: 1 },
        { q: "¿Qué caracterizó a los 'Sistemas Expertos' de los años 80?", options: ["Redes neuronales profundas", "Miles de reglas lógicas fijas tipo SI-ENTONCES", "Aprendizaje por refuerzo", "Uso de GPUs"], a: 1 },
        { q: "¿Por qué ocurrió el llamado 'Invierno de la IA'?", options: ["Los altos costos de mantenimiento y falta de potencia en las computadoras", "Un virus mundial", "Ley de prohibición de IA", "El código se perdió"], a: 0 },
        { q: "¿Qué dos elementos causaron el boom del Deep Learning en 2010?", options: ["Mejores monitores", "El Big Data (Datos masivos) y la potencia paralela de las GPUs", "El Wifi 5G", "Sistemas operativos nuevos"], a: 1 },
        { q: "¿Qué gran logro tuvo la red AlexNet en 2012?", options: ["Ganar al póker", "Reconocer imágenes con precisión récord mediante Redes Convolucionales", "Hablar 10 idiomas", "Manejar un dron"], a: 1 },
        { q: "¿Cómo logró AlphaGo aprender a jugar el juego 'Go'?", options: ["Programaron cada jugada a mano", "Jugando millones de partidas contra sí mismo (Aprendizaje por Refuerzo)", "Viendo a humanos en Youtube", "Usando el Perceptrón"], a: 1 },
        { q: "¿Qué arquitectura permite a modelos como Gemini o ChatGPT entender contexto largo?", options: ["Perceptrón Lineal", "La arquitectura Transformer", "Redes Neuronales Simples", "Sistemas Expertos"], a: 1 },
        { q: "¿Cuál es el problema de la 'Caja Negra' en IA?", options: ["Es un fallo del disco", "El proceso de decisión de las redes profundas es incomprensible hasta para sus creadores", "Se bloquea la pantalla", "Robo de datos"], a: 1 },
        { q: "Además de la eficiencia, ¿cuál es el gran desafío ético de la IA actual?", options: ["Que ocupe menos memoria", "Auditar sesgos, asegurar confiabilidad y respetar la privacidad de datos", "Que sea gratis", "Que tenga buena interfaz"], a: 1 },
        { q: "¿En qué año falleció Alan Turing?", options: ["1980", "1954", "2000", "1945"], a: 1 },
        { q: "¿A qué conflicto bélico ayudó a poner fin el equipo de Turing?", options: ["Primera Guerra Mundial", "Guerra de Vietnam", "Segunda Guerra Mundial", "Guerra Fría"], a: 2 },
        { q: "El modelo teórico de la cinta de Turing se asume que es:", options: ["Limitada a 1GB", "Infinita", "Circular", "De lectura única"], a: 1 },
        { q: "En la fórmula de la Máquina de Turing, 'Q' significa:", options: ["Quantums", "Queries", "Conjunto de Estados en memoria", "Quick memory"], a: 2 },
        { q: "Originalmente, el Test de Turing se realizaba por medio de:", options: ["Video llamadas", "Mensajes de texto por terminal/teletipo", "Comandos de voz", "Presencialmente"], a: 1 },
        { q: "La época de máximo optimismo y promesas en IA ocurrió en:", options: ["Los años 90s", "Los años 50s y 60s", "El 2020", "Los 30s"], a: 1 },
        { q: "John McCarthy y Marvin Minsky son considerados pioneros que:", options: ["Fundaron Google", "Definieron el campo de la IA en Dartmouth", "Crearon la máquina Bombe", "Inventaron el internet"], a: 1 },
        { q: "¿Cuál fue el principal límite matemático del Perceptrón de 1958?", options: ["No podía resolver problemas no lineales", "Se sobrecalentaba rápido", "No leía texto", "Solo funcionaba de día"], a: 0 },
        { q: "El estancamiento en investigación por falta de fondos se conoció como:", options: ["El Crash del Software", "El Apagón Digital", "El Invierno de la IA", "La Caída del Silicio"], a: 2 },
        { q: "¿En qué industrias brillaron los Sistemas Expertos antes de caer?", options: ["Videojuegos y películas", "Medicina y corporaciones (diagnóstico y reglas de negocio)", "Automotriz", "Redes Sociales"], a: 1 },
        { q: "AlphaGo venció al campeón mundial Lee Sedol en el año:", options: ["1997", "2016", "2023", "2005"], a: 1 },
        { q: "Las siglas LLM, base de la IA generativa actual, significan:", options: ["Large Language Model", "Low Logic Machine", "Linear Learning Method", "Local Language Memory"], a: 0 },
        { q: "A diferencia de un Sistema Experto, el Deep Learning se basa en:", options: ["Árboles lógicos IF/THEN", "Capas ocultas de neuronas artificiales aprendiendo de datos", "Conexiones a Wikipedia", "Procesamiento secuencial"], a: 1 },
        { q: "¿Por qué el Big Data fue crucial para revivir la IA?", options: ["Porque las redes neuronales necesitan ejemplos masivos para calibrar sus pesos probabilísticos", "Porque suena tecnológico", "Porque bajó los costos", "Porque es un antivirus"], a: 0 },
        { q: "Las GPUs transformaron el campo de la IA porque:", options: ["Tienen luces RGB", "Manejan miles de operaciones matemáticas pequeñas en paralelo", "No usan disco duro", "Son muy silenciosas"], a: 1 },
        { q: "Si se entrena un algoritmo con datos históricos con sesgo (racismo/machismo), la IA:", options: ["Lo borra mágicamente", "Aprende y replica el sesgo automatizando la discriminación", "Deja de funcionar", "Pide ayuda"], a: 1 },
        { q: "El experimento mental de la Habitación China fue propuesto por el filósofo:", options: ["Alan Turing", "John Searle", "Karl Marx", "Immanuel Kant"], a: 1 },
        { q: "Matemáticamente, la Máquina de Turing se define como una tupla de:", options: ["3 elementos", "7 elementos", "10 elementos", "5 elementos"], a: 1 },
        { q: "En la definición de Turing, ¿qué es Σ (Sigma)?", options: ["El resultado de la suma", "El alfabeto de símbolos de entrada", "La cinta borrada", "La velocidad del cabezal"], a: 1 },
        { q: "El creador del algoritmo Perceptrón fue:", options: ["Alan Turing", "Frank Rosenblatt", "Geoffrey Hinton", "Bill Gates"], a: 1 },
        { q: "El bot ELIZA fue creado en el instituto:", options: ["MIT", "Stanford", "Harvard", "UPEC"], a: 0 },
        { q: "Las Redes Neuronales Convolucionales (CNNs) destacan en tareas de:", options: ["Generar audio", "Visión Artificial y reconocimiento de imágenes", "Escribir código", "Traducción de idiomas"], a: 1 },
        { q: "Antes de los Transformers, procesar texto era difícil porque:", options: ["Faltaban teclados", "Se procesaba palabra por palabra secuencialmente, perdiendo el contexto largo", "El internet era lento", "No había datos"], a: 1 },
        { q: "El término 'Explicabilidad' (Explainable AI) se refiere a la necesidad de:", options: ["Que la IA hable claro", "Entender la lógica interna de cómo una red profunda toma sus decisiones", "Bajar el costo", "Que sea rápida"], a: 1 },
        { q: "¿Cuál es el objetivo final (teórico) de los investigadores de AGI?", options: ["Igualar la versatilidad de la inteligencia humana en cualquier dominio", "Ganar todos los videojuegos", "Hacer calculadoras rápidas", "Crear baterías infinitas"], a: 0 },
        { q: "El Juego de la Imitación de Turing involucraba a:", options: ["Dos máquinas", "Un juez humano, un humano oculto y una máquina oculta", "Tres computadoras", "Solo humanos simulando ser máquinas"], a: 1 },
        { q: "¿Qué diferencia el software tradicional del Machine Learning?", options: ["El lenguaje de programación", "El software tradicional sigue reglas fijas dadas; el ML aprende reglas y patrones a partir de los datos", "El ML no usa código", "No hay diferencia"], a: 1 },
        { q: "El trabajo de Turing en morfogénesis trataba sobre:", options: ["La creación de software", "Aplicar matemáticas para explicar patrones biológicos en la naturaleza", "Encriptación wifi", "Redes neuronales"], a: 1 }
    ];

    let currentRoomCode = ""; let myPlayerId = ""; let isHost = false;
    let gameQuestions = []; let currentQIndex = 0; let score = 0; let timerInterval; let timeLeft = 15;
    let roomSubscription = null; let playersSubscription = null;

    window.limpiarJuegoCompleto = async function() {
        try {
            if(window.supabase) {
                if(roomSubscription) window.supabase.removeChannel(roomSubscription);
                if(playersSubscription) window.supabase.removeChannel(playersSubscription);
                if(isHost && currentRoomCode) await window.supabase.from('rooms').update({ state: 'finished' }).eq('code', currentRoomCode);
            }
        } catch(e) {}
        currentRoomCode = ""; myPlayerId = ""; isHost = false; clearInterval(timerInterval);
        const hInit = document.getElementById('host-area-initial'); const hAct = document.getElementById('host-area-active');
        const btnStart = document.getElementById('btn-start-game-host'); const hList = document.getElementById('host-player-list');
        if(hInit) hInit.classList.remove('hidden'); if(hAct) hAct.classList.add('hidden');
        if(btnStart) btnStart.disabled = true; if(hList) hList.innerHTML = '<li class="empty-list">Esperando conexiones...</li>';
    };

    // INTENTAMOS INICIAR SUPABASE
    try {
        if (typeof window.supabase !== 'undefined') {
            const supabaseUrl = 'https://osriruqcnxshmkvdhijw.supabase.co';
            const supabaseKey = 'sb_publishable_9-dt8ZHtX3uAQtb4vMPKGQ__34i08qS';
            const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

            // HOST: CREAR SALA
            const btnCreateRoom = document.getElementById('btn-create-room');
            if(btnCreateRoom) {
                btnCreateRoom.addEventListener('click', async () => {
                    isHost = true;
                    currentRoomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const { error } = await supabase.from('rooms').insert([{ code: currentRoomCode, state: 'lobby' }]);
                    if(error) { alert("Error de red creando la sala."); return; }

                    document.getElementById('display-room-code').innerText = currentRoomCode;
                    document.getElementById('host-area-initial').classList.add('hidden');
                    document.getElementById('host-area-active').classList.remove('hidden');
                    
                    playersSubscription = supabase.channel('host_players')
                        .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_code=eq.${currentRoomCode}` }, async () => {
                            const { data, error } = await supabase.from('players').select('*').eq('room_code', currentRoomCode);
                            if(error) return;
                            const list = document.getElementById('host-player-list');
                            const btnStart = document.getElementById('btn-start-game-host');
                            if (data && data.length > 0) {
                                list.innerHTML = ""; data.forEach(p => { list.innerHTML += `<li><i class="fa-solid ${p.avatar}"></i> ${p.name}</li>`; });
                                document.getElementById('player-count').innerText = data.length; btnStart.disabled = false;
                            } else {
                                list.innerHTML = '<li class="empty-list">Esperando conexiones...</li>'; btnStart.disabled = true;
                            }
                            const { data: roomData } = await supabase.from('rooms').select('state').eq('code', currentRoomCode).single();
                            if(roomData && (roomData.state === 'playing' || roomData.state === 'finished')) pintarTablaPosiciones(data);
                        }).subscribe();
                });
            }

            // HOST: INICIAR PARTIDA
            const btnStartHost = document.getElementById('btn-start-game-host');
            if(btnStartHost) {
                btnStartHost.addEventListener('click', async () => {
                    await supabase.from('rooms').update({ state: 'playing' }).eq('code', currentRoomCode);
                    const { data } = await supabase.from('players').select('*').eq('room_code', currentRoomCode);
                    pintarTablaPosiciones(data);
                    showGameScreen('leaderboard-screen');
                });
            }

            // JUGADOR: SELECCIÓN AVATAR Y UNIRSE
            let currentPlayerAvatar = "fa-robot";
            const avatars = document.querySelectorAll('.avatar-option');
            avatars.forEach(opt => opt.addEventListener('click', () => {
                avatars.forEach(o => o.classList.remove('active')); opt.classList.add('active');
                currentPlayerAvatar = opt.getAttribute('data-avatar');
            }));

            const btnJoin = document.getElementById('btn-join-room');
            if(btnJoin) {
                btnJoin.addEventListener('click', async () => {
                    const n = document.getElementById('player-name-input').value.trim();
                    const c = document.getElementById('join-code-input').value.trim().toUpperCase();
                    if(!n) { alert("¡Ingresa tu nombre!"); return; }
                    if(!c || c.length !== 4) { alert("Código inválido."); return; }

                    const { data: room, error: roomErr } = await supabase.from('rooms').select('*').eq('code', c).single();
                    if(roomErr || !room) { alert("La sala no existe."); return; }
                    
                    currentRoomCode = c;
                    const { data: player, error: pErr } = await supabase.from('players').insert([{ room_code: c, name: n, avatar: currentPlayerAvatar }]).select().single();
                    if(pErr || !player) { alert("Error al entrar."); return; }
                    
                    myPlayerId = player.id;
                    document.getElementById('waiting-room-code').innerText = c;
                    document.getElementById('my-waiting-name').innerText = n;
                    document.getElementById('my-waiting-avatar').className = `fa-solid ${currentPlayerAvatar}`;
                    showGameScreen('waiting-screen');

                    roomSubscription = supabase.channel('player_room_listen')
                        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `code=eq.${currentRoomCode}` }, payload => {
                            if(payload.new.state === 'playing') iniciarTestJugador(); 
                        }).subscribe();
                        
                    if(room.state === 'playing') iniciarTestJugador();
                });
            }

            // FLUJO DEL TEST PARA EL JUGADOR
            function iniciarTestJugador() {
                let shuffled = [...questionPool].sort(() => 0.5 - Math.random());
                gameQuestions = shuffled.slice(0, 5); currentQIndex = 0; score = 0;
                showGameScreen('game-screen'); cargarPregunta();
            }

            function cargarPregunta() {
                clearInterval(timerInterval); timeLeft = 15; updateTimerUI();
                const qData = gameQuestions[currentQIndex];
                document.getElementById('current-q-num').innerText = currentQIndex + 1;
                document.getElementById('question-text').innerText = qData.q;
                
                const container = document.getElementById('options-container'); container.innerHTML = "";
                qData.options.forEach((optText, i) => {
                    const btn = document.createElement('button'); btn.className = 'option-btn'; btn.innerText = optText;
                    btn.addEventListener('click', () => procesarRespuesta(i, btn)); container.appendChild(btn);
                });
                
                timerInterval = setInterval(() => {
                    timeLeft--; updateTimerUI();
                    if(timeLeft <= 0) { clearInterval(timerInterval); procesarRespuesta(-1, null); }
                }, 1000);
            }

            function updateTimerUI() {
                document.getElementById('timer-count').innerText = timeLeft;
                document.getElementById('timer-bar-fill').style.width = `${(timeLeft / 15) * 100}%`;
            }

            async function procesarRespuesta(selectedIndex, btnElement) {
                clearInterval(timerInterval); 
                const correctIndex = gameQuestions[currentQIndex].a;
                const btns = document.querySelectorAll('.option-btn'); btns.forEach(b => b.disabled = true);
                
                if(selectedIndex === correctIndex) { 
                    if(btnElement) btnElement.classList.add('correct'); score += 100 + (timeLeft * 10); 
                } else { 
                    if(btnElement) btnElement.classList.add('wrong'); btns[correctIndex].classList.add('correct'); 
                }

                await supabase.from('players').update({ score: score }).eq('id', myPlayerId);

                setTimeout(() => {
                    currentQIndex++;
                    if(currentQIndex < gameQuestions.length) cargarPregunta(); else terminarTestJugador();
                }, 2000);
            }

            async function terminarTestJugador() {
                const { data } = await supabase.from('players').select('*').eq('room_code', currentRoomCode);
                pintarTablaPosiciones(data);
                showGameScreen('leaderboard-screen');
                
                if(!playersSubscription) {
                     playersSubscription = supabase.channel('player_leaderboard')
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `room_code=eq.${currentRoomCode}` }, async () => {
                        const { data: newData } = await supabase.from('players').select('*').eq('room_code', currentRoomCode);
                        pintarTablaPosiciones(newData);
                    }).subscribe();
                }
            }

            function pintarTablaPosiciones(playersData) {
                if(!playersData) return;
                playersData.sort((a, b) => b.score - a.score);
                const tbody = document.getElementById('leaderboard-body'); if(!tbody) return;
                tbody.innerHTML = "";
                playersData.forEach((e, i) => {
                    const tr = document.createElement('tr');
                    if(e.id === myPlayerId) tr.style.background = "rgba(0, 229, 255, 0.2)";
                    tr.innerHTML = `<td>${i + 1}</td><td><i class="fa-solid ${e.avatar}" style="color:var(--primary); font-size:1.5rem;"></i></td><td>${e.name}</td><td>${e.score} pts</td>`;
                    tbody.appendChild(tr);
                });
            }

            const btnNewLobby = document.getElementById('btn-new-lobby');
            if(btnNewLobby) btnNewLobby.addEventListener('click', () => { window.limpiarJuegoCompleto(); showGameScreen('test-lobby-screen'); });

        } else {
            console.error("No se pudo cargar Supabase. La presentación funcionará sin el test en red.");
        }
    } catch(err) {
        console.error("Error en módulo de Supabase:", err);
    }

    // =========================================================================
    // PARTE 3: CANVAS DE RED NEURONAL DE FONDO
    // =========================================================================
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d'); let w, h; let particles = [];
        const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
        window.addEventListener('resize', resize); resize();
        
        class P { 
            constructor(){this.x=Math.random()*w;this.y=Math.random()*h;this.vx=(Math.random()-.5)*.5;this.vy=(Math.random()-.5)*.5;this.r=Math.random()*2} 
            update(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>w)this.vx*=-1;if(this.y<0||this.y>h)this.vy*=-1} 
            draw(){ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fillStyle='rgba(0,229,255,0.5)';ctx.fill()} 
        }
        
        for(let i=0;i<80;i++) particles.push(new P());
        
        function animate(){
            ctx.clearRect(0,0,w,h); particles.forEach(p=>{p.update();p.draw()});
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
});
