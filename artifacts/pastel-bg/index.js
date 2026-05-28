// ════════════════════════════════════════
//  COLORS
// ════════════════════════════════════════
const COLORS = [
  'FFFFFF','FF0000','00FF00','0000FF','FFFF00','00FFFF',
  'FF00FF','FF8000','FF4444','00FF80','8000FF','FF80FF',
  'FFD700','000000','FF6600','9900FF','00CCCC','0088FF',
  'FF0088','44FF44','555555','AAAAAA','F5F5F5','FFCC99',
];

// Build color grid
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

// ════════════════════════════════════════
//  BIO EDITOR
// ════════════════════════════════════════
const bioInput   = document.getElementById('bioInput');
const charCount  = document.getElementById('charCount');
const livePreview = document.getElementById('livePreview');

// Format buttons
document.querySelectorAll('.fmt-btn').forEach(btn => {
  btn.addEventListener('click', () => insertAtCursor(btn.dataset.tag));
});

// Popular chars
document.querySelectorAll('.pop-char').forEach(el => {
  el.addEventListener('click', () => insertAtCursor(el.dataset.char));
});

function insertAtCursor(text) {
  if (bioInput.disabled) return;
  const start = bioInput.selectionStart;
  const end   = bioInput.selectionEnd;
  const val   = bioInput.value;
  bioInput.value = val.slice(0, start) + text + val.slice(end);
  const pos = start + text.length;
  bioInput.setSelectionRange(pos, pos);
  bioInput.focus();
  updatePreview();
  updateCharCount();
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
  let html = '';
  let color = null, bold = false, italic = false;

  const parts = text.split(/(\[[A-Fa-f0-9]{6}\]|\[b\]|\[\/b\]|\[i\]|\[\/i\])/g);

  parts.forEach(part => {
    if (/^\[[A-Fa-f0-9]{6}\]$/.test(part)) {
      color = '#' + part.slice(1, 7);
    } else if (part === '[b]')  { bold = true; }
    else if (part === '[/b]') { bold = false; }
    else if (part === '[i]')  { italic = true; }
    else if (part === '[/i]') { italic = false; }
    else if (part) {
      let style = '';
      if (color)  style += `color:${color};`;
      if (bold)   style += 'font-weight:bold;';
      if (italic) style += 'font-style:italic;';
      const safe = part.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      html += `<span style="${style}">${safe}</span>`;
    }
  });

  return html || '<span class="preview-placeholder">Bio preview will appear here…</span>';
}

// ════════════════════════════════════════
//  CONSOLE
// ════════════════════════════════════════
const consoleLog = document.getElementById('consoleLog');

const ICONS = {
  system: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01" stroke="#050510" stroke-width="2" stroke-linecap="round"/></svg>`,
  info:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01" stroke="#050510" stroke-width="2" stroke-linecap="round"/></svg>`,
  success:`<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5" stroke="#050510" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  error:  `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6" stroke="#050510" stroke-width="2" stroke-linecap="round"/></svg>`,
  data:   `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16M4 10h16M4 14h10M4 18h7"/></svg>`,
};

function clog(type, msg, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.className = `log-line log-${type}`;
      line.innerHTML = `<span class="log-icon">${ICONS[type] || ICONS.info}</span><span class="log-msg">${msg}</span>`;
      consoleLog.appendChild(line);
      consoleLog.scrollTop = consoleLog.scrollHeight;
      resolve();
    }, delay);
  });
}

