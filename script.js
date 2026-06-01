/* ============================================
   BUBU 20th BIRTHDAY — script.js
   ============================================ */

/* ── PASSWORD ─────────────────────────────── */
// Password: tanggal spesial kita 💗
const _k = ['0','2','0','9','2','0','2','5'];
let   _p = [];

function npPress(d) {
  if (_p.length >= _k.length) return;
  _p.push(d);
  updateDots();
  // Auto-submit when full
  if (_p.length === _k.length) setTimeout(npSubmit, 220);
}

function npDelete() {
  if (_p.length === 0) return;
  _p.pop();
  updateDots();
  clearError();
}

function updateDots() {
  for (let i = 0; i < _k.length; i++) {
    const dot = document.getElementById('d' + i);
    if (dot) dot.classList.toggle('filled', i < _p.length);
  }
}

function npSubmit() {
  if (_p.join('') === _k.join('')) {
    // ✅ Correct — unlock with celebration
    const lockIcon = document.querySelector('.lock-icon');
    if (lockIcon) lockIcon.textContent = '🔓';
    setTimeout(() => {
      currentPage = 'page-lock';
      goTo('page-home');
    }, 400);
  } else {
    // ❌ Wrong — shake & reset
    const dots = document.getElementById('pin-dots');
    const err  = document.getElementById('lock-error');
    if (dots) { dots.classList.remove('shake'); void dots.offsetWidth; dots.classList.add('shake'); }
    if (err)  { err.textContent = 'Kode salah, coba lagi ya sayang 💗'; }
    setTimeout(() => {
      _p = [];
      updateDots();
      if (dots) dots.classList.remove('shake');
    }, 500);
  }
}

// Also allow keyboard input on lock screen
document.addEventListener('keydown', e => {
  if (currentPage !== 'page-lock') return;
  if (e.key >= '0' && e.key <= '9') npPress(e.key);
  if (e.key === 'Backspace') npDelete();
  if (e.key === 'Enter') npSubmit();
});

function clearError() {
  const err = document.getElementById('lock-error');
  if (err) err.textContent = '';
}

/* ── DATA ─────────────────────────────────── */
let heartData   = JSON.parse(localStorage.getItem("bubu_heart") || "{}");
let heartTarget = -1;
let lbSrc       = "";

/* ── MUSIC ────────────────────────────────── */
let musicOn     = false;
let audioCtx    = null;
let musicStopFn = null;

/* ── PHOTO SLOTS ──────────────────────────── */
// Files: foto1.jpg (or .webp) placed in project root
const PHOTO_SLOTS = [
  {name:"foto1",  ext:"jpg"},  {name:"foto2",  ext:"webp"},
  {name:"foto3",  ext:"webp"}, {name:"foto4",  ext:"jpg"},
  {name:"foto5",  ext:"jpg"},  {name:"foto6",  ext:"jpg"},
  {name:"foto7",  ext:"jpg"},  {name:"foto8",  ext:"jpg"},
  {name:"foto9",  ext:"jpg"},  {name:"foto10", ext:"jpg"},
  {name:"foto11", ext:"jpg"},  {name:"foto12", ext:"jpg"},
  {name:"foto13", ext:"jpg"},
];
const EXTS = ["jpg","jpeg","png","webp"];


/* ============================================
   PAGE NAVIGATION
   ============================================ */
let currentPage = "page-lock";

function goTo(pageId) {
  const from = document.getElementById(currentPage);
  const to   = document.getElementById(pageId);
  if (!from || !to) return;

  from.classList.add("page-exit");
  setTimeout(() => {
    from.classList.remove("page-active","page-exit");
    to.classList.add("page-active");
    currentPage = pageId;

    if (pageId === "page-photos")  initPhotosPage();
    if (pageId === "page-message") initMessagePage();
    if (pageId === "page-menu")    initPetals("petals-menu");
  }, 500);
}


/* ============================================
   DOMContentLoaded
   ============================================ */
window.addEventListener("DOMContentLoaded", () => {
  initPetals("petals-lock");   // lock page petals
  initPetals("petals-home");
  autoLoadPhotos();
  setTimeout(() => launchConfetti(), 300);

  // Align scrollable pages to top
  ["page-photos","page-message"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.alignItems = "flex-start";
  });

  // Float player hidden by default
  const fp = document.getElementById("float-player");
  if (fp) fp.style.display = "none";
});


/* ============================================
   PETALS
   ============================================ */
