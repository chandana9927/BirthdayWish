/* ================================================
   THE BIRTHDAY — ACROSS WORLDS
   script.js — Phase 1 + 2 + 3
   (Intro + Naruto + OnePiece + DBZ + DeathNote + AOT + JJK + Solo + Pokémon + HP)
   Pure Vanilla JS — no frameworks, no build step
   ================================================ */

'use strict';

// -----------------------------------------------
// UTILITY
// -----------------------------------------------
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// -----------------------------------------------
// TRANSITION HELPER
// -----------------------------------------------
const overlay = qs('#transition-overlay');

function fadeToBlack(duration = 600) {
  return new Promise(resolve => {
    overlay.style.transition = `opacity ${duration}ms ease`;
    overlay.classList.add('fade-in');
    setTimeout(resolve, duration);
  });
}

function fadeFromBlack(duration = 600) {
  return new Promise(resolve => {
    overlay.style.transition = `opacity ${duration}ms ease`;
    overlay.classList.remove('fade-in');
    setTimeout(resolve, duration);
  });
}

// -----------------------------------------------
// SCENE MANAGER
// -----------------------------------------------
let currentScene = null;

function showScene(id) {
  if (currentScene) {
    currentScene.classList.remove('active');
    currentScene.classList.add('hidden');
  }
  const next = qs(`#${id}`);
  next.classList.remove('hidden');
  // Force reflow
  void next.offsetHeight;
  next.classList.add('active');
  currentScene = next;
}

async function transitionTo(sceneId, onReady, delay = 0) {
  await fadeToBlack(500);
  if (delay) await sleep(delay);
  showScene(sceneId);
  if (onReady) onReady();
  await fadeFromBlack(600);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// -----------------------------------------------
// GLOBAL PARTICLE CANVAS
// -----------------------------------------------
const particleCanvas = qs('#particle-canvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
  particleCanvas.width  = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
  constructor(x, y, color, size, vx, vy, life) {
    this.x = x; this.y = y;
    this.color = color;
    this.size = size;
    this.vx = vx; this.vy = vy;
    this.life = life;
    this.maxLife = life;
    this.alpha = 1;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.03; // gravity
    this.life--;
    this.alpha = this.life / this.maxLife;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = clamp(this.alpha, 0, 1);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

let particleLoopActive = false;
function startParticleLoop() {
  if (particleLoopActive) return;
  particleLoopActive = true;
  function loop() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => { p.update(); p.draw(pCtx); });
    requestAnimationFrame(loop);
  }
  loop();
}
startParticleLoop();

// -----------------------------------------------
// CONFETTI SPAWNER
// -----------------------------------------------
function spawnConfetti(count = 60) {
  const colors = ['#f5c842','#ff6b00','#e63030','#ffffff','#3a9bdc','#44cc44','#cc44cc'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      particles.push(new Particle(
        rand(0, window.innerWidth),
        rand(-50, 0),
        colors[randInt(0, colors.length)],
        rand(2, 5),
        rand(-1.5, 1.5),
        rand(1, 3),
        randInt(120, 200)
      ));
    }, i * 40);
  }
}

// -----------------------------------------------
// SCENE 1 — INTRO SEQUENCE
// -----------------------------------------------
function runIntroScene() {
  const bootLines = qsa('.boot-line');
  const identityReveal = qs('#identity-reveal');
  const nameEl = qs('.protagonist-name');
  const birthdayMsg = qs('#birthday-message');
  const chapterReveal = qs('#chapter-reveal');
  const beginBtn = qs('#begin-btn');

  let t = 0;

  // Boot lines appear one by one
  bootLines.forEach((line, i) => {
    setTimeout(() => {
      line.classList.add('visible');
    }, t + i * 700);
  });
  t += bootLines.length * 700 + 400;

  // Hide boot, show name
  setTimeout(() => {
    qs('#boot-sequence').style.opacity = '0';
    qs('#boot-sequence').style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      qs('#boot-sequence').classList.add('hidden');
      identityReveal.classList.remove('hidden');
      void nameEl.offsetHeight;
      nameEl.classList.add('visible');

      // Confetti burst
      spawnConfetti(80);
    }, 500);
  }, t);
  t += 1000;

  // Birthday message
  setTimeout(() => {
    birthdayMsg.classList.remove('hidden');
    const titleEl = qs('.birthday-title');
    const subtitleEl = qs('.birthday-subtitle');
    void titleEl.offsetHeight;
    titleEl.classList.add('visible');
    setTimeout(() => subtitleEl.classList.add('visible'), 300);
    spawnConfetti(40);
  }, t);
  t += 1400;

  // Chapter reveal
  setTimeout(() => {
    chapterReveal.classList.remove('hidden');
    const labelEl = qs('.chapter-label');
    const titleEl = qs('.chapter-title');
    void labelEl.offsetHeight;
    labelEl.classList.add('visible');
    setTimeout(() => titleEl.classList.add('visible'), 200);
    setTimeout(() => beginBtn.classList.add('visible'), 600);
  }, t);

  // Button click
  beginBtn.addEventListener('click', async () => {
    beginBtn.disabled = true;
    await transitionTo('scene-naruto', initNarutoScene, 100);
  });
}

// -----------------------------------------------
// SCENE 2 — NARUTO
// -----------------------------------------------
function initNarutoScene() {
  const badge     = qs('#scene-naruto .chapter-badge');
  const scroll    = qs('#naruto-scroll');
  const letters   = qsa('#scene-naruto .letter-line');
  const nextBtn   = qs('#naruto-next');
  const smokeEl   = qs('#smoke-layer');

  spawnLeaves();

  let t = 300;

  setTimeout(() => {
    badge.classList.add('visible');
  }, t); t += 600;

  setTimeout(() => {
    scroll.classList.add('visible');
    smokeEl.classList.add('visible');

    // Stagger letter lines
    letters.forEach((line, i) => {
      setTimeout(() => {
        line.classList.add('visible');
      }, i * 250);
    });

    // Show next button after last line
    setTimeout(() => {
      nextBtn.classList.add('visible');
    }, letters.length * 250 + 400);

  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Leaf burst on exit
    spawnLeaves(true);
    await sleep(400);
    await transitionTo('scene-onepiece', initOnePieceScene, 100);
  });
}

