// Laberinto del Gato - Mini juego
// Controles: Flechas o WASD. Objetivo: llegar a uno de los dos destinos.

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const TILE = 32; // tamaño de celda en px (canvas lógico)
const COLS = canvas.width / TILE;  // 21
const ROWS = canvas.height / TILE; // 21

// Escalado responsivo: mantenemos tamaño lógico del canvas pero ajustamos el tamaño CSS.
// El CSS usa aspect-ratio y width:100%, así que solo necesitamos redibujar en resize para nitidez en algunos navegadores.
function onResize() {
  draw();
}
window.addEventListener('resize', onResize);
window.addEventListener('orientationchange', onResize);

// Medir controles inferiores y reservar espacio en body con una variable CSS
function syncControlsSpace() {
  const el = document.querySelector('.touch-controls');
  const root = document.documentElement;
  const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
  root.style.setProperty('--controls-h', h + 'px');
}
window.addEventListener('resize', syncControlsSpace);
window.addEventListener('orientationchange', () => { setTimeout(syncControlsSpace, 100); });
window.addEventListener('load', () => { syncControlsSpace(); draw(); });

// Mapa del laberinto: 0 piso, 1 pared, 2 objetivo: corazón roto, 3 objetivo: mensaje rojo
// El gato empezará en el centro del mapa (aprox).
const map = [
  // 21x21 (valores: 0/1, y ubicaremos 2 y 3 abajo)
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1,0,1],
  [1,0,1,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,1,0,1,1,1,0,1,0,1,1],
  [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,1,0,1,1,0,1,1,1,0,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Posición inicial del gato (centro aproximado 10,10)
const start = { x: Math.floor(COLS/2), y: Math.floor(ROWS/2) };
let player = { ...start };

// Colocar objetivos: corazón roto arriba-izquierda accesible, mensaje rojo abajo-derecha accesible
const heart = { x: 1, y: 1, type: 2 };
const redMsg = { x: COLS - 2, y: ROWS - 2, type: 3 };
map[heart.y][heart.x] = 2;
map[redMsg.y][redMsg.x] = 3;

// Utilidades
function tileAt(x, y) {
  if (y < 0 || y >= ROWS || x < 0 || x >= COLS) return 1;
  return map[y][x];
}

function resetGame() {
  player = { ...start };
  hideModal();
  draw();
}

// Render
function draw() {
  ctx.clearRect(0,0,canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const v = map[y][x];
      const px = x * TILE, py = y * TILE;

      // suelo
      ctx.fillStyle = '#0f1220';
      ctx.fillRect(px, py, TILE, TILE);

      // decoración leve de suelo
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(px, py + TILE - 2, TILE, 2);

      if (v === 1) {
        // pared
        ctx.fillStyle = '#2f3444';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = '#42485a';
        ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
      } else if (v === 2) {
        // objetivo corazón roto
        ctx.fillStyle = '#3a1e2a';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#e2557b';
        ctx.font = '24px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💔', px + TILE/2, py + TILE/2 + 2);
      } else if (v === 3) {
        // objetivo mensaje rojo
        ctx.fillStyle = '#3a1c1c';
        ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#ff3b3b';
        ctx.fillRect(px + 8, py + 8, TILE - 16, TILE - 16);
      }
    }
  }

  // jugador
  const jx = player.x * TILE, jy = player.y * TILE;
  ctx.font = '24px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🐱', jx + TILE/2, jy + TILE/2 + 2);
}

// Convertir toques sobre el canvas en direcciones (swipe corto)
(function bindSwipeOnCanvas(){
  let touchStart = null;
  const threshold = 18; // px mínimos para considerar swipe
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    const t = e.touches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  canvas.addEventListener('touchend', (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) >= threshold) {
      if (ax > ay) handleMove(dx > 0 ? 'arrowright' : 'arrowleft');
      else handleMove(dy > 0 ? 'arrowdown' : 'arrowup');
    }
    touchStart = null;
  }, { passive: true });
})();

// Entrada
const keys = new Set();
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (["arrowup","arrowdown","arrowleft","arrowright","w","a","s","d"].includes(k)) {
    e.preventDefault();
  }
  keys.add(k);
  handleMove(k);
});
window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));

// Controles táctiles/clic en pantalla
function bindTouchControls() {
  const container = document.querySelector('.touch-controls');
  if (!container) return;
  const btns = container.querySelectorAll('.btn.dir');
  const mapDir = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' };

  function onPress(dir) {
    handleMove(mapDir[dir]);
  }

  btns.forEach(btn => {
    const dir = btn.dataset.dir;
    btn.addEventListener('click', (e) => { e.preventDefault(); onPress(dir); });
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); onPress(dir); }, { passive: false });
  });
}

bindTouchControls();

function handleMove(k) {
  let dx = 0, dy = 0;
  if (k === 'arrowup' || k === 'w') dy = -1;
  else if (k === 'arrowdown' || k === 's') dy = 1;
  else if (k === 'arrowleft' || k === 'a') dx = -1;
  else if (k === 'arrowright' || k === 'd') dx = 1;
  else return;

  const nx = player.x + dx;
  const ny = player.y + dy;
  const t = tileAt(nx, ny);
  if (t !== 1) {
    player.x = nx; player.y = ny;
    draw();
    checkGoal(t);
  }
}

function checkGoal(tileVal) {
  if (tileVal === 2) {
    showModal({
      title: 'Has llegado al corazón roto',
      message: 'Así de roto quedó mi corazón porque no elegiste el corazón correcto, o sea, ¿que no me quieres?. ¿intentar de nuevo?',
      theme: 'heart'
    });
  } else if (tileVal === 3) {
    showModal({
      title: 'Has llegado al mensaje rojo',
      message: '¡YEIIIIII, esto significa que nos vamos a casar. ¿Volvemos al inicio?',
      theme: 'red'
    });
  }
}

// Modal
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMsg = document.getElementById('modal-message');
const restartBtn = document.getElementById('restart-btn');

restartBtn.addEventListener('click', resetGame);

function showModal({ title, message, theme }) {
  modalTitle.textContent = title;
  modalMsg.textContent = message;
  modal.classList.remove('hidden');
  // Estética temática ligera
  if (theme === 'heart') {
    restartBtn.style.background = '#5e2a3b';
    restartBtn.style.borderColor = '#8a3c56';
  } else {
    restartBtn.style.background = '#5c2a2a';
    restartBtn.style.borderColor = '#8a3b3b';
  }
}
function hideModal() { modal.classList.add('hidden'); }

// Inicio
draw();