function initPetals(id) {
  const c = document.getElementById(id);
  if (!c || c._petals) return;
  c._petals = true;
  const emojis = ["🌸","🌷","🌺","💗","✿","🌹"];
  setInterval(() => {
    const el = document.createElement("span");
    el.className = "petal";
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    el.style.left = Math.random() * 100 + "vw";
    el.style.fontSize = (.7 + Math.random() * .9) + "rem";
    const dur = 6 + Math.random() * 6;
    el.style.animationDuration = dur + "s";
    el.style.animationDelay    = (Math.random() * 3) + "s";
    c.appendChild(el);
    setTimeout(() => el.remove(), (dur + 4) * 1000);
  }, 850);
}


/* ============================================
   AUTO-LOAD LOCAL PHOTOS INTO HEART
   ============================================ */
function autoLoadPhotos() {
  PHOTO_SLOTS.forEach(({name, ext}, idx) => {
    const tryLoad = (exts, i) => {
      if (i >= exts.length) return;
      const img = new Image();
      const src = `${name}.${exts[i]}`;
      img.onload = () => {
        if (!heartData[idx] || !heartData[idx].src) {
          if (!heartData[idx]) heartData[idx] = {};
          heartData[idx].src = src;
          setHeartPhoto(idx, src);
        }
      };
      img.onerror = () => tryLoad(exts, i + 1);
      img.src = src;
    };
    // Try exact ext first, then fallbacks
    const fallbacks = [ext, ...EXTS.filter(e => e !== ext)];
    tryLoad(fallbacks, 0);
  });
}


/* ============================================
   HEART GALLERY
   ============================================ */
function initPhotosPage() {
  initPetals("petals-photos");
  Object.entries(heartData).forEach(([idx, d]) => {
    if (d.src) setHeartPhoto(parseInt(idx), d.src);
  });
}

function clickHeart(idx) {
  const imgEl = document.getElementById(`hi-${idx}`);
  const hasSrc = imgEl && !imgEl.classList.contains("hidden") && imgEl.src && imgEl.src !== window.location.href;

  if (hasSrc) {
    openLb(imgEl.src);
  } else {
    heartTarget = idx;
    document.getElementById("heart-file").click();
  }
}

function handleHeartUpload(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  if (file.size > 12 * 1024 * 1024) { alert("Max ukuran foto 12MB ya 😊"); return; }

  const reader = new FileReader();
  reader.onload = ev => {
    const src = ev.target.result;
    setHeartPhoto(heartTarget, src);
    if (!heartData[heartTarget]) heartData[heartTarget] = {};
    heartData[heartTarget].src = src;
    try { localStorage.setItem("bubu_heart", JSON.stringify(heartData)); } catch(ex) {}
    openLb(src);
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}

function setHeartPhoto(idx, src) {
  const imgEl = document.getElementById(`hi-${idx}`);
  if (!imgEl) return;
  const ph = imgEl.parentElement.querySelector(".hs-ph-sq");
  imgEl.src = src;
  imgEl.classList.remove("hidden");
  if (ph) ph.style.display = "none";
}


/* ============================================
   MESSAGE PAGE — auto-play on open
   ============================================ */
function initMessagePage() {
  initPetals("petals-message");

  // Show floating player
  const fp = document.getElementById("float-player");
  if (fp) fp.style.display = "flex";

  // Auto-play music
  if (!musicOn) startMusic();
}


/* ============================================
   LIGHTBOX
   ============================================ */
function openLb(src) {
  document.getElementById("lb-img").src = src;
  document.getElementById("lightbox").classList.remove("hidden");
}
function closeLb() {
  document.getElementById("lightbox").classList.add("hidden");
}
document.addEventListener("keydown", e => { if (e.key === "Escape") closeLb(); });


/* ============================================
   MUSIC — Happy Birthday (Web Audio API)
   ============================================ */
const HBD = [
  {f:392.00,d:.30},{f:392.00,d:.10},
  {f:440.00,d:.40},{f:392.00,d:.40},{f:523.25,d:.40},{f:493.88,d:.80},
  {f:392.00,d:.30},{f:392.00,d:.10},
  {f:440.00,d:.40},{f:392.00,d:.40},{f:587.33,d:.40},{f:523.25,d:.80},
  {f:392.00,d:.30},{f:392.00,d:.10},
  {f:784.00,d:.40},{f:659.25,d:.40},{f:523.25,d:.40},{f:493.88,d:.40},{f:440.00,d:.40},
  {f:698.46,d:.30},{f:698.46,d:.10},
  {f:659.25,d:.40},{f:523.25,d:.40},{f:587.33,d:.40},{f:523.25,d:1.00},
];
const TOTAL_DUR = HBD.reduce((s,n) => s + n.d, 0);

function toggleMusic() {
  musicOn ? stopMusic() : startMusic();
}

function startMusic() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  musicOn = true;
  setMusicUI(true);
  playLoop();
}