function spawnLeaves(burst = false) {
  const container = qs('#leaves-container');
  container.innerHTML = '';
  const colors = ['#a8522a','#c4722a','#e8943a','#5c8c2a','#3a6c1a'];
  const count = burst ? 30 : 15;

  for (let i = 0; i < count; i++) {
    const leaf = document.createElement('div');
    leaf.className = 'leaf';
    const startX = rand(0, 100);
    const drift = rand(-15, 15);
    const duration = rand(3, 7);
    const delay = burst ? rand(0, 0.5) : rand(0, 3);
    const color = colors[randInt(0, colors.length)];

    leaf.style.cssText = `
      left: ${startX}%;
      background: ${color};
      --drift: ${drift}vw;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      transform: rotate(${rand(0,360)}deg);
      width: ${rand(10,20)}px;
      height: ${rand(6,12)}px;
    `;
    container.appendChild(leaf);

    // Remove after animation
    setTimeout(() => leaf.remove(), (duration + delay) * 1000 + 200);
  }
}

// -----------------------------------------------
// SCENE 3 — ONE PIECE
// -----------------------------------------------
function initOnePieceScene() {
  const badge   = qs('#scene-onepiece .chapter-badge');
  const line1   = qs('#op-line-1');
  const line2   = qs('#op-line-2');
  const nextBtn = qs('#onepiece-next');

  spawnWindParticles();

  let t = 400;

  setTimeout(() => badge.classList.add('visible'), t); t += 700;

  setTimeout(() => {
    line1.classList.add('visible');
    setTimeout(() => line2.classList.add('visible'), 600);
    setTimeout(() => nextBtn.classList.add('visible'), 1400);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    await transitionTo('scene-dbz', initDBZScene, 100);
  });
}

function spawnWindParticles() {
  const container = qs('#wind-particles');
  container.innerHTML = '';

  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    p.className = 'wind-particle';
    const size  = rand(2, 8);
    const startY = rand(10, 90);
    const vy    = rand(-3, 3);
    const dur   = rand(3, 7);
    const delay = rand(0, 4);
    const colors = ['rgba(255,255,255,0.4)','rgba(200,230,255,0.5)','rgba(255,240,180,0.3)'];

    p.style.cssText = `
      left: -10px;
      top: ${startY}%;
      width: ${size}px;
      height: ${size * 0.4}px;
      background: ${colors[randInt(0, colors.length)]};
      --vy: ${vy}vh;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      border-radius: 2px;
    `;
    container.appendChild(p);
  }
}

// -----------------------------------------------
// SCENE 4 — DRAGON BALL Z
// -----------------------------------------------
function initDBZScene() {
  const power1    = qs('#power-1');
  const barWrap   = qs('#power-bar-wrap');
  const bar       = qs('#power-bar');
  const power2    = qs('#power-2');
  const power3    = qs('#power-3');
  const power4    = qs('#power-4');
  const nextBtn   = qs('#dbz-next');
  const aura      = qs('#energy-aura');
  const flash     = qs('#white-flash');
  const dbzScene  = qs('#scene-dbz');

  spawnEnergyParticles();
  initLightningCanvas();

  let t = 500;

  // Step 1: "POWER LEVEL: LOADING…"
  setTimeout(() => {
    power1.classList.add('visible');
    barWrap.classList.add('visible');
    setTimeout(() => { bar.style.width = '100%'; }, 200);
  }, t); t += 800;

  // Step 2: Screen shake + "POWER-UP COMPLETE"
  setTimeout(() => {
    dbzScene.classList.add('shake');
    aura.style.animationPlayState = 'running';
    setTimeout(() => dbzScene.classList.remove('shake'), 500);

    power2.classList.remove('hidden');
    void power2.offsetHeight;
    power2.classList.add('visible');
    triggerLightning();
  }, t + 2600); t += 3400;

  // Step 3: Another shake + "NEW LEVEL UNLOCKED"
  setTimeout(() => {
    dbzScene.classList.add('shake');
    setTimeout(() => dbzScene.classList.remove('shake'), 500);

    power3.classList.remove('hidden');
    void power3.offsetHeight;
    power3.classList.add('visible');
    triggerLightning();
    spawnConfetti(30);
  }, t); t += 900;

  // Step 4: Big shake + "+1 YEAR"
  setTimeout(() => {
    dbzScene.classList.add('shake');
    setTimeout(() => dbzScene.classList.remove('shake'), 500);

    power4.classList.remove('hidden');
    void power4.offsetHeight;
    power4.classList.add('visible');
    triggerLightning(true);
    spawnConfetti(60);
  }, t); t += 1000;

  // Step 5: White flash
  setTimeout(() => {
    doWhiteFlash(flash, () => {
      nextBtn.classList.remove('hidden');
      void nextBtn.offsetHeight;
      nextBtn.classList.add('visible');
    });
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // DBZ white flash into Death Note (dramatic hard cut feel)
    await fadeToBlack(700);
    await transitionTo('scene-deathnote', initDeathNoteScene, 200);
  });
}

function doWhiteFlash(flashEl, callback) {
  flashEl.style.transition = 'opacity 0.15s ease';
  flashEl.style.opacity = '1';
  setTimeout(() => {
    flashEl.style.transition = 'opacity 1s ease';
    flashEl.style.opacity = '0';
    if (callback) setTimeout(callback, 600);
  }, 250);
}

function spawnEnergyParticles() {
  const container = qs('#energy-particles');
  container.innerHTML = '';

  const colors = ['#ffe033','#3a9bdc','#ffffff','#ff8800','#88ffff'];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.className = 'energy-particle';

    const size  = rand(3, 10);
    const startX = rand(20, 80);
    const startY = rand(40, 90);
    const ex = `${rand(-30, 30)}vw`;
    const ey = `${rand(-60, -10)}vh`;
    const dur = rand(1.5, 3.5);
    const delay = rand(0, 3);
    const color = colors[randInt(0, colors.length)];

    p.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      --ex: ${ex};
      --ey: ${ey};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(p);
  }
}

