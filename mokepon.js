        // --- DATA STRUCTURES ---
        class Mokepon {
            constructor(nombre, foto, vidas, tipo, emoji, color) {
                this.nombre = nombre;
                this.foto = foto;
                this.vidas = vidas;
                this.tipo = tipo; // Agua, Tierra, Fuego
                this.emoji = emoji;
                this.color = color;
                this.imagen = foto ? new Image() : null;
                if (this.imagen) this.imagen.src = foto;
                // Position on Map
                this.x = 0;
                this.y = 0;
                this.ancho = 45;
                this.alto = 45;
                this.velocidadX = 0;
                this.velocidadY = 0;
            }

            dibujar(ctx) {
                ctx.save();
                // Draw background circle for sprite
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x + this.ancho / 2, this.y + this.alto / 2, this.ancho / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();

                if (this.imagen && this.imagen.complete && this.imagen.naturalWidth > 0) {
                    ctx.drawImage(this.imagen, this.x, this.y, this.ancho, this.alto);
                } else {
                    ctx.font = '26px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(this.emoji, this.x + this.ancho / 2, this.y + this.alto / 2 + 2);
                }
                ctx.restore();
            }
        }

        // Available Mokepons Templates
        const MOKEPONES_DATA = [
            { nombre: 'Hipodoge', tipo: 'Agua', emoji: '🦛', color: '#3b82f6', foto: '/assets/hipodoge.svg' },
            { nombre: 'Capipepo', tipo: 'Tierra', emoji: '🦫', color: '#10b981', foto: '/assets/capipepo.svg' },
            { nombre: 'Ratigueya', tipo: 'Fuego', emoji: '🐀', color: '#ef4444', foto: '/assets/ratigueya.svg' }
        ];

        // --- STATE VARIABLES ---
        let mascotaJugador = null;
        let mascotaEnemigo = null;
        let enemigosMapa = [];
        
        let vidasJugador = 3;
        let vidasEnemigo = 3;
        
        let ataqueJugador = '';
        let ataqueEnemigo = '';

        let intervalMapa = null;

        // --- DOM ELEMENTS ---
        const secSeleccionarMascota = document.getElementById('sec-seleccionar-mascota');
        const secVerMapa = document.getElementById('sec-ver-mapa');
        const secSeleccionarAtaque = document.getElementById('sec-seleccionar-ataque');
        
        const btnSeleccionarMascota = document.getElementById('btn-seleccionar-mascota');
        const btnFuego = document.getElementById('btn-fuego');
        const btnAgua = document.getElementById('btn-agua');
        const btnTierra = document.getElementById('btn-tierra');
        const btnReiniciar = document.getElementById('btn-reiniciar');

        const canvasMapa = document.getElementById('mapa-canvas');
        const ctx = canvasMapa.getContext('2d');

        const spanNombreJugador = document.getElementById('nombre-jugador');
        const spanNombreEnemigo = document.getElementById('nombre-enemigo');
        const spriteJugador = document.getElementById('player-sprite');
        const spriteEnemigo = document.getElementById('enemy-sprite');

        const spanVidasJugador = document.getElementById('vidas-jugador');
        const spanVidasEnemigo = document.getElementById('vidas-enemigo');
        const barVidasJugador = document.getElementById('bar-vids-jugador');
        const barVidasEnemigo = document.getElementById('bar-vids-enemigo');

        const logContainer = document.getElementById('log-container');
        const mensajeResultadoTurno = document.getElementById('mensaje-resultado-turno');

        const modalResultado = document.getElementById('modal-resultado');
        const modalTitulo = document.getElementById('modal-titulo');
        const modalMensaje = document.getElementById('modal-mensaje');
        const modalIcono = document.getElementById('modal-icono');

        // Touch Control Buttons
        const btnUp = document.getElementById('btn-up');
        const btnDown = document.getElementById('btn-down');
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        function mostrarSprite(elemento, mascota) {
            if (!mascota.foto) {
                elemento.textContent = mascota.emoji;
                return;
            }

            const imagen = document.createElement('img');
            imagen.src = mascota.foto;
            imagen.alt = mascota.nombre;
            imagen.className = 'battle-sprite-image';
            elemento.replaceChildren(imagen);
        }

        // --- INITIALIZATION ---
        window.addEventListener('load', iniciarJuego);

        function iniciarJuego() {
            // Setup Event Listeners
            btnSeleccionarMascota.addEventListener('click', seleccionarMascotaJugador);

            btnFuego.addEventListener('click', () => ejecutarTurno('Fuego'));
            btnAgua.addEventListener('click', () => ejecutarTurno('Agua'));
            btnTierra.addEventListener('click', () => ejecutarTurno('Tierra'));

            btnReiniciar.addEventListener('click', reiniciarJuego);

            // D-Pad Touch / Click listeners
            btnUp.addEventListener('mousedown', moverArriba);
            btnUp.addEventListener('mouseup', detenerMovimiento);
            btnUp.addEventListener('touchstart', (e) => { e.preventDefault(); moverArriba(); });
            btnUp.addEventListener('touchend', detenerMovimiento);

            btnDown.addEventListener('mousedown', moverAbajo);
            btnDown.addEventListener('mouseup', detenerMovimiento);
            btnDown.addEventListener('touchstart', (e) => { e.preventDefault(); moverAbajo(); });
            btnDown.addEventListener('touchend', detenerMovimiento);

            btnLeft.addEventListener('mousedown', moverIzquierda);
            btnLeft.addEventListener('mouseup', detenerMovimiento);
            btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); moverIzquierda(); });
            btnLeft.addEventListener('touchend', detenerMovimiento);

            btnRight.addEventListener('mousedown', moverDerecha);
            btnRight.addEventListener('mouseup', detenerMovimiento);
            btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); moverDerecha(); });
            btnRight.addEventListener('touchend', detenerMovimiento);
        }

        // --- 1. SELECCIÓN DE MASCOTA ---
        function seleccionarMascotaJugador() {
            const opciones = document.getElementsByName('mascota');
            let mascotaSeleccionada = null;

            for (let opcion of opciones) {
                if (opcion.checked) {
                    mascotaSeleccionada = opcion.value;
                    break;
                }
            }

            if (!mascotaSeleccionada) {
                const p = document.createElement('p');
                p.className = 'text-red-400 font-bold mt-2 text-sm';
                p.innerText = '⚠️ Por favor, selecciona un Mokepon para continuar.';
                secSeleccionarMascota.appendChild(p);
                setTimeout(() => p.remove(), 3000);
                return;
            }

            // Create Player Mokepon Instance
            const data = MOKEPONES_DATA.find(m => m.nombre === mascotaSeleccionada);
            mascotaJugador = new Mokepon(data.nombre, data.foto || '', 3, data.tipo, data.emoji, data.color);
            mascotaJugador.x = 40;
            mascotaJugador.y = 180;

            // Update UI elements
            spanNombreJugador.innerText = mascotaJugador.nombre;
            mostrarSprite(spriteJugador, mascotaJugador);

            // Transition Section
            secSeleccionarMascota.classList.add('hidden');
            secVerMapa.classList.remove('hidden');

            // Initialize Map
            iniciarMapa();
        }

        // --- 2. NAVEGACIÓN Y CANVAS MAPA ---
        function iniciarMapa() {
            // Generate Enemies on Map
            enemigosMapa = [
                crearEnemigoAleatorio(300, 80),
                crearEnemigoAleatorio(450, 220),
                crearEnemigoAleatorio(220, 280)
            ];

            // Keyboard movement listeners
            window.addEventListener('keydown', teclaPresionada);
            window.addEventListener('keyup', detenerMovimiento);

            // Game Loop for Canvas
            intervalMapa = setInterval(pintarCanvas, 1000 / 60);
        }

        function crearEnemigoAleatorio(x, y) {
            const index = Math.floor(Math.random() * MOKEPONES_DATA.length);
            const data = MOKEPONES_DATA[index];
            const enemigo = new Mokepon(data.nombre, data.foto || '', 3, data.tipo, data.emoji, data.color);
            enemigo.x = x;
            enemigo.y = y;
            return enemigo;
        }

        function pintarCanvas() {
            // Update Position
            mascotaJugador.x += mascotaJugador.velocidadX;
            mascotaJugador.y += mascotaJugador.velocidadY;

            // Map Boundaries Collision
            mascotaJugador.x = Math.max(0, Math.min(canvasMapa.width - mascotaJugador.ancho, mascotaJugador.x));
            mascotaJugador.y = Math.max(0, Math.min(canvasMapa.height - mascotaJugador.alto, mascotaJugador.y));

            // Clear Background
            ctx.clearRect(0, 0, canvasMapa.width, canvasMapa.height);

            // Draw Map Terrain (Grid / Decorations)
            dibujarEscenario();

            // Draw Player
            mascotaJugador.dibujar(ctx);

            // Draw & Move Enemies
            enemigosMapa.forEach(enemigo => {
                // Subtle random movement for enemies
                if (Math.random() < 0.02) {
                    enemigo.velocidadX = (Math.random() - 0.5) * 2;
                    enemigo.velocidadY = (Math.random() - 0.5) * 2;
                }
                enemigo.x += enemigo.velocidadX;
                enemigo.y += enemigo.velocidadY;

                // Keep enemies in bounds
                enemigo.x = Math.max(100, Math.min(canvasMapa.width - enemigo.ancho, enemigo.x));
                enemigo.y = Math.max(20, Math.min(canvasMapa.height - enemigo.alto, enemigo.y));

                enemigo.dibujar(ctx);

                // Check Collision with Player
                revisarColision(enemigo);
            });
        }

        function dibujarEscenario() {
            // Draw grass background with subtle pathing
            ctx.fillStyle = '#065f46'; // Forest green
            ctx.fillRect(0, 0, canvasMapa.width, canvasMapa.height);

            // Path decorative grid
            ctx.strokeStyle = '#047857';
            ctx.lineWidth = 1;
            for (let x = 0; x < canvasMapa.width; x += 40) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasMapa.height);
                ctx.stroke();
            }
            for (let y = 0; y < canvasMapa.height; y += 40) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvasMapa.width, y);
                ctx.stroke();
            }

            // Decorative Trees 🌲
            ctx.font = '20px sans-serif';
            ctx.fillText('🌲', 80, 50);
            ctx.fillText('🌲', 220, 150);
            ctx.fillText('🪨', 380, 60);
            ctx.fillText('🌲', 520, 320);
            ctx.fillText('🪨', 140, 320);
        }

        // Control Helpers
        function moverArriba() { mascotaJugador.velocidadY = -4; }
        function moverAbajo() { mascotaJugador.velocidadY = 4; }
        function moverIzquierda() { mascotaJugador.velocidadX = -4; }
        function moverDerecha() { mascotaJugador.velocidadX = 4; }

        function detenerMovimiento() {
            mascotaJugador.velocidadX = 0;
            mascotaJugador.velocidadY = 0;
        }

        function teclaPresionada(event) {
            switch (event.key) {
                case 'ArrowUp': case 'w': case 'W': moverArriba(); break;
                case 'ArrowDown': case 's': case 'S': moverAbajo(); break;
                case 'ArrowLeft': case 'a': case 'A': moverIzquierda(); break;
                case 'ArrowRight': case 'd': case 'D': moverDerecha(); break;
            }
        }

        // Collision Detection
        function revisarColision(enemigo) {
            const arribaEnemigo = enemigo.y;
            const abajoEnemigo = enemigo.y + enemigo.alto;
            const derechaEnemigo = enemigo.x + enemigo.ancho;
            const izqEnemigo = enemigo.x;

            const arribaJugador = mascotaJugador.y;
            const abajoJugador = mascotaJugador.y + mascotaJugador.alto;
            const derechaJugador = mascotaJugador.x + mascotaJugador.ancho;
            const izqJugador = mascotaJugador.x;

            if (
                abajoJugador < arribaEnemigo ||
                arribaJugador > abajoEnemigo ||
                derechaJugador < izqEnemigo ||
                izqJugador > derechaEnemigo
            ) {
                return; // No collision
            }

            // Collision detected! Stop Loop & Start Battle
            detenerMovimiento();
            clearInterval(intervalMapa);
            window.removeEventListener('keydown', teclaPresionada);

            mascotaEnemigo = enemigo;
            iniciarBatalla();
        }

        // --- 3. COMBATE Y COMBATE POR TURNOS ---
        function iniciarBatalla() {
            secVerMapa.classList.add('hidden');
            secSeleccionarAtaque.classList.remove('hidden');

            // Setup Enemy UI
            spanNombreEnemigo.innerText = mascotaEnemigo.nombre;
            mostrarSprite(spriteEnemigo, mascotaEnemigo);

            // Reset Lives
            vidasJugador = 3;
            vidasEnemigo = 3;
            actualizarBarrasVida();

            logContainer.innerHTML = `<p class="text-[#FFDE59] italic">¡Te has encontrado con un <b>${mascotaEnemigo.nombre}</b> salvaje!</p>`;
        }

        function ejecutarTurno(ataqueSeleccionado) {
            ataqueJugador = ataqueSeleccionado;
            
            // Random Enemy Attack
            const opcionesAtaque = ['Fuego', 'Agua', 'Tierra'];
            ataqueEnemigo = opcionesAtaque[Math.floor(Math.random() * opcionesAtaque.length)];

            // Determine Winner of the Round
            let resultado = ''; // 'VICTORIA', 'DERROTA', 'EMPATE'

            if (ataqueJugador === ataqueEnemigo) {
                resultado = 'EMPATE';
            } else if (
                (ataqueJugador === 'Fuego' && ataqueEnemigo === 'Tierra') ||
                (ataqueJugador === 'Agua' && ataqueEnemigo === 'Fuego') ||
                (ataqueJugador === 'Tierra' && ataqueEnemigo === 'Agua')
            ) {
                resultado = 'VICTORIA';
                vidasEnemigo--;
            } else {
                resultado = 'DERROTA';
                vidasJugador--;
            }

            // Update UI & Log
            actualizarBarrasVida();
            crearMensajeTurno(resultado);

            // Check Game Over
            revisarVidas();
        }

        function actualizarBarrasVida() {
            spanVidasJugador.innerText = vidasJugador;
            spanVidasEnemigo.innerText = vidasEnemigo;

            // Calculate width percentage
            const pctJugador = Math.max(0, (vidasJugador / 3) * 100);
            const pctEnemigo = Math.max(0, (vidasEnemigo / 3) * 100);

            barVidasJugador.style.width = pctJugador + '%';
            barVidasEnemigo.style.width = pctEnemigo + '%';

            // Change color dynamically
            barVidasJugador.className = `h-full transition-all duration-300 ${pctJugador <= 33 ? 'bg-red-500' : pctJugador <= 66 ? 'bg-yellow-500' : 'bg-[#00BF63]'}`;
            barVidasEnemigo.className = `h-full transition-all duration-300 ${pctEnemigo <= 33 ? 'bg-red-500' : pctEnemigo <= 66 ? 'bg-yellow-500' : 'bg-[#00BF63]'}`;
        }

        function crearMensajeTurno(resultado) {
            let colorTexto = 'text-gray-300';
            let emojiIcono = '⚔️';

            if (resultado === 'VICTORIA') {
                colorTexto = 'text-green-400 font-bold';
                emojiIcono = '💥';
                mensajeResultadoTurno.innerText = '¡Ganaste el turno!';
                mensajeResultadoTurno.className = 'text-xs font-bold text-green-400';
            } else if (resultado === 'DERROTA') {
                colorTexto = 'text-red-400 font-bold';
                emojiIcono = '💔';
                mensajeResultadoTurno.innerText = '¡Perdiste el turno!';
                mensajeResultadoTurno.className = 'text-xs font-bold text-red-400';
            } else {
                colorTexto = 'text-yellow-400';
                emojiIcono = '🛡️';
                mensajeResultadoTurno.innerText = '¡Empate!';
                mensajeResultadoTurno.className = 'text-xs font-bold text-yellow-400';
            }

            const p = document.createElement('p');
            p.className = `text-xs md:text-sm ${colorTexto}`;
            p.innerHTML = `${emojiIcono} Atacaste con <b>${ataqueJugador}</b>, el enemigo usó <b>${ataqueEnemigo}</b>.`;

            logContainer.prepend(p);
        }

        function revisarVidas() {
            if (vidasEnemigo === 0) {
                mostrarModalFinal(true);
            } else if (vidasJugador === 0) {
                mostrarModalFinal(false);
            }
        }

        function mostrarModalFinal(esVictoria) {
            modalResultado.classList.remove('hidden');

            if (esVictoria) {
                modalIcono.innerText = '🏆';
                modalTitulo.innerText = '¡VICTORIA ABSOLUTA!';
                modalTitulo.className = 'text-2xl md:text-3xl font-extrabold text-[#FFDE59] mb-2';
                modalMensaje.innerText = `¡Felicidades! Tu ${mascotaJugador.nombre} ha derrotado a ${mascotaEnemigo.nombre}.`;
            } else {
                modalIcono.innerText = '💀';
                modalTitulo.innerText = 'HAS SIDO DERROTADO';
                modalTitulo.className = 'text-2xl md:text-3xl font-extrabold text-red-500 mb-2';
                modalMensaje.innerText = `Tu ${mascotaJugador.nombre} ha quedado fuera de combate. ¡Sigue practicando!`;
            }
        }

        // --- REINICIO DE JUEGO ---
        function reiniciarJuego() {
            location.reload();
        }