function stopMusic() {
  musicOn = false;
  if (musicStopFn) { musicStopFn(); musicStopFn = null; }
  setMusicUI(false);
}

function setMusicUI(on) {
  const icon  = document.getElementById("player-icon");
  const bars  = document.getElementById("player-bars");
  const vinyl = document.getElementById("fp-vinyl");
  if (icon)  icon.textContent = on ? "⏸" : "▶";
  if (bars)  bars.classList.toggle("active", on);
  if (vinyl) vinyl.classList.toggle("paused", !on);
}

function playLoop() {
  if (!audioCtx || !musicOn) return;

  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0.2, audioCtx.currentTime);
  master.connect(audioCtx.destination);

  const delay = audioCtx.createDelay(.6);
  delay.delayTime.value = .32;
  const fb = audioCtx.createGain(); fb.gain.value = .18;
  delay.connect(fb); fb.connect(delay); delay.connect(master);

  let t = audioCtx.currentTime + .05;
  const oscs = [];

  HBD.forEach(note => {
    const o1 = audioCtx.createOscillator(); o1.type = "sine";     o1.frequency.value = note.f;
    const o2 = audioCtx.createOscillator(); o2.type = "triangle"; o2.frequency.value = note.f * 1.002;
    const g  = audioCtx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(1, t + .025);
    g.gain.setValueAtTime(1, t + note.d * .72);
    g.gain.exponentialRampToValueAtTime(.001, t + note.d);
    o1.connect(g); o2.connect(g); g.connect(master); g.connect(delay);
    o1.start(t); o1.stop(t + note.d);
    o2.start(t); o2.stop(t + note.d);
    oscs.push(o1, o2);
    t += note.d;
  });

  const loopTimer = setTimeout(() => { if (musicOn) playLoop(); }, (TOTAL_DUR + .5) * 1000);
  musicStopFn = () => {
    clearTimeout(loopTimer);
    oscs.forEach(o => { try { o.stop(); } catch(e) {} });
    master.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + .3);
  };
}


/* ============================================
   CONFETTI
   ============================================ */
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  const colors = ["#d4306a","#e8789a","#f0a8c0","#fce4ec","#d4a57a","#fff","#ffb3c6","#ff80ab"];
  const bits = Array.from({length:150}, () => ({
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height * .7,
    w: 5 + Math.random() * 9, h: 6 + Math.random() * 9,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 1.5 + Math.random() * 3.5,
    angle: Math.random() * Math.PI * 2,
    spin: (Math.random() - .5) * .12,
    drift: (Math.random() - .5) * 1.2,
    heart: Math.random() < .25,
  }));

  function drawHeart(c, cx, cy, r, col) {
    c.fillStyle = col; c.beginPath();
    c.moveTo(cx, cy + r * .3);
    c.bezierCurveTo(cx, cy, cx - r, cy, cx - r, cy + r * .3);
    c.bezierCurveTo(cx - r, cy + r * .7, cx, cy + r * 1.1, cx, cy + r * 1.4);
    c.bezierCurveTo(cx, cy + r * 1.1, cx + r, cy + r * .7, cx + r, cy + r * .3);
    c.bezierCurveTo(cx + r, cy, cx, cy, cx, cy + r * .3);
    c.fill();
  }

  let frame = 0; const FRAMES = 290;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const alpha = Math.max(0, 1 - frame / FRAMES);
    bits.forEach(b => {
      b.y += b.speed; b.x += b.drift; b.angle += b.spin;
      ctx.save(); ctx.globalAlpha = alpha;
      if (b.heart) { drawHeart(ctx, b.x, b.y, b.w * .7, b.color); }
      else {
        ctx.translate(b.x + b.w/2, b.y + b.h/2); ctx.rotate(b.angle);
        ctx.fillStyle = b.color; ctx.fillRect(-b.w/2, -b.h/2, b.w, b.h);
      }
      ctx.restore();
    });
    frame++;
    if (frame < FRAMES) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

window.addEventListener("resize", () => {
  const c = document.getElementById("confetti-canvas");
  if (c) { c.width = window.innerWidth; c.height = window.innerHeight; }
});
