// ══════════════════════════════════════════
//  COLOR GRID
// ══════════════════════════════════════════
const COLORS = [
  'FFFFFF','FF0000','00FF00','0000FF','FFFF00','00FFFF',
  'FF00FF','FF8000','FF4444','00FF80','8000FF','FF80FF',
  'FFD700','000000','FF6600','9900FF','00CCCC','0088FF',
  'FF0088','44FF44','555555','AAAAAA','F5F5F5','FFCC99',
];
const colorGrid = document.getElementById('colorGrid');
COLORS.forEach(hex => {
  const el = document.createElement('div');
  el.className = 'color-swatch';
  el.style.background = '#' + hex;
  el.dataset.hex = hex;
  el.title = '[' + hex + ']';
  el.addEventListener('click', () => insertAtCursor('[' + hex + ']'));
  colorGrid.appendChild(el);
});

// ══════════════════════════════════════════
//  BIO EDITOR
// ══════════════════════════════════════════
const bioInput    = document.getElementById('bioInput');
const charCount   = document.getElementById('charCount');
const livePreview = document.getElementById('livePreview');

document.querySelectorAll('.fmt-btn').forEach(btn => {
  btn.addEventListener('click', () => insertAtCursor(btn.dataset.tag));
});
document.querySelectorAll('.pop-char').forEach(el => {
  el.addEventListener('click', () => insertAtCursor(el.dataset.char));
});

function insertAtCursor(text) {
  if (bioInput.disabled) return;
  const s = bioInput.selectionStart, e = bioInput.selectionEnd;
  bioInput.value = bioInput.value.slice(0,s) + text + bioInput.value.slice(e);
  const pos = s + text.length;
  bioInput.setSelectionRange(pos, pos);
  bioInput.focus();
  updatePreview(); updateCharCount();
}

bioInput.addEventListener('input', () => { updatePreview(); updateCharCount(); });

function updateCharCount() {
  charCount.textContent = bioInput.value.length + '/180';
}

function updatePreview() {
  const raw = bioInput.value;
  if (!raw.trim()) {
    livePreview.innerHTML = '<span class="preview-placeholder">Bio preview will appear here…</span>';
    return;
  }
  livePreview.innerHTML = parseBio(raw);
}

function parseBio(text) {
  let html = '', color = null, bold = false, italic = false;
  const parts = text.split(/(\[[A-Fa-f0-9]{6}\]|\[b\]|\[\/b\]|\[i\]|\[\/i\])/g);
  parts.forEach(part => {
    if (/^\[[A-Fa-f0-9]{6}\]$/.test(part)) {
      color = '#' + part.slice(1,7);
    } else if (part === '[b]')  { bold = true;  }
      else if (part === '[/b]') { bold = false; }
      else if (part === '[i]')  { italic = true;  }
      else if (part === '[/i]') { italic = false; }
    else if (part) {
      // build inline style
      let style = 'font-family:\'Rajdhani\',sans-serif;';
      if (color) style += `color:${color};text-shadow:0 0 8px ${color}88;`;

      let cls = 'p-normal';
      if (bold && italic) {
        cls = 'p-bolditalic';
        style += 'font-weight:900;font-style:italic;font-size:1.12em;letter-spacing:0.04em;';
        if (!color) style += 'text-shadow:0 0 10px rgba(255,255,255,0.4);';
      } else if (bold) {
        cls = 'p-bold';
        style += 'font-weight:900;font-size:1.12em;letter-spacing:0.04em;';
        if (!color) style += 'text-shadow:0 0 10px rgba(255,255,255,0.4);';
      } else if (italic) {
        cls = 'p-italic';
        style += 'font-style:italic;font-weight:400;opacity:0.88;';
      } else {
        style += 'font-weight:400;';
      }

      const safe = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html += `<span class="${cls}" style="${style}">${safe}</span>`;
    }
  });
  return html || '<span class="preview-placeholder">Bio preview will appear here…</span>';
}

// ══════════════════════════════════════════
//  CONSOLE
// ══════════════════════════════════════════
const consoleLog = document.getElementById('consoleLog');

const ICONS = {
  system:  `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm.75 14.5h-1.5v-6h1.5v6zm0-7.5h-1.5V7.5h1.5V9z"/></svg>`,
  info:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><rect x="11" y="10" width="2" height="6" rx="1" fill="#030310"/><circle cx="12" cy="8" r="1" fill="#030310"/></svg>`,
  success: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M7.5 12.5l3 3 6-6" stroke="#030310" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`,
  error:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M9 9l6 6M15 9l-6 6" stroke="#030310" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
  warn:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 4l7.53 13H4.47L12 6zm-1 5v4h2v-4h-2zm0 5v2h2v-2h-2z"/></svg>`,
  data:    `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6H4M20 10H4M20 14H12M20 18H12M4 14h4v4H4z"/></svg>`,
};