function clogRow(key, value, delay = 0) {
  return clog('data', `<span class="log-key">${key}:</span><span class="log-val">${escHtml(String(value))}</span>`, delay);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Boot sequence
async function bootConsole() {
  await clog('system', 'Initializing…');
  await clog('info',   'Finishing post initialize', 1400);
  await new Promise(r => setTimeout(r, 2600));
  await clog('success','Api Connected');
  enableUI();
}

function enableUI() {
  bioInput.disabled     = false;
  accessToken.disabled  = false;
  updateBtn.disabled    = false;
}

bootConsole();

// ════════════════════════════════════════
//  UPDATE BIO
// ════════════════════════════════════════
const accessToken = document.getElementById('accessToken');
const updateBtn   = document.getElementById('updateBtn');
const btnLabel    = document.getElementById('btnLabel');
const btnSpinner  = document.getElementById('btnSpinner');
const tokenErr    = document.getElementById('tokenErr');
const bioErr      = document.getElementById('bioErr');

updateBtn.addEventListener('click', async () => {
  tokenErr.classList.add('hidden');
  bioErr.classList.add('hidden');

  const token = accessToken.value.trim();
  const bio   = bioInput.value.trim();

  let invalid = false;
  if (!token) { tokenErr.classList.remove('hidden'); invalid = true; }
  if (!bio)   { bioErr.classList.remove('hidden');   invalid = true; }
  if (invalid) return;

  // Processing state
  updateBtn.disabled = true;
  btnLabel.textContent = 'Processing…';
  btnSpinner.classList.remove('hidden');

  await clog('info', 'Sending request…');

  const url = `http://bio.thug4ff.xyz/update_bio?access_token=${encodeURIComponent(token)}&bio=${encodeURIComponent(bio)}&key=thug4ffe`;

  try {
    const res  = await fetch(url);
    const data = await res.json();

    if (data.status === 'success') {
      await clogRow('Nickname', data.nickname,  0);
      await clogRow('UID',      data.uid,       150);
      await clogRow('Region',   data.region?.toUpperCase() || '—', 300);
      await clogRow('Platform', data.platform,  450);
      await clogRow('New Bio',  data.bio,       600);
      await clog('success', 'SUCCESS', 750);
    } else if (data.status === 'error' || data.status_code === 400) {
      await clog('error', 'Error: 404 — Make Sure Your Token Is Correct.');
    } else {
      await clog('error', 'Server Error 404');
    }
  } catch (err) {
    if (err instanceof TypeError && err.message.includes('fetch')) {
      await clog('error', 'Network Error — Check connection or token.');
    } else {
      await clog('error', 'Server Error 404');
    }
  }

  updateBtn.disabled = false;
  btnLabel.textContent = '𝐔𝐩𝐝𝐚𝐭𝐞 𝐁𝐢𝐨';
  btnSpinner.classList.add('hidden');
});

// ════════════════════════════════════════
//  PROTECTION
// ════════════════════════════════════════
const toastEl = document.getElementById('toast');
let toastTimer = null;
function showToast() {
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}
document.addEventListener('contextmenu', e => { e.preventDefault(); showToast(); });
document.addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (e.key==='F12' || (ctrl&&e.shiftKey&&['i','j','c','k'].includes(k)) || (ctrl&&k==='u')) {
    e.preventDefault(); e.stopPropagation(); showToast();
  }
}, true);

// ════════════════════════════════════════
//  CURSOR
// ════════════════════════════════════════
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my,dx=mx,dy=my;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
const neonPairs=[['#5bc8ff','#a78bff'],['#ff6fcf','#ffb347'],['#00ffcc','#5bc8ff'],['#b57fff','#ff6fcf'],['#fff176','#00ffcc']];
let ci=0;
setInterval(()=>{ ci=(ci+1)%neonPairs.length; const[c1,c2]=neonPairs[ci]; dot.style.boxShadow=`0 0 6px 2px #fff,0 0 14px 4px ${c1},0 0 28px 8px ${c2}`; ring.style.borderColor=c1+'cc'; ring.style.boxShadow=`0 0 10px 2px ${c1}99,0 0 22px 5px ${c2}44`; },1200);

// ════════════════════════════════════════
//  SPARK CANVAS
// ════════════════════════════════════════
const canvas=document.getElementById('sparkCanvas');
const ctx=canvas.getContext('2d');
function resize(){canvas.width=innerWidth;canvas.height=innerHeight;}
resize(); window.addEventListener('resize',resize);
const sparks=[];
const COLS=['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#fff176','#82b0ff'];
function addSpark(x,y){ const a=Math.random()*Math.PI*2,s=0.5+Math.random()*1.8; sparks.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:1.5+Math.random()*2.5,life:1,decay:0.013+Math.random()*0.016,colour:COLS[Math.floor(Math.random()*COLS.length)]}); }

// Click ripple
const rippleCols=['#5bc8ff','#b57fff','#ff6fcf','#00ffcc','#ffd600'];
let ri=0;
document.addEventListener('click',e=>{
  const col=rippleCols[ri++%rippleCols.length];
  [0,1,2].forEach(i=>{ const el=document.createElement('div'); el.className='ripple'; const s=(90+i*55)+Math.random()*30; el.style.cssText=`left:${e.clientX}px;top:${e.clientY}px;width:${s}px;height:${s}px;border:2px solid ${col};box-shadow:0 0 10px 2px ${col}88;animation-delay:${i*0.07}s;animation-duration:${0.6+i*0.08}s;`; document.body.appendChild(el); el.addEventListener('animationend',()=>el.remove()); });
  for(let i=0;i<14;i++) addSpark(e.clientX,e.clientY);
});

// Main loop
let lx=mx,ly=my;
function loop(){
  requestAnimationFrame(loop);
  rx+=(mx-rx)*0.1; ry+=(my-ry)*0.1;
  dx+=(mx-dx)*0.55; dy+=(my-dy)*0.55;
  dot.style.left=dx+'px'; dot.style.top=dy+'px';
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  const moved=Math.hypot(mx-lx,my-ly);
  if(moved>2){ const n=Math.min(Math.floor(moved/3),5); for(let i=0;i<n;i++) addSpark(mx,my); lx=mx;ly=my; }
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let i=sparks.length-1;i>=0;i--){ const s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=0.04; s.life-=s.decay; if(s.life<=0){sparks.splice(i,1);continue;} ctx.save(); ctx.globalAlpha=s.life; ctx.shadowBlur=12; ctx.shadowColor=s.colour; ctx.fillStyle=s.colour; ctx.beginPath(); ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2); ctx.fill(); ctx.restore(); }
}
loop();