// -----------------------------------------------
// LIGHTNING CANVAS (DBZ)
// -----------------------------------------------
let lightningCtx = null;
let lightningActive = false;

function initLightningCanvas() {
  const canvas = qs('#lightning-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  lightningCtx = canvas.getContext('2d');
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

function triggerLightning(intense = false) {
  if (!lightningCtx) return;
  const count = intense ? 6 : 3;
  for (let i = 0; i < count; i++) {
    setTimeout(() => drawLightningBolt(lightningCtx, intense), i * 80);
  }
}

function drawLightningBolt(ctx, intense = false) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  const startX = rand(W * 0.2, W * 0.8);
  const endX   = startX + rand(-100, 100);
  const segments = randInt(5, 10);
  const color  = intense ? '#ffffff' : (Math.random() > 0.5 ? '#ffe033' : '#88ddff');

  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = color;
  ctx.lineWidth = intense ? rand(2, 4) : rand(1, 2.5);
  ctx.shadowColor = color;
  ctx.shadowBlur = intense ? 25 : 12;
  ctx.globalAlpha = 0.9;

  ctx.beginPath();
  ctx.moveTo(startX, 0);

  let cx = startX;
  for (let i = 0; i < segments; i++) {
    cx += rand(-60, 60);
    const y = (H / segments) * (i + 1);
    ctx.lineTo(clamp(cx, 0, W), y);
  }
  ctx.lineTo(endX, H);
  ctx.stroke();

  // Fade out
  let alpha = 0.9;
  const fade = setInterval(() => {
    alpha -= 0.15;
    if (alpha <= 0) {
      ctx.clearRect(0, 0, W, H);
      clearInterval(fade);
    } else {
      ctx.globalAlpha = alpha;
      ctx.stroke();
    }
  }, 30);
}

// -----------------------------------------------
// SCENE 5 — DEATH NOTE
// -----------------------------------------------
function initDeathNoteScene() {
  const badge    = qs('#scene-deathnote .chapter-badge');
  const protocol = qs('#dn-protocol');
  const dnSub    = qs('#dn-sub');
  const nextBtn  = qs('#dn-next');

  spawnFeathers();

  let t = 400;

  setTimeout(() => badge.classList.add('visible'), t); t += 700;

  setTimeout(() => {
    protocol.classList.add('visible');
    setTimeout(() => {
      dnSub.classList.add('visible');
      setTimeout(() => nextBtn.classList.add('visible'), 1200);
    }, 500);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Feathers accelerate, hard cut to AOT
    spawnFeathers(true);
    await sleep(300);
    await transitionTo('scene-aot', initAOTScene, 150);
  });
}

function spawnFeathers(burst = false) {
  const container = qs('#feathers-container');
  container.innerHTML = '';
  const count = burst ? 35 : 18;

  for (let i = 0; i < count; i++) {
    const feather = document.createElement('div');
    feather.className = 'feather';

    const startX  = rand(0, 100);
    const w       = rand(8, 22);
    const h       = w * rand(2.5, 3.5);
    const fr      = rand(-30, 30);
    const fdx     = rand(-8, 8);
    const fdx2    = rand(-15, 15);
    const dur     = burst ? rand(1.5, 3) : rand(5, 10);
    const delay   = burst ? rand(0, 0.4) : rand(0, 5);

    feather.style.cssText = `
      left: ${startX}%;
      --fr: ${fr}deg;
      --fdx: ${fdx}vw;
      --fdx2: ${fdx2}vw;
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
    `;
    // Use a child div for the feather shape
    const inner = document.createElement('div');
    inner.style.cssText = `
      width: ${w}px;
      height: ${h}px;
      background: radial-gradient(ellipse at 30% 40%, #3a1a5c, #0a0014);
      border-radius: 50% 10% 50% 10%;
      box-shadow: 0 0 8px rgba(120,60,220,0.4);
    `;
    feather.appendChild(inner);
    container.appendChild(feather);

    setTimeout(() => feather.remove(), (dur + delay) * 1000 + 300);
  }
}

// -----------------------------------------------
// SCENE 6 — ATTACK ON TITAN
// -----------------------------------------------
function initAOTScene() {
  const badge    = qs('#scene-aot .chapter-badge');
  const smoke    = qs('#aot-smoke-layer');
  const line1    = qs('#aot-line-1');
  const line2    = qs('#aot-line-2');
  const line3    = qs('#aot-line-3');
  const nextBtn  = qs('#aot-next');
  const aotScene = qs('#scene-aot');

  spawnEmbers();
  initAOTCanvas();

  let t = 400;

  setTimeout(() => {
    badge.classList.add('visible');
    smoke.classList.add('visible');
  }, t); t += 700;

  // "COURAGE" — with a shake
  setTimeout(() => {
    line1.classList.add('visible');
    aotScene.classList.add('aot-shake');
    setTimeout(() => aotScene.classList.remove('aot-shake'), 600);
  }, t); t += 900;

  // "KEEP MOVING FORWARD."
  setTimeout(() => {
    line2.classList.add('visible');
  }, t); t += 700;

  // "YOUR STORY IS FAR FROM OVER."
  setTimeout(() => {
    line3.classList.add('visible');
    setTimeout(() => nextBtn.classList.add('visible'), 600);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Wind accelerates — distort transition into JJK
    aotScene.classList.add('aot-shake');
    await sleep(300);
    await transitionTo('scene-jjk', initJJKScene, 200);
  });
}

function spawnEmbers() {
  const container = qs('#embers-container');
  container.innerHTML = '';
  const colors = ['#ff8800','#ffaa00','#ff5500','#ffcc44','#ffffff'];

  for (let i = 0; i < 35; i++) {
    const ember = document.createElement('div');
    ember.className = 'ember';

    const size   = rand(2, 7);
    const startX = rand(10, 90);
    const startY = rand(30, 90);
    const ex     = `${rand(-20, 20)}vw`;
    const ey     = `${rand(-50, -10)}vh`;
    const dur    = rand(2, 5);
    const delay  = rand(0, 4);
    const color  = colors[randInt(0, colors.length)];

    ember.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      --ex: ${ex};
      --ey: ${ey};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(ember);
  }
}

let aotCtx = null;

function initAOTCanvas() {
  const canvas = qs('#aot-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  aotCtx = canvas.getContext('2d');

  // Draw drifting wind streaks periodically
  let streakTimer = setInterval(() => {
    if (!qs('#scene-aot').classList.contains('active')) {
      clearInterval(streakTimer);
      return;
    }
    drawWindStreak(aotCtx);
  }, 600);
}

function drawWindStreak(ctx) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const y = rand(20, 80) / 100 * H;
  const len = rand(100, 350);
  const x = rand(-50, W * 0.6);

  ctx.save();
  ctx.strokeStyle = `rgba(220,170,80,${rand(0.04, 0.12)})`;
  ctx.lineWidth = rand(0.5, 2);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + len, y + rand(-5, 5));
  ctx.stroke();
  ctx.restore();

  // Fade it out
  setTimeout(() => {
    ctx.clearRect(x - 5, y - 10, len + 10, 20);
  }, rand(300, 800));
}