function clog(type, msg) {
  return new Promise(resolve => {
    const line = document.createElement('div');
    line.className = `log-line log-${type}`;
    line.innerHTML = `<span class="log-icon">${ICONS[type]||ICONS.info}</span><span class="log-msg">${msg}</span>`;
    consoleLog.appendChild(line);
    consoleLog.scrollTop = consoleLog.scrollHeight;
    resolve();
  });
}

function clogKV(key, val) {
  return clog('data', `<span class="log-key">${escHtml(key)}: </span><span class="log-val">${escHtml(String(val))}</span>`);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Clear console
document.getElementById('clearConsole').addEventListener('click', () => {
  consoleLog.innerHTML = '';
  clog('system','Console cleared.');
});

// Boot
async function boot() {
  await clog('system','Initializing…');
  await delay(1400); await clog('info','Finishing post initialize');
  await delay(1300); await clog('success','Api Connected');
  enableUI();
}
function delay(ms){ return new Promise(r => setTimeout(r, ms)); }
function enableUI(){
  bioInput.disabled = false;
  accessToken.disabled = false;
  updateBtn.disabled = false;
}
boot();

// ══════════════════════════════════════════
//  UPDATE BIO
// ══════════════════════════════════════════
const accessToken = document.getElementById('accessToken');
const updateBtn   = document.getElementById('updateBtn');
const btnLabel    = document.getElementById('btnLabel');
const btnSpinner  = document.getElementById('btnSpinner');

updateBtn.addEventListener('click', async () => {
  const token = accessToken.value.trim();
  const bio   = bioInput.value.trim();
  let invalid = false;

  if (!token) {
    await clog('warn','Access token is empty — please enter your FF Access Token.');
    invalid = true;
  }
  if (!bio) {
    await clog('warn','Bio is empty — please write your bio first.');
    invalid = true;
  }
  if (invalid) return;

  updateBtn.disabled = true;
  updateBtn.classList.add('processing');
  btnLabel.textContent = 'Processing';
  btnSpinner.classList.remove('hidden');
  startDots();
  await clog('info','Sending request to server…');

  const url = `/api/proxy/update_bio?access_token=${encodeURIComponent(token)}&bio=${encodeURIComponent(bio)}`;

  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.status === 'success') {
      await clogKV('Nickname', data.nickname);
      await clogKV('UID',      data.uid);
      await clogKV('Region',   (data.region||'').toUpperCase());
      await clogKV('Platform', data.platform);
      await clogKV('New Bio',  data.bio);
      await clog('success','SUCCESS');
    } else if (data.status === 'error' || data.status_code === 400) {
      await clog('error','Error: 404 — Make Sure Your Token Is Correct.');
    } else {
      await clog('error','Server Error 404');
    }
  } catch {
    await clog('error','Network Error — Check connection or CORS policy.');
  }

  updateBtn.disabled = false;
  updateBtn.classList.remove('processing');
  stopDots();
  btnLabel.textContent = '𝐔𝐩𝐝𝐚𝐭𝐞 𝐁𝐢𝐨';
  btnSpinner.classList.add('hidden');
});

// ══════════════════════════════════════════
//  PROCESSING DOTS ANIMATION
// ══════════════════════════════════════════
let dotsTimer = null;
let dotsState = 0;
function startDots() {
  dotsState = 0;
  dotsTimer = setInterval(() => {
    dotsState = (dotsState + 1) % 4;
    btnLabel.textContent = 'Processing' + '.'.repeat(dotsState);
  }, 420);
}
function stopDots() {
  clearInterval(dotsTimer);
  dotsTimer = null;
}

// ══════════════════════════════════════════
//  FULLSCREEN
// ══════════════════════════════════════════
const fsBtn  = document.getElementById('fullscreenBtn');
const fsIcon = document.getElementById('fsIcon');
const exitPath = 'M5 16H8v3h3v-3H8v-3H5v3zm3-8H5v3h3V8H5v3h3V8zm6 11h3v-3h-3v3zm3-11h-3v3h3V8zm-3 8h3v-3h-3v3z';
const enterPath = 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z';

fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(()=>{});
  } else {
    document.exitFullscreen().catch(()=>{});
  }
});
document.addEventListener('fullscreenchange', () => {
  const full = !!document.fullscreenElement;
  fsIcon.querySelector('path').setAttribute('d', full ? exitPath : enterPath);
  fsBtn.classList.toggle('active', full);
});

