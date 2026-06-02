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
let heartData = {};
try { heartData = JSON.parse(localStorage.getItem("bubu_heart") || "{}"); } catch(ex) {}
let heartTarget = -1;
let lbSrc       = "";

/* ── MUSIC ────────────────────────────────── */
let musicOn     = false;

/* ── PHOTO SLOTS ──────────────────────────── */
// Files: foto1.jpg (or .webp) placed in project root
const PHOTO_SLOTS = [
  "foto1.jpg",  "foto2.webp",  "foto3.webp", "foto4.jpg",
  "foto5.jpg",  "foto6.jpg",   "foto7.jpg",  "foto8.jpg",
  "foto9.jpg",  "foto10.jpg",  "foto11.jpg", "foto12.jpg",
  "foto13.jpg"
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
  // Always force-load from PHOTO_SLOTS — ignore localStorage for local files
  PHOTO_SLOTS.forEach((src, idx) => {
    if (!heartData[idx]) heartData[idx] = {};
    heartData[idx].src = src;
    setHeartPhoto(idx, src);
  });
  try { localStorage.setItem("bubu_heart", JSON.stringify(heartData)); } catch(ex) {}
}


/* ============================================
   HEART GALLERY
   ============================================ */
function initPhotosPage() {
  initPetals("petals-photos");
  // Re-apply all photos when entering the page
  PHOTO_SLOTS.forEach((src, idx) => {
    setHeartPhoto(idx, heartData[idx]?.src || src);
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
  
  let finalSrc = src;
  if (src && !src.startsWith("data:") && !src.includes("?")) {
    finalSrc = src + "?v=" + Date.now();
  }
  
  imgEl.src = finalSrc;
  imgEl.classList.remove("hidden");
  if (ph) ph.style.display = "none";

  // If image fails to load, try other extensions
  imgEl.onerror = function() {
    const baseName = src.replace(/\.[^.]+$/, "");
    const tried = src.replace(/\?.*$/, "");
    const extsToTry = ["jpg","jpeg","webp","png","JPG"];
    for (const ext of extsToTry) {
      const candidate = baseName + "." + ext;
      if (candidate !== tried) {
        imgEl.onerror = null; // prevent infinite loop
        imgEl.src = candidate + "?v=" + Date.now();
        return;
      }
    }
    // If all fail, still show placeholder
    imgEl.classList.add("hidden");
    if (ph) ph.style.display = "";
  };
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
   MUSIC — YouTube IFrame Player API
   Video: https://youtu.be/vhVBWw6rId0
   ============================================ */
let ytPlayer = null;
let ytReady  = false;
let ytPendingPlay = false;

// Load YouTube IFrame API
function loadYouTubeAPI() {
  if (document.getElementById("yt-api-script")) return;
  const tag = document.createElement("script");
  tag.id  = "yt-api-script";
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}

// Called automatically by YouTube API when ready
window.onYouTubeIframeAPIReady = function() {
  // Create a hidden container for the player
  let container = document.getElementById("yt-player-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "yt-player-container";
    container.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
    document.body.appendChild(container);
    const div = document.createElement("div");
    div.id = "yt-player";
    container.appendChild(div);
  }

  ytPlayer = new YT.Player("yt-player", {
    videoId: "vhVBWw6rId0",
    playerVars: {
      autoplay: 0,
      loop: 1,
      playlist: "vhVBWw6rId0",  // required for loop
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1
    },
    events: {
      onReady: function(e) {
        ytReady = true;
        e.target.setVolume(80);
        if (ytPendingPlay) {
          ytPendingPlay = false;
          startMusic();
        }
      },
      onStateChange: function(e) {
        // When video ends, loop it
        if (e.data === YT.PlayerState.ENDED) {
          e.target.seekTo(0);
          e.target.playVideo();
        }
      }
    }
  });
};

// Load API on page load
loadYouTubeAPI();

function toggleMusic() {
  musicOn ? stopMusic() : startMusic();
}

function startMusic() {
  if (!ytReady) {
    ytPendingPlay = true;
    loadYouTubeAPI();
    return;
  }
  try {
    ytPlayer.playVideo();
  } catch(e) {}
  musicOn = true;
  setMusicUI(true);
}

function stopMusic() {
  musicOn = false;
  try {
    if (ytPlayer && ytReady) ytPlayer.pauseVideo();
  } catch(e) {}
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