// -----------------------------------------------
// SCENE 7 — JUJUTSU KAISEN
// -----------------------------------------------
function initJJKScene() {
  const badge    = qs('#scene-jjk .chapter-badge');
  const potential = qs('#jjk-potential');
  const jjkSub   = qs('#jjk-sub');
  const nextBtn  = qs('#jjk-next');
  const jjkScene = qs('#scene-jjk');

  spawnJJKParticles();
  initJJKCanvas();

  let t = 300;

  setTimeout(() => badge.classList.add('visible'), t); t += 600;

  // "INFINITE POTENTIAL" dramatic reveal + shake
  setTimeout(() => {
    potential.classList.add('visible');
    jjkScene.classList.add('shake');
    setTimeout(() => jjkScene.classList.remove('shake'), 500);
    spawnConfetti(20); // small purple confetti
  }, t); t += 1000;

  setTimeout(() => {
    jjkSub.classList.add('visible');
    setTimeout(() => nextBtn.classList.add('visible'), 800);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // JJK energy collapses → darkness → Solo Leveling
    await fadeToBlack(900);
    await transitionTo('scene-solo', initSoloScene, 300);
  });
}

function spawnJJKParticles() {
  const container = qs('#jjk-particles');
  container.innerHTML = '';
  const colors = ['#a050ff','#6020cc','#c080ff','#4040ff','#80c0ff','#ffffff'];

  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    p.className = 'jjk-particle';

    const size   = rand(2, 9);
    const startX = rand(10, 90);
    const startY = rand(20, 90);
    const jx     = `${rand(-25, 25)}vw`;
    const jy     = `${rand(-55, -5)}vh`;
    const dur    = rand(1.5, 4);
    const delay  = rand(0, 3);
    const color  = colors[randInt(0, colors.length)];

    p.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 3}px ${color};
      --jx: ${jx};
      --jy: ${jy};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(p);
  }
}

let jjkCtx = null;

function initJJKCanvas() {
  const canvas = qs('#jjk-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  jjkCtx = canvas.getContext('2d');

  // Periodic chromatic flicker lines
  let jjkTimer = setInterval(() => {
    if (!qs('#scene-jjk').classList.contains('active')) {
      clearInterval(jjkTimer);
      return;
    }
    drawChromaticFlicker(jjkCtx);
  }, 400);
}

function drawChromaticFlicker(ctx) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  const y = rand(0, H);
  const h = rand(1, 4);

  ctx.save();
  ctx.globalAlpha = rand(0.03, 0.10);
  ctx.fillStyle = Math.random() > 0.5 ? 'rgba(160,80,255,1)' : 'rgba(80,180,255,1)';
  ctx.fillRect(0, y, W, h);
  ctx.restore();

  setTimeout(() => {
    ctx.clearRect(0, y - 1, W, h + 2);
  }, rand(80, 250));
}

// -----------------------------------------------
// SCENE 8 — SOLO LEVELING
// -----------------------------------------------
function initSoloScene() {
  const badge      = qs('#scene-solo .chapter-badge');
  const shadowLayer = qs('#solo-shadow-layer');
  const ariseEl    = qs('#solo-arise');
  const levelupEl  = qs('#solo-levelup');
  const yearEl     = qs('#solo-year');
  const skillBox   = qs('#solo-skill-box');
  const nextBtn    = qs('#solo-next');
  const soloScene  = qs('#scene-solo');

  spawnShadowParticles();
  initSoloCanvas();

  let t = 500;

  setTimeout(() => {
    badge.classList.add('visible');
    shadowLayer.classList.add('visible');
  }, t); t += 800;

  // "ARISE." — powerful impact
  setTimeout(() => {
    ariseEl.classList.remove('hidden');
    void ariseEl.offsetHeight;
    ariseEl.classList.add('visible');
    soloScene.classList.add('shake');
    setTimeout(() => soloScene.classList.remove('shake'), 500);
  }, t); t += 1200;

  // "LEVEL UP COMPLETE"
  setTimeout(() => {
    levelupEl.classList.remove('hidden');
    void levelupEl.offsetHeight;
    levelupEl.classList.add('visible');
  }, t); t += 800;

  // "+1 YEAR"
  setTimeout(() => {
    yearEl.classList.remove('hidden');
    void yearEl.offsetHeight;
    yearEl.classList.add('visible');
    soloScene.classList.add('shake');
    setTimeout(() => soloScene.classList.remove('shake'), 500);
    spawnConfetti(20);
  }, t); t += 1000;

  // Skill box
  setTimeout(() => {
    skillBox.classList.remove('hidden');
    void skillBox.offsetHeight;
    skillBox.classList.add('visible');
    setTimeout(() => {
      nextBtn.classList.remove('hidden');
      void nextBtn.offsetHeight;
      nextBtn.classList.add('visible');
    }, 700);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Shadow ripple collapse → bright sky → Pokémon
    await fadeToBlack(800);
    await transitionTo('scene-pokemon', initPokemonScene, 200);
  });
}