// ══════════════════════════════════════════
//  CURSOR TOGGLE
// ══════════════════════════════════════════
const cursorToggleBtn = document.getElementById('cursorToggleBtn');
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let customCursor = true;

cursorToggleBtn.addEventListener('click', () => {
  customCursor = !customCursor;
  if (customCursor) {
    document.body.classList.remove('normal-cursor');
    dot.style.display = '';
    ring.style.display = '';
    cursorToggleBtn.classList.remove('active');
  } else {
    document.body.classList.add('normal-cursor');
    dot.style.display = 'none';
    ring.style.display = 'none';
    cursorToggleBtn.classList.add('active');
  }
});

// ══════════════════════════════════════════
//  PROTECTION
// ══════════════════════════════════════════
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast() {
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
document.addEventListener('contextmenu', e => { e.preventDefault(); showToast(); });
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase(), ctrl = e.ctrlKey || e.metaKey;
  if (e.key==='F12' || (ctrl&&e.shiftKey&&['i','j','c','k'].includes(k)) || (ctrl&&k==='u')) {
    e.preventDefault(); e.stopPropagation(); showToast();
  }
}, true);

// ══════════════════════════════════════════
//  CURSOR ANIMATION
// ══════════════════════════════════════════
let mx=innerWidth/2, my=innerHeight/2, rx=mx, ry=my, dx=mx, dy=my;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

const neonPairs=[['#5bc8ff','#a78bff'],['#ff6fcf','#ffb347'],['#00ffcc','#5bc8ff'],['#c084ff','#ff6fcf'],['#fde68a','#00ffcc']];
let ci=0;
setInterval(()=>{
  if(!customCursor) return;
  ci=(ci+1)%neonPairs.length;
  const [c1,c2]=neonPairs[ci];
  dot.style.boxShadow=`0 0 5px 2px #fff,0 0 12px 3px ${c1},0 0 26px 6px ${c2}`;
  ring.style.borderColor=c1+'cc';
  ring.style.boxShadow=`0 0 10px 2px ${c1}99,0 0 20px 5px ${c2}44`;
},1200);

// ══════════════════════════════════════════
//  SPARK CANVAS
// ══════════════════════════════════════════
const canvas = document.getElementById('sparkCanvas');
const ctx    = canvas.getContext('2d');
function resize(){ canvas.width=innerWidth; canvas.height=innerHeight; }
resize(); window.addEventListener('resize', resize);

const sparks=[];
const SCOLS=['#5bc8ff','#c084ff','#ff80cf','#00ffcc','#fde68a','#93c5fd'];

function addSpark(x,y){
  const a=Math.random()*Math.PI*2, s=0.4+Math.random()*1.8;
  sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.4+Math.random()*2.4,life:1,decay:0.013+Math.random()*0.016,c:SCOLS[Math.floor(Math.random()*SCOLS.length)]});
}

// Click ripple
const rippleCols=['#5bc8ff','#c084ff','#ff80cf','#00ffcc','#fde68a'];
let ri=0;
document.addEventListener('click', e => {
  const col=rippleCols[ri++%rippleCols.length];
  [0,1,2].forEach(i=>{
    const el=document.createElement('div');
    el.className='ripple';
    const s=(80+i*55)+Math.random()*28;
    el.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;border:1.5px solid ${col};box-shadow:0 0 10px 2px ${col}77,inset 0 0 8px 1px ${col}33;animation-delay:${i*0.07}s;animation-duration:${0.6+i*0.1}s;`;
    document.body.appendChild(el);
    el.addEventListener('animationend',()=>el.remove());
  });
  for(let i=0;i<14;i++) addSpark(e.clientX,e.clientY);
});

// Main loop
let lx=mx, ly=my;
function loop(){
  requestAnimationFrame(loop);
  rx+=(mx-rx)*0.1; ry+=(my-ry)*0.1;
  dx+=(mx-dx)*0.55; dy+=(my-dy)*0.55;
  if(customCursor){
    dot.style.left=dx+'px'; dot.style.top=dy+'px';
    ring.style.left=rx+'px'; ring.style.top=ry+'px';
  }
  const moved=Math.hypot(mx-lx,my-ly);
  if(moved>5){ const n=Math.min(Math.floor(moved/8),2); for(let i=0;i<n;i++) addSpark(mx,my); lx=mx;ly=my; }
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=sparks.length-1;i>=0;i--){
    const s=sparks[i];
    s.x+=s.vx; s.y+=s.vy; s.vy+=0.035; s.life-=s.decay;
    if(s.life<=0){sparks.splice(i,1);continue;}
    ctx.save();
    ctx.globalAlpha=s.life;
    ctx.shadowBlur=10; ctx.shadowColor=s.c;
    ctx.fillStyle=s.c;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}
loop();
