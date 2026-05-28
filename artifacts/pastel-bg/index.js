// ─── Cursor ───────────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');

let mx = window.innerWidth / 2,  my = window.innerHeight / 2;
let rx = mx, ry = my;
let dx = mx, dy = my;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

// Cursor colour cycling
const neonColours = [
  ['#5bc8ff','#a78bff'],
  ['#ff6fcf','#ffb347'],
  ['#00ffcc','#5bc8ff'],
  ['#b57fff','#ff6fcf'],
  ['#fff176','#00ffcc'],
];
let colIdx = 0;
setInterval(() => {
  colIdx = (colIdx + 1) % neonColours.length;
  const [c1, c2] = neonColours[colIdx];
  dot.style.boxShadow  = `0 0 6px 2px #fff, 0 0 14px 4px ${c1}, 0 0 30px 8px ${c2}`;
  ring.style.borderColor = c1 + 'cc';
  ring.style.boxShadow   =
    `0 0 10px 2px ${c1}99, 0 0 24px 6px ${c2}55, inset 0 0 12px 2px ${c1}33`;
}, 1200);

// ─── Spark Canvas ─────────────────────────────────────────
const canvas = document.getElementById('sparkCanvas');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const sparks = [];
const SPARK_COLOURS = ['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#fff176','#82b0ff'];

function addSpark(x, y) {
  const angle  = Math.random() * Math.PI * 2;
  const speed  = 0.6 + Math.random() * 1.8;
  sparks.push({
    x, y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    r:  2 + Math.random() * 3,
    life: 1,
    decay: 0.012 + Math.random() * 0.018,
    colour: SPARK_COLOURS[Math.floor(Math.random() * SPARK_COLOURS.length)],
  });
}

let lastMx = mx, lastMy = my;

// ─── Main loop ────────────────────────────────────────────
function loop() {
  requestAnimationFrame(loop);

  // Smooth cursor
  const ease = 0.1;
  rx += (mx - rx) * ease;
  ry += (my - ry) * ease;
  dx += (mx - dx) * 0.55;
  dy += (my - dy) * 0.55;

  dot.style.left = dx + 'px';
  dot.style.top  = dy + 'px';
  ring.style.left = rx + 'px';
  ring.style.top  = ry + 'px';

  // Spawn sparks when mouse moves
  const moved = Math.hypot(mx - lastMx, my - lastMy);
  if (moved > 2) {
    const count = Math.min(Math.floor(moved / 3), 6);
    for (let i = 0; i < count; i++) addSpark(mx, my);
    lastMx = mx; lastMy = my;
  }

  // Draw sparks
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x  += s.vx;
    s.y  += s.vy;
    s.vy += 0.04; // gravity
    s.life -= s.decay;

    if (s.life <= 0) { sparks.splice(i, 1); continue; }

    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.shadowBlur  = 14;
    ctx.shadowColor = s.colour;
    ctx.fillStyle   = s.colour;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

loop();