function spawnShadowParticles() {
  const container = qs('#shadow-particles');
  container.innerHTML = '';
  const colors = [
    'rgba(20,40,180,0.7)',
    'rgba(40,20,120,0.6)',
    'rgba(0,80,255,0.5)',
    'rgba(80,0,160,0.6)',
    'rgba(10,10,60,0.8)'
  ];

  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'shadow-particle';

    const size   = rand(4, 16);
    const startX = rand(5, 95);
    const startY = rand(50, 100);
    const sx     = `${rand(-15, 15)}vw`;
    const sy     = `${rand(-60, -20)}vh`;
    const dur    = rand(2, 5);
    const delay  = rand(0, 3);
    const color  = colors[randInt(0, colors.length)];

    p.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size}px ${color};
      filter: blur(${rand(1,3)}px);
      --sx: ${sx};
      --sy: ${sy};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(p);
  }
}

let soloCtx = null;

function initSoloCanvas() {
  const canvas = qs('#solo-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  soloCtx = canvas.getContext('2d');

  // Occasional blue shadow energy streaks
  let soloTimer = setInterval(() => {
    if (!qs('#scene-solo').classList.contains('active')) {
      clearInterval(soloTimer);
      return;
    }
    drawShadowStreak(soloCtx);
  }, 500);
}

function drawShadowStreak(ctx) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const x = rand(0, W);
  const len = rand(80, 300);
  const angle = rand(-15, 15);

  ctx.save();
  ctx.strokeStyle = `rgba(40,100,255,${rand(0.05, 0.2)})`;
  ctx.lineWidth = rand(0.5, 2.5);
  ctx.translate(x, H * rand(0.4, 0.9));
  ctx.rotate((angle * Math.PI) / 180);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.stroke();
  ctx.restore();

  setTimeout(() => ctx.clearRect(x - 5, H * 0.3, len + 15, H * 0.8), rand(200, 600));
}

// -----------------------------------------------
// SCENE 9 — POKÉMON
// -----------------------------------------------
function initPokemonScene() {
  const badge    = qs('#scene-pokemon .chapter-badge');
  const skyLayer = qs('#poke-sky-layer');
  const scanLine = qs('#pokedex-scan');
  const hud      = qs('#pokedex-hud');
  const pdxLines = qsa('.pdx-line');
  const nextBtn  = qs('#poke-next');

  spawnPokeParticles();

  let t = 400;

  setTimeout(() => {
    badge.classList.add('visible');
    skyLayer.classList.add('visible');
    scanLine.classList.add('visible');
  }, t); t += 700;

  // HUD slides in
  setTimeout(() => {
    hud.classList.add('visible');
    // Stagger Pokédex data lines
    pdxLines.forEach((line, i) => {
      setTimeout(() => line.classList.add('visible'), i * 220);
    });
    setTimeout(() => {
      nextBtn.classList.add('visible');
    }, pdxLines.length * 220 + 400);
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Bright sky flash → magical particles → Harry Potter
    await doPokeFlash();
    await transitionTo('scene-hp', initHPScene, 200);
  });
}

function doPokeFlash() {
  return new Promise(resolve => {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed; inset: 0; z-index: 150;
      background: radial-gradient(ellipse at center, #ffffff, rgba(200,240,255,0.8));
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(flash);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flash.style.opacity = '1';
        setTimeout(() => {
          flash.style.transition = 'opacity 0.7s ease';
          flash.style.opacity = '0';
          setTimeout(() => { flash.remove(); resolve(); }, 700);
        }, 350);
      });
    });
  });
}

function spawnPokeParticles() {
  const container = qs('#poke-particles');
  container.innerHTML = '';
  const colors = [
    'rgba(255,220,60,0.7)',
    'rgba(120,200,255,0.7)',
    'rgba(255,255,255,0.6)',
    'rgba(200,255,200,0.5)',
    'rgba(255,180,60,0.5)'
  ];

  for (let i = 0; i < 35; i++) {
    const p = document.createElement('div');
    p.className = 'poke-particle';

    const size   = rand(3, 10);
    const startX = rand(5, 95);
    const startY = rand(20, 90);
    const py     = `${rand(-50, -10)}vh`;
    const dur    = rand(2.5, 6);
    const delay  = rand(0, 4);
    const color  = colors[randInt(0, colors.length)];

    p.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      --py: ${py};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(p);
  }
}

// -----------------------------------------------
// SCENE 10 — HARRY POTTER
// -----------------------------------------------
function initHPScene() {
  const badge    = qs('#scene-hp .chapter-badge');
  const line1    = qs('#hp-line-1');
  const line2    = qs('#hp-line-2');
  const nextBtn  = qs('#hp-next');
  const hpScene  = qs('#scene-hp');
  const flash    = qs('#hp-spell-flash');

  spawnHPSparks();
  initHPCanvas();

  let t = 500;

  setTimeout(() => badge.classList.add('visible'), t); t += 800;

  // "ONE FINAL SPELL…"
  setTimeout(() => {
    line1.classList.add('visible');
  }, t); t += 1400;

  // "EXPELLIARMUS!" — dramatic
  setTimeout(() => {
    line2.classList.remove('hidden');
    void line2.offsetHeight;
    line2.classList.add('visible');
    hpScene.classList.add('shake');
    setTimeout(() => hpScene.classList.remove('shake'), 600);
    doSpellFlash(flash);
    spawnHPSparkBurst();
  }, t); t += 1200;

  // Show next button
  setTimeout(() => {
    nextBtn.classList.remove('hidden');
    void nextBtn.offsetHeight;
    nextBtn.classList.add('visible');
  }, t);

  nextBtn.addEventListener('click', async () => {
    nextBtn.disabled = true;
    // Screen destabilizes → cracks → black
    await runHPDestabilize(hpScene);
    await fadeToBlack(800);
    await transitionTo('scene-referral', initReferralScene, 300);
  });
}

