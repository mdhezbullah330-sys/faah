// ── Devtools & Right-Click Block ────────────────────────
function showToast() {
  const t = document.getElementById('toast');
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}

document.addEventListener('contextmenu', e => { e.preventDefault(); showToast(); });

document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  const shift = e.shiftKey;

  const blocked =
    e.key === 'F12' ||
    (ctrl && shift && ['i','j','c'].includes(key)) ||
    (ctrl && key === 'u') ||
    (ctrl && shift && key === 'k');

  if (blocked) { e.preventDefault(); e.stopPropagation(); showToast(); }
}, true);

// Extra: devtools open detection (size-based heuristic)
setInterval(() => {
  const threshold = 160;
  if (window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold) {
    document.body.style.filter = 'blur(12px)';
  } else {
    document.body.style.filter = '';
  }
}, 800);

// ── Cursor ──────────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = innerWidth/2, my = innerHeight/2;
let rx = mx, ry = my, dx = mx, dy = my;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

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
  dot.style.boxShadow  = `0 0 6px 2px #fff,0 0 14px 4px ${c1},0 0 30px 8px ${c2}`;
  ring.style.borderColor = c1 + 'cc';
  ring.style.boxShadow   = `0 0 10px 2px ${c1}99,0 0 24px 6px ${c2}55,inset 0 0 12px 2px ${c1}33`;
}, 1200);

// ── Spark Canvas ─────────────────────────────────────────
const canvas = document.getElementById('sparkCanvas');
const ctx    = canvas.getContext('2d');

function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize();
window.addEventListener('resize', resize);

const sparks = [];
const COLOURS = ['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#fff176','#82b0ff'];

function addSpark(x, y, count = 4) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 0.6 + Math.random() * 2;
    sparks.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, r: 2+Math.random()*3, life:1, decay:0.012+Math.random()*0.018, colour: COLOURS[Math.floor(Math.random()*COLOURS.length)] });
  }
}

let lastMx = mx, lastMy = my;

// ── Click Ripple ─────────────────────────────────────────
const rippleColours = ['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#ffd600'];
let rippleIdx = 0;

document.addEventListener('click', e => {
  const col = rippleColours[rippleIdx++ % rippleColours.length];
  const size = 180 + Math.random() * 100;

  for (let i = 0; i < 3; i++) {
    const el = document.createElement('div');
    el.className = 'ripple';
    const s = size * (0.4 + i * 0.35);
    el.style.cssText = `
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      width: ${s}px;
      height: ${s}px;
      border: 2px solid ${col};
      box-shadow: 0 0 12px 3px ${col}88, inset 0 0 10px 2px ${col}44;
      animation-delay: ${i * 0.08}s;
      animation-duration: ${0.65 + i * 0.1}s;
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }

  // Burst sparks on click
  for (let i = 0; i < 18; i++) addSpark(e.clientX, e.clientY, 1);
});

// ── Main Loop ─────────────────────────────────────────────
function loop() {
  requestAnimationFrame(loop);

  rx += (mx - rx) * 0.1;
  ry += (my - ry) * 0.1;
  dx += (mx - dx) * 0.55;
  dy += (my - dy) * 0.55;

  dot.style.left = dx + 'px'; dot.style.top = dy + 'px';
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';

  const moved = Math.hypot(mx - lastMx, my - lastMy);
  if (moved > 2) {
    const n = Math.min(Math.floor(moved / 3), 6);
    for (let i = 0; i < n; i++) addSpark(mx, my, 1);
    lastMx = mx; lastMy = my;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.vy += 0.04; s.life -= s.decay;
    if (s.life <= 0) { sparks.splice(i,1); continue; }
    ctx.save();
    ctx.globalAlpha = s.life;
    ctx.shadowBlur = 14; ctx.shadowColor = s.colour;
    ctx.fillStyle = s.colour;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

loop();
