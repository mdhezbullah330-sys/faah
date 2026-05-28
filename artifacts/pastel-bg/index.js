// ── Toast ────────────────────────────────────────────────
const toast = document.getElementById('toast');
let toastTimer = null;

function showToast() {
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

// Block right-click
document.addEventListener('contextmenu', e => { e.preventDefault(); showToast(); });

// Block devtools shortcuts
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (
    e.key === 'F12' ||
    (ctrl && e.shiftKey && ['i','j','c','k'].includes(k)) ||
    (ctrl && k === 'u')
  ) {
    e.preventDefault(); e.stopPropagation(); showToast();
  }
}, true);

// ── Cursor ───────────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = innerWidth/2, my = innerHeight/2;
let rx = mx, ry = my, dx = mx, dy = my;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

const neonPairs = [
  ['#5bc8ff','#a78bff'],['#ff6fcf','#ffb347'],
  ['#00ffcc','#5bc8ff'],['#b57fff','#ff6fcf'],['#fff176','#00ffcc'],
];
let ci = 0;
setInterval(() => {
  ci = (ci + 1) % neonPairs.length;
  const [c1,c2] = neonPairs[ci];
  dot.style.boxShadow  = `0 0 6px 2px #fff,0 0 14px 4px ${c1},0 0 28px 8px ${c2}`;
  ring.style.borderColor = c1 + 'cc';
  ring.style.boxShadow   = `0 0 10px 2px ${c1}99,0 0 22px 5px ${c2}44,inset 0 0 10px 2px ${c1}33`;
}, 1200);

// ── Spark Canvas ──────────────────────────────────────────
const canvas = document.getElementById('sparkCanvas');
const ctx    = canvas.getContext('2d');
function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
resize();
window.addEventListener('resize', resize);

const sparks = [];
const COLS = ['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#fff176','#82b0ff'];

function addSpark(x, y) {
  const a = Math.random() * Math.PI * 2, s = 0.5 + Math.random() * 1.8;
  sparks.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, r: 1.5+Math.random()*2.5, life:1, decay:0.013+Math.random()*0.016, colour: COLS[Math.floor(Math.random()*COLS.length)] });
}

// ── Click Ripple ──────────────────────────────────────────
const rippleCols = ['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#ffd600'];
let ri = 0;

document.addEventListener('click', e => {
  const col = rippleCols[ri++ % rippleCols.length];
  [0,1,2].forEach(i => {
    const el = document.createElement('div');
    el.className = 'ripple';
    const s = (100 + i * 60) + Math.random() * 40;
    el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;border:2px solid ${col};box-shadow:0 0 10px 2px ${col}88,inset 0 0 8px 2px ${col}33;animation-delay:${i*0.07}s;animation-duration:${0.6+i*0.08}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  });
  for (let i = 0; i < 16; i++) addSpark(e.clientX, e.clientY);
});

// ── Main Loop ─────────────────────────────────────────────
let lx = mx, ly = my;
function loop() {
  requestAnimationFrame(loop);
  rx += (mx-rx)*0.1; ry += (my-ry)*0.1;
  dx += (mx-dx)*0.55; dy += (my-dy)*0.55;
  dot.style.left  = dx+'px'; dot.style.top  = dy+'px';
  ring.style.left = rx+'px'; ring.style.top = ry+'px';

  const moved = Math.hypot(mx-lx, my-ly);
  if (moved > 2) {
    const n = Math.min(Math.floor(moved/3), 5);
    for (let i=0;i<n;i++) addSpark(mx,my);
    lx=mx; ly=my;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let i=sparks.length-1;i>=0;i--) {
    const s=sparks[i];
    s.x+=s.vx; s.y+=s.vy; s.vy+=0.04; s.life-=s.decay;
    if (s.life<=0){sparks.splice(i,1);continue;}
    ctx.save();
    ctx.globalAlpha=s.life;
    ctx.shadowBlur=12; ctx.shadowColor=s.colour;
    ctx.fillStyle=s.colour;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
loop();