function doSpellFlash(flashEl) {
  flashEl.style.transition = 'opacity 0.12s ease';
  flashEl.style.opacity = '1';
  setTimeout(() => {
    flashEl.style.transition = 'opacity 1.2s ease';
    flashEl.style.opacity = '0';
  }, 180);
}

function spawnHPSparks() {
  const container = qs('#hp-sparks');
  container.innerHTML = '';
  const colors = ['#ffe060','#ffaa20','#ffffff','#c060ff','#80c0ff'];

  for (let i = 0; i < 40; i++) {
    const spark = document.createElement('div');
    spark.className = 'hp-spark';

    const size   = rand(2, 7);
    const startX = rand(15, 65);
    const startY = rand(30, 75);
    const hx     = `${rand(-25, 25)}vw`;
    const hy     = `${rand(-50, 10)}vh`;
    const dur    = rand(0.8, 2.5);
    const delay  = rand(0, 4);
    const color  = colors[randInt(0, colors.length)];

    spark.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      box-shadow: 0 0 ${size * 2}px ${color};
      --hx: ${hx};
      --hy: ${hy};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      animation-iteration-count: infinite;
    `;
    container.appendChild(spark);
  }
}

function spawnHPSparkBurst() {
  // Extra sparks concentrated at wand position
  const container = qs('#hp-sparks');
  const colors = ['#ffffff','#ffe060','#ffcc00','#c060ff'];

  for (let i = 0; i < 25; i++) {
    const spark = document.createElement('div');
    spark.className = 'hp-spark';
    const size   = rand(3, 9);
    const startX = rand(30, 55);
    const startY = rand(45, 65);
    const hx     = `${rand(-40, 40)}vw`;
    const hy     = `${rand(-60, 20)}vh`;
    const dur    = rand(0.5, 1.8);
    const color  = colors[randInt(0, colors.length)];

    spark.style.cssText = `
      left: ${startX}%;
      top: ${startY}%;
      width: ${size}px; height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 ${size * 3}px ${color};
      --hx: ${hx}; --hy: ${hy};
      animation-duration: ${dur}s;
      animation-delay: 0s;
      animation-iteration-count: 1;
    `;
    container.appendChild(spark);
    setTimeout(() => spark.remove(), (dur + 0.2) * 1000);
  }
}

let hpCtx = null;

function initHPCanvas() {
  const canvas = qs('#hp-canvas');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  hpCtx = canvas.getContext('2d');

  let hpTimer = setInterval(() => {
    if (!qs('#scene-hp').classList.contains('active')) {
      clearInterval(hpTimer);
      return;
    }
    drawMagicTrail(hpCtx);
  }, 350);
}

function drawMagicTrail(ctx) {
  if (!ctx) return;
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const x1 = rand(W * 0.25, W * 0.55);
  const y1 = rand(H * 0.35, H * 0.65);
  const x2 = x1 + rand(-80, 80);
  const y2 = y1 + rand(-80, 80);
  const colors = ['rgba(255,220,80,0.2)', 'rgba(200,100,255,0.15)', 'rgba(150,220,255,0.12)'];

  ctx.save();
  ctx.strokeStyle = colors[randInt(0, colors.length)];
  ctx.lineWidth = rand(0.5, 2);
  ctx.shadowColor = 'rgba(255,200,100,0.5)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();

  setTimeout(() => ctx.clearRect(
    Math.min(x1,x2) - 5, Math.min(y1,y2) - 5,
    Math.abs(x2-x1) + 10, Math.abs(y2-y1) + 10
  ), rand(200, 500));
}

async function runHPDestabilize(sceneEl) {
  const crackLayer  = qs('#hp-crack-layer');
  const cracks      = qsa('.hp-crack');
  const glitchBar   = qs('#hp-glitch-bar');
  const staticEl    = qs('#hp-static-overlay');
  const flash       = qs('#hp-spell-flash');

  // Step 1: cracks appear
  crackLayer.classList.add('visible');
  cracks.forEach((crack, i) => {
    const configs = [
      { w:'2px', h:'35%', top:'15%', left:'40%', rotate:'-25deg' },
      { w:'2px', h:'45%', top:'30%', left:'60%', rotate:'15deg' },
      { w:'2px', h:'25%', top:'50%', left:'30%', rotate:'-40deg' }
    ];
    const c = configs[i];
    Object.assign(crack.style, {
      width: c.w, height: c.h,
      top: c.top, left: c.left,
      transform: `rotate(${c.rotate})`
    });
    setTimeout(() => crack.classList.add('visible'), i * 200);
  });
  await sleep(700);

  // Step 2: glitch bars flicker
  for (let i = 0; i < 5; i++) {
    await sleep(120);
    glitchBar.style.top = `${rand(10, 90)}%`;
    glitchBar.style.opacity = `${rand(0.4, 0.9)}`;
    glitchBar.style.height = `${rand(2, 8)}px`;
    await sleep(80);
    glitchBar.style.opacity = '0';
  }

  // Step 3: static overlay + shake
  staticEl.classList.add('visible');
  sceneEl.classList.add('shake');
  await sleep(500);
  sceneEl.classList.remove('shake');

  // Step 4: intense flash and more shake
  doSpellFlash(flash);
  sceneEl.classList.add('shake');
  await sleep(600);
  sceneEl.classList.remove('shake');

  // Step 5: final shakes
  for (let i = 0; i < 3; i++) {
    await sleep(200);
    sceneEl.classList.add('shake');
    await sleep(500);
    sceneEl.classList.remove('shake');
  }
  await sleep(300);
}

// -----------------------------------------------
// SCENE 11 — GOOGLE REFERRAL
// -----------------------------------------------
function initReferralScene() {
  const content    = qs('#ref-content');
  const statusFill = qs('#ref-status-fill');
  const statusLbl  = qs('#ref-status-label');
  const approveBtn = qs('#ref-approve');
  const rejectBtn  = qs('#ref-reject');
  const escapeMsg  = qs('#ref-escape-msg');
  const btnRow     = qs('#ref-btn-row');

  // Fade content in
  setTimeout(() => {
    content.classList.add('visible');
    // Animate status bar fill
    setTimeout(() => { statusFill.style.width = '100%'; }, 400);
    setTimeout(() => { statusLbl.textContent = 'READY FOR REVIEW'; }, 2000);
  }, 200);

  // ── Reject button dodge logic ──────────────────
  let attemptCount = 0;
  const maxAttempts = 5;
  const escapeMsgs = [
    "Nice try… 👀",
    "Nope. 😏",
    "Not happening. 😂",
    "It's getting smaller too…",
    "Last chance… or not. 😈"
  ];

  // Make reject absolute so we can reposition it freely
  // without disturbing the approve button layout
  function makeRejectAbsolute() {
    if (rejectBtn.style.position === 'absolute') return;
    const rowRect    = btnRow.getBoundingClientRect();
    const rejectRect = rejectBtn.getBoundingClientRect();
    rejectBtn.style.position = 'absolute';
    rejectBtn.style.left = (rejectRect.left - rowRect.left) + 'px';
    rejectBtn.style.top  = (rejectRect.top  - rowRect.top)  + 'px';
    // Give the row a fixed height so approve doesn't shift
    btnRow.style.minHeight = rowRect.height + 'px';
  }

  function getSafePosition() {
    // Compute safe region = referral panel bounds with padding
    const panel    = qs('#ref-card');
    const btnRow   = qs('#ref-btn-row');
    const panelRect = panel.getBoundingClientRect();
    const rowRect   = btnRow.getBoundingClientRect();
    const approveRect = approveBtn.getBoundingClientRect();
    const rejectW  = rejectBtn.offsetWidth  || 160;
    const rejectH  = rejectBtn.offsetHeight || 44;
    const margin   = 12;

    // Available space: full viewport, stay inside with margin
    const minX = margin;
    const maxX = window.innerWidth  - rejectW  - margin;
    const minY = margin;
    const maxY = window.innerHeight - rejectH  - margin;

    // Exclusion zone around approve button
    const exLeft  = approveRect.left  - rejectW  - 20;
    const exRight = approveRect.right + 20;
    const exTop   = approveRect.top   - 20;
    const exBot   = approveRect.bottom + 20;

    let attempts = 0;
    let x, y;
    do {
      x = rand(minX, maxX);
      y = rand(minY, maxY);
      attempts++;
    } while (
      attempts < 30 &&
      x < exRight && x + rejectW > exLeft &&
      y < exBot   && y + rejectH > exTop
    );

    // Convert viewport coords → coords relative to btnRow
    return {
      x: x - rowRect.left,
      y: y - rowRect.top
    };
  }

  function dodgeReject() {
    if (attemptCount >= maxAttempts) return;

    makeRejectAbsolute();
    attemptCount++;

    // Show escape message
    escapeMsg.textContent = escapeMsgs[attemptCount - 1];
    escapeMsg.classList.add('visible');

    // Shrink from attempt 4 onward
    const scaleFactor = attemptCount >= 4
      ? Math.max(0.5, 1 - (attemptCount - 3) * 0.2)
      : 1;

    const pos = getSafePosition();

    rejectBtn.style.transition = 'left 0.25s cubic-bezier(0.34,1.56,0.64,1), top 0.25s cubic-bezier(0.34,1.56,0.64,1), font-size 0.3s ease, opacity 0.4s ease, transform 0.2s ease';
    rejectBtn.style.left      = pos.x + 'px';
    rejectBtn.style.top       = pos.y + 'px';
    rejectBtn.style.fontSize  = `${scaleFactor * 0.82}rem`;
    rejectBtn.style.transform = `scale(${scaleFactor})`;

    // Fade on last attempt
    if (attemptCount >= maxAttempts) {
      setTimeout(() => {
        rejectBtn.style.opacity = '0';
        rejectBtn.style.pointerEvents = 'none';
        escapeMsg.textContent = 'The REJECT button has left the chat. 💀';
        statusLbl.textContent = 'ONLY ONE OPTION REMAINS…';
        statusLbl.style.color = 'rgba(52,168,83,0.8)';
        setTimeout(() => {
          rejectBtn.style.display = 'none';
          // Pulse approve to draw attention
          approveBtn.style.animation = 'approvePulse 0.8s ease 3';
        }, 500);
      }, 200);
    }
  }

  // Trigger dodge on mouseenter / touchstart
  rejectBtn.addEventListener('mouseenter', dodgeReject);
  rejectBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeReject();
  }, { passive: false });

  // ── Approve button ─────────────────────────────
  approveBtn.addEventListener('click', async () => {
    approveBtn.disabled = true;
    rejectBtn.style.display = 'none';

    // Celebratory status update
    statusFill.style.background = '#34A853';
    statusLbl.textContent = '✓ APPROVED — PROCESSING…';
    statusLbl.style.color = 'rgba(52,168,83,0.9)';
    escapeMsg.style.display = 'none';

    spawnConfetti(80);
    await sleep(800);
    await fadeToBlack(600);
    await transitionTo('scene-final', initFinalScene, 200);
  });
}

// -----------------------------------------------
// SCENE 12 — FINAL BIRTHDAY
// -----------------------------------------------
function initFinalScene() {
  const rays      = qs('#final-rays');
  const approved  = qs('#final-approved');
  const nameEl    = qs('#final-name');
  const punchline = qs('#final-punchline');
  const restart   = qs('#final-restart');

  // Start fireworks immediately
  initFireworks();
  setTimeout(() => rays.classList.add('visible'), 200);

  let t = 300;

  // "🎉 REFERRAL REQUEST APPROVED 🎉"
  setTimeout(() => {
    approved.classList.remove('hidden');
    void approved.offsetHeight;
    approved.classList.add('visible');
    spawnConfetti(60);
  }, t); t += 1000;

  // "HAPPY BIRTHDAY, ADI ANNIYA! ❤️"
  setTimeout(() => {
    nameEl.classList.remove('hidden');
    void nameEl.offsetHeight;
    nameEl.classList.add('visible');
    spawnConfetti(100);
  }, t); t += 1400;

  // "Now seriously… about that referral. 👀😂"
  setTimeout(() => {
    punchline.classList.remove('hidden');
    void punchline.offsetHeight;
    punchline.classList.add('visible');
  }, t); t += 1200;

  // Restart button
  setTimeout(() => {
    restart.classList.remove('hidden');
    void restart.offsetHeight;
    restart.classList.add('visible');
    // The inner button also needs .visible since it inherits .cta-btn opacity:0
    const restartBtn = qs('#final-restart-btn');
    restartBtn.classList.add('visible');
  }, t);

  qs('#final-restart-btn').addEventListener('click', () => location.reload());
}

// -----------------------------------------------
// FIREWORKS ENGINE
// -----------------------------------------------
let fwCanvas = null;
let fwCtx    = null;
let fwShells = [];
let fwActive = false;

function initFireworks() {
  fwCanvas = qs('#firework-canvas');
  fwCanvas.width  = window.innerWidth;
  fwCanvas.height = window.innerHeight;
  fwCtx = fwCanvas.getContext('2d');
  fwActive = true;

  window.addEventListener('resize', () => {
    if (!fwCanvas) return;
    fwCanvas.width  = window.innerWidth;
    fwCanvas.height = window.innerHeight;
  });

  // Launch shells on an interval
  const launchTimer = setInterval(() => {
    if (!fwActive || !qs('#scene-final').classList.contains('active')) {
      clearInterval(launchTimer);
      fwActive = false;
      return;
    }
    launchShell();
    if (Math.random() > 0.5) launchShell(); // double burst
  }, 600);

  // Initial volley
  for (let i = 0; i < 4; i++) {
    setTimeout(launchShell, i * 150);
  }

  fireworkLoop();
}

class FWParticle {
  constructor(x, y, color, vx, vy, life, size) {
    this.x = x; this.y = y;
    this.color = color;
    this.vx = vx; this.vy = vy;
    this.life = life; this.maxLife = life;
    this.size = size;
    this.alpha = 1;
    this.gravity = 0.06;
    this.drag    = 0.97;
  }
  update() {
    this.x  += this.vx;
    this.y  += this.vy;
    this.vy += this.gravity;
    this.vx *= this.drag;
    this.vy *= this.drag;
    this.life--;
    this.alpha = Math.pow(this.life / this.maxLife, 1.5);
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = clamp(this.alpha, 0, 1);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = this.size * 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function launchShell() {
  if (!fwCtx) return;
  const W = fwCanvas.width;
  const H = fwCanvas.height;

  // Burst origin — upper 2/3 of screen
  const bx = rand(W * 0.1, W * 0.9);
  const by = rand(H * 0.08, H * 0.55);

  const palettes = [
    ['#f5c842','#ff8800','#fff'],
    ['#ff4488','#ff88cc','#fff'],
    ['#44aaff','#88ddff','#fff'],
    ['#44ff88','#aaffcc','#fff'],
    ['#ff4444','#ff8888','#fff'],
    ['#aa44ff','#dd88ff','#fff'],
    ['#FBBC05','#34A853','#4285F4'],
  ];
  const palette = palettes[randInt(0, palettes.length)];

  const count = randInt(40, 70);
  for (let i = 0; i < count; i++) {
    const angle  = (i / count) * Math.PI * 2;
    const speed  = rand(2, 6);
    const color  = palette[randInt(0, palette.length)];
    const life   = randInt(50, 90);
    const size   = rand(1.5, 3.5);

    fwShells.push(new FWParticle(
      bx, by, color,
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
      life, size
    ));
  }

  // Trailing sparkle core
  for (let i = 0; i < 8; i++) {
    fwShells.push(new FWParticle(
      bx, by, '#ffffff',
      rand(-1, 1), rand(-1, 1),
      randInt(20, 40), rand(2, 4)
    ));
  }
}

function fireworkLoop() {
  if (!fwCtx) return;
  // Fade trail
  fwCtx.fillStyle = 'rgba(0,0,0,0.18)';
  fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);

  fwShells = fwShells.filter(p => p.life > 0);
  fwShells.forEach(p => { p.update(); p.draw(fwCtx); });

  if (fwActive || fwShells.length > 0) {
    requestAnimationFrame(fireworkLoop);
  }
}

// -----------------------------------------------
// IMAGE PRELOAD — verify assets load
// -----------------------------------------------
function preloadImages() {
  const srcs = [
    'images/Naruto.png',
    'images/Monkey D. Luffy.png',
    'images/dragon Ball Z.png',
    'images/Death Note.png',
    'images/Attack On Titan.png',
    'images/Jujutsu Kaisen.png',
    'images/Solo Leveling.png',
    'images/Pokemon.png',
    'images/Harry Potter.png'
  ];

  const results = {};
  let loaded = 0;

  return new Promise(resolve => {
    srcs.forEach(src => {
      const img = new Image();
      img.onload  = () => { results[src] = 'PASS'; check(); };
      img.onerror = () => { results[src] = 'FAIL'; check(); };
      img.src = src;
    });

    function check() {
      loaded++;
      if (loaded === srcs.length) resolve(results);
    }
  });
}

// -----------------------------------------------
// BOOT
// -----------------------------------------------
window.addEventListener('DOMContentLoaded', async () => {
  // Preload images in background (non-blocking for UI)
  preloadImages().then(results => {
    console.log('%c[ASSET CHECK]', 'color:#f5c842;font-weight:bold;');
    Object.entries(results).forEach(([src, status]) => {
      const style = status === 'PASS'
        ? 'color:#00ff88;font-weight:bold;'
        : 'color:#ff4444;font-weight:bold;';
      console.log(`%c  ${status} — ${src}`, style);
    });
  });

  // Show intro scene
  showScene('scene-intro');
  // Small delay then run sequence
  await sleep(300);
  runIntroScene();
});
