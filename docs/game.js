// ═══════════════════════════════════════════════════════════════
//  SNACK GOBLIN  –  Enhanced Edition
//  Improvements: Sound, Combos, Power-ups, Shared Leaderboard,
//                Floating score text, Screen flash, Difficulty tiers
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

let W = window.innerWidth;
let H = window.innerHeight;

// ── UI refs ──────────────────────────────────────────────────
const scoreEl         = document.getElementById('score-display');
const livesEl         = document.getElementById('lives-display');
const comboEl         = document.getElementById('combo-display');
const startScreen     = document.getElementById('start-screen');
const nameInputScreen = document.getElementById('name-input-screen');
const gameOverScreen  = document.getElementById('game-over-screen');
const finalScoreEl    = document.getElementById('final-score');
const newHighScoreEl  = document.getElementById('new-high-score');
const playerNameInput = document.getElementById('player-name');
const flashOverlay    = document.getElementById('flash-overlay');

// Tier toast (created dynamically once)
const tierToast = document.createElement('div');
tierToast.id = 'tier-toast';
document.body.appendChild(tierToast);

// ── Game State ───────────────────────────────────────────────
let gameState  = 'start';
let score      = 0;
let lives      = 3;
let frameCount = 0;
let baseSpeed  = 3;
let spawnRate  = 60;
let hasShield  = false;
let hasDouble  = false;
let doubleTick = 0;       // frames remaining for 2x
let combo      = 0;
let comboTimer = 0;       // frames since last catch
const COMBO_WINDOW = 90; // frames (~1.5s at 60fps)
let currentTier = 0;
let speedBoostTicks = 0; // Add this line

// ── Entities ─────────────────────────────────────────────────
const player = { x: 0, y: 0, size: 58, emoji: '👾', vx: 0 };
let items      = [];
let particles  = [];
let floatTexts = []; // floating score numbers

const goodSnacks = ['🍪', '🥤', '🍟', '🍰', '🍩', '🌮', '🍕'];
const badSnacks  = ['🥦', '🌶️', '🥕', '🥒', '🧅'];

// ── Difficulty tiers ─────────────────────────────────────────
const TIERS = [
    { score: 0,   label: '🌱 Snack Pup',    speedMult: 1.0, spawnRate: 60  },
    { score: 100, label: '🔥 Goblin Mode',   speedMult: 1.4, spawnRate: 48  },
    { score: 250, label: '💀 Junk Fiend',    speedMult: 1.9, spawnRate: 36  },
    { score: 500, label: '🌪️ CHAOS GOBLIN', speedMult: 2.6, spawnRate: 24  },
];

// ═══════════════════════════════════════════════════════════════
//  SOUND ENGINE  (Web Audio API – no files needed)
// ═══════════════════════════════════════════════════════════════
let audioCtx = null;

function getAudio() {
    if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
}

function playTone(freq, type, duration, vol = 0.4, startFreq = null, endFreq = null) {
    const ac = getAudio();
    if (!ac) return;
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    const t = ac.currentTime;

    if (startFreq && endFreq) {
        osc.frequency.setValueAtTime(startFreq, t);
        osc.frequency.linearRampToValueAtTime(endFreq, t + duration);
    } else {
        osc.frequency.setValueAtTime(freq, t);
    }

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.start(t);
    osc.stop(t + duration + 0.01);
}

function playChord(freqs, type, duration, vol = 0.25) {
    freqs.forEach(f => playTone(f, type, duration, vol));
}

const SFX = {
    catch()   { playTone(0, 'square', 0.12, 0.3, 400, 700); },
    miss()    {
        playTone(0, 'sawtooth', 0.15, 0.35, 300, 80);
        setTimeout(() => playTone(80, 'sawtooth', 0.2, 0.25), 100);
    },
    shield()  { playChord([523, 659, 784], 'sine', 0.4, 0.2); },
    powerup() {
        playTone(0, 'square', 0.08, 0.3, 400, 600);
        setTimeout(() => playTone(0, 'square', 0.08, 0.3, 500, 800), 80);
        setTimeout(() => playTone(0, 'square', 0.1,  0.3, 700, 1000), 160);
    },
    combo(n)  {
        const base = 300 + n * 60;
        playTone(base, 'triangle', 0.15, 0.35);
    },
    gameOver() {
        const ac = getAudio();
        if (!ac) return;
        [392, 330, 262].forEach((f, i) => {
            setTimeout(() => playTone(f, 'sawtooth', 0.4, 0.3), i * 200);
        });
    },
    tierUp() {
        playChord([523, 659, 784, 1047], 'sine', 0.5, 0.18);
    }
};

// ═══════════════════════════════════════════════════════════════
//  GLOBAL LEADERBOARD (Firebase Firestore)
// ═══════════════════════════════════════════════════════════════

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAAB4JQhpuwGsS7HGo9Fk7FRRr_CXVMu4w",
  authDomain: "snack-goblin.firebaseapp.com",
  projectId: "snack-goblin",
  storageBucket: "snack-goblin.firebasestorage.app",
  messagingSenderId: "142678656082",
  appId: "1:142678656082:web:1138270d15d03494cfcb8b",
  measurementId: "G-60PKZYJH6B"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const scoresRef = db.collection("scores");

async function getHighScores() {
    try {
        // Grab the top 10 highest scores from the cloud
        const snapshot = await scoresRef.orderBy("score", "desc").limit(10).get();
        const scores = [];
        snapshot.forEach(doc => scores.push(doc.data()));
        return scores;
    } catch (e) { 
        console.error("Error fetching scores:", e);
        return []; 
    }
}

async function saveHighScore(name, score) {
    try {
        // Push the new score to the cloud database
        await scoresRef.add({ 
            name: name || 'Anonymous', 
            score: score, 
            ts: Date.now() 
        });
        await renderLeaderboard();
    } catch (e) { 
        console.error("Error saving score:", e); 
    }
}

async function renderLeaderboard() {
    const loadingHtml = '<div class="lb-loading">Loading global scores…</div>';
    // Update both the modal and the game over screen
    document.getElementById('modal-leaderboard').innerHTML = loadingHtml;
    document.getElementById('final-leaderboard').innerHTML   = loadingHtml;

    const scores = await getHighScores();
    
    const rows = scores.map((s, i) => `
        <div class="lb-entry">
            <span class="lb-rank">#${i + 1}</span>
            <span class="lb-name">${escapeHtml(s.name)}</span>
            <span class="lb-score">${s.score}</span>
        </div>`).join('');

    const emptyCount = Math.max(0, 10 - scores.length);
    const empty = Array(emptyCount).fill(
        '<div class="lb-entry"><span class="lb-rank">-</span><span class="lb-name">---</span><span class="lb-score">0</span></div>'
    ).join('');

    const fullHtml = `<h3>🌍 GLOBAL TOP 10</h3>` + rows + empty;

    document.getElementById('modal-leaderboard').innerHTML = fullHtml;
    document.getElementById('final-leaderboard').innerHTML = fullHtml;

    if (scores.length > 0) {
        document.getElementById('high-score-display').innerText = `Global Best: ${scores[0].score}`;
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}


// ═══════════════════════════════════════════════════════════════
//  CANVAS RESIZE
// ═══════════════════════════════════════════════════════════════
function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    
    // High-DPI scaling for crisp emojis
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
    ctx.scale(dpr, dpr);
    
    player.y = H - 90;
    player.x = Math.max(player.size / 2, Math.min(W - player.size / 2, player.x || W / 2));
    if (gameState === 'start') player.x = W / 2;
}
window.addEventListener('resize', resize);
resize();

// ═══════════════════════════════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════════════════════════════
let targetX = null;

function handleInput(e) {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const newX = Math.max(player.size / 2, Math.min(W - player.size / 2, clientX));
    
    // Calculate velocity for the lean animation BEFORE updating position
    player.vx = newX - player.x; 
    player.x = newX; // 1:1 movement, zero lag!
}
canvas.addEventListener('touchmove',  handleInput, { passive: false });
canvas.addEventListener('touchstart', handleInput, { passive: false });
canvas.addEventListener('mousemove',  handleInput);

// ═══════════════════════════════════════════════════════════════
//  PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════
function createParticles(x, y, color, count = 8, burst = false) {
    for (let i = 0; i < count; i++) {
        const angle  = burst ? (i / count) * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed  = burst ? 4 + Math.random() * 4 : Math.random() * 7 + 2;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (burst ? 0 : 2),
            life: 1.0,
            color,
            size: Math.random() * 5 + 2,
            shape: Math.random() < 0.4 ? 'star' : 'circle'
        });
    }
}

// Trail particles from player movement
function createTrail(x, y) {
    if (Math.abs(player.vx) < 3) return;
    particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2,
        life: 0.5,
        color: hasDouble ? '#f1c40f' : (hasShield ? '#3498db' : 'rgba(255,255,255,0.5)'),
        size: Math.random() * 4 + 1,
        shape: 'circle'
    });
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx;
        p.y  += p.vy;
        p.vy += 0.15; // gravity
        p.life -= 0.035;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    ctx.save();
    for (const p of particles) {
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle   = p.color;

        if (p.shape === 'star') {
            drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outerR);
    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR);
        rot += step;
        ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR);
        rot += step;
    }
    ctx.lineTo(cx, cy - outerR);
    ctx.closePath();
    ctx.fill();
}

// ═══════════════════════════════════════════════════════════════
//  FLOATING SCORE TEXT
// ═══════════════════════════════════════════════════════════════
function spawnFloat(x, y, text, color = '#f1c40f') {
    floatTexts.push({ x, y, text, color, life: 1.0, vy: -2.5 });
}

function updateFloats() {
    for (let i = floatTexts.length - 1; i >= 0; i--) {
        const f = floatTexts[i];
        f.y    += f.vy;
        f.life -= 0.025;
        if (f.life <= 0) floatTexts.splice(i, 1);
    }
}

function drawFloats() {
    ctx.save();    
    for (const f of floatTexts) {
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle   = f.color;
        ctx.font        = `bold 22px 'Fredoka One', cursive`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        // shadow
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur  = 4;
        ctx.fillText(f.text, f.x, f.y);
        ctx.shadowBlur  = 0;
    }
    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN FLASH
// ═══════════════════════════════════════════════════════════════
function flash(type) {
    flashOverlay.className = '';
    void flashOverlay.offsetWidth; // reflow to restart animation
    flashOverlay.classList.add(`flash-${type}`);
}

// ═══════════════════════════════════════════════════════════════
//  TIER TOAST
// ═══════════════════════════════════════════════════════════════
let toastTimer = null;
function showTierToast(label) {
    tierToast.textContent = label;
    tierToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => tierToast.classList.remove('show'), 2000);
}

// ═══════════════════════════════════════════════════════════════
//  DIFFICULTY PROGRESSION
// ═══════════════════════════════════════════════════════════════
function checkTier() {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (score >= TIERS[i].score) {
            if (i !== currentTier) {
                currentTier = i;
                baseSpeed  = 3 * TIERS[i].speedMult;
                spawnRate  = TIERS[i].spawnRate;
                SFX.tierUp();
                showTierToast(TIERS[i].label);
            }
            return;
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  ITEM SPAWNING
// ═══════════════════════════════════════════════════════════════
function spawnItem() {
    const rand = Math.random();
    let emoji, isGood = true, isShield = false, isDouble = false, isSpeed = false;

    if (rand < 0.04) {
        emoji = '🛡️'; isShield = true;
    } else if (rand < 0.07) {
        emoji = '⭐'; isDouble = true;
    } else if (rand < 0.10) {
        emoji = '⚡'; isSpeed = true;
    } else if (rand < 0.65) {
        emoji = goodSnacks[Math.floor(Math.random() * goodSnacks.length)];
    } else {
        emoji = badSnacks[Math.floor(Math.random() * badSnacks.length)];
        isGood = false;
    }

    const margin = 40;
    const x = Math.random() * (W - margin * 2) + margin;

    items.push({
        x,
        y: -50,
        size: 42,
        emoji,
        isGood,
        isShield,
        isDouble,
        isSpeed,
        speed: baseSpeed + Math.random() * 1.5,
        wobble: Math.random() * Math.PI * 2, // phase offset
        wobbleAmp: Math.random() * 1.5,      // side-to-side sway
        scale: 1,                             // for pop animation
    });
}

// ═══════════════════════════════════════════════════════════════
//  VIBRATION
// ═══════════════════════════════════════════════════════════════
function vibrate(pattern) {
    try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}

// ═══════════════════════════════════════════════════════════════
//  UPDATE LOOP
// ═══════════════════════════════════════════════════════════════
function update() {
    if (gameState !== 'playing') return;
    frameCount++;

    // Smooth player movement
  /*  if (targetX !== null) {
        const dx   = targetX - player.x;
        const easing = speedBoostTicks > 0 ? 0.6 : 0.25; 
        player.vx = dx * easing;  // easing factor
        player.x  += player.vx;

        if (speedBoostTicks > 0) speedBoostTicks--;
    } */
    player.vx *= 0.8;
    createTrail(player.x, player.y);

    // Combo decay
    comboTimer++;
    if (comboTimer > COMBO_WINDOW && combo > 0) {
        combo = 0;
        updateUI();
    }

    // Power-up timer
    if (hasDouble) {
        doubleTick--;
        if (doubleTick <= 0) {
            hasDouble = false;
            updateUI();
        }
    }

    // Spawn
    if (frameCount % Math.floor(spawnRate) === 0) spawnItem();

    // Item updates
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.y       += item.speed;
        item.wobble  += 0.06;
        item.x       += Math.sin(item.wobble) * item.wobbleAmp;

        // Pop scale
        if (item.scale > 1) item.scale -= 0.05;

        // Collision
        const dx   = player.x - item.x;
        const dy   = player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < (player.size / 2 + item.size / 2)) {
            item.scale = 1.5; // visual pop
            handleCollision(item, i);
            continue;
        }

        if (item.y > H + 60) items.splice(i, 1);
    }

    updateParticles();
    updateFloats();
    checkTier();
}

function handleCollision(item, idx) {
    items.splice(idx, 1);

    if (item.isShield) {
        hasShield = true;
        createParticles(item.x, item.y, '#3498db', 14, true);
        flash('shield');
        SFX.shield();
        vibrate(50);
        spawnFloat(item.x, item.y - 20, 'SHIELD!', '#3498db');

    } else if (item.isDouble) {
        hasDouble = true;
        doubleTick = 300; // 5 seconds at 60fps
        createParticles(item.x, item.y, '#f1c40f', 16, true);
        flash('powerup');
        SFX.powerup();
        vibrate(60);
        spawnFloat(item.x, item.y - 20, '2× SCORE!', '#f1c40f');

    } else if (item.isSpeed) {
        speedBoostTicks = 120;
        // Speed burst: brief speed boost for player (smoother movement)
        createParticles(item.x, item.y, '#9b59b6', 14, true);
        flash('powerup');
        SFX.powerup();
        vibrate(60);
        // Add bonus points for speed item
        score += 20;
        spawnFloat(item.x, item.y - 20, '+20 SPEED!', '#9b59b6');

    } else if (item.isGood) {
        combo++;
        comboTimer = 0;
        const multiplier = hasDouble ? 2 : 1;
        const comboBonus  = combo >= 3 ? combo - 2 : 0;
        const pts = (10 + comboBonus * 5) * multiplier;
        score += pts;

        createParticles(item.x, item.y, '#f1c40f', 10);
        flash('good');
        SFX.catch();
        if (combo >= 3) SFX.combo(combo);
        vibrate(30);

        const floatStr = combo >= 3
            ? `${combo}× COMBO! +${pts}`
            : `+${pts}`;
        spawnFloat(item.x, item.y - 20, floatStr, combo >= 3 ? '#ff6b6b' : '#f1c40f');

    } else {
        // Bad snack
        if (hasShield) {
            hasShield = false;
            createParticles(item.x, item.y, '#3498db', 18, true);
            flash('shield');
            SFX.shield();
            vibrate([50, 50, 50]);
            spawnFloat(item.x, item.y - 20, 'BLOCKED!', '#3498db');
        } else {
            lives--;
            combo = 0;
            createParticles(item.x, item.y, '#e74c3c', 18, true);
            flash('bad');
            SFX.miss();
            vibrate([100, 50, 100]);
            canvas.classList.add('shake');
            setTimeout(() => canvas.classList.remove('shake'), 400);
            spawnFloat(item.x, item.y - 20, 'OUCH!', '#e74c3c');

            if (lives <= 0) { endGame(); return; }
        }
    }

    updateUI();
}

// ═══════════════════════════════════════════════════════════════
//  DRAW LOOP
// ═══════════════════════════════════════════════════════════════
function draw() {
    ctx.clearRect(0, 0, W, H);

    // ── Player ──
    ctx.save();
    ctx.shadowColor = hasDouble  ? '#f1c40f' :
                    hasShield  ? '#3498db' : 'rgba(241,196,15,0.6)';
    ctx.shadowBlur = 30;

    const bounce = Math.sin(frameCount * 0.1) * 3;
    const lean   = Math.max(-0.35, Math.min(0.35, player.vx * 0.03));
    ctx.translate(player.x, player.y + bounce);
    ctx.rotate(lean);
    ctx.font        = `${player.size}px Arial`;
    ctx.textAlign   = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.emoji, 0, 0);

    // Shield icon
    if (hasShield) {
        ctx.shadowBlur = 0;
        ctx.font = '20px Arial';
        ctx.fillText('🛡️', 30, -30);
    }
    // 2x indicator
    if (hasDouble) {
        ctx.shadowBlur = 0;
        ctx.fillStyle  = '#f1c40f';
        ctx.font       = `bold 14px 'Fredoka One', cursive`;
        ctx.fillText('2×', 30, -28);
    }
    ctx.restore();

    // ── Items ──
    for (const item of items) {
        ctx.save();
        ctx.translate(item.x, item.y);
        if (item.scale !== 1) ctx.scale(item.scale, item.scale);
        ctx.font        = `${item.size}px Arial`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
        ctx.restore();
    }

    drawParticles();
    drawFloats();
}

// ═══════════════════════════════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════════════════════════════
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// ═══════════════════════════════════════════════════════════════
//  UI
// ═══════════════════════════════════════════════════════════════
function updateUI() {
    scoreEl.innerText = score;

    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️';
    livesEl.innerText = hearts;

    if (combo >= 3) {
        comboEl.style.display = 'block';
        comboEl.textContent   = `${combo}× COMBO`;
        comboEl.style.animation = 'none';
        void comboEl.offsetWidth;
        comboEl.style.animation = 'comboPulse 0.3s ease-out';
    } else {
        comboEl.style.display = 'none';
    }
}

// ═══════════════════════════════════════════════════════════════
//  GAME LIFECYCLE
// ═══════════════════════════════════════════════════════════════
function startGame() {
    // Unlock AudioContext on user gesture
    const ac = getAudio();
    if (ac && ac.state === 'suspended') ac.resume();

    score       = 0;
    lives       = 3;
    hasShield   = false;
    hasDouble   = false;
    doubleTick  = 0;
    combo       = 0;
    comboTimer  = 0;
    baseSpeed   = 3;
    spawnRate   = 60;
    currentTier = 0;
    items       = [];
    particles   = [];
    floatTexts  = [];
    frameCount  = 0;
    player.vx   = 0;
    player.x    = canvas.width / 2;
    gameState   = 'playing';

    startScreen.style.display     = 'none';
    gameOverScreen.style.display  = 'none';
    nameInputScreen.style.display = 'none';
    updateUI();
}

async function endGame() {
    gameState = 'gameover';
    SFX.gameOver();
    finalScoreEl.innerText = score;

    const scores     = await getHighScores();
    const isHighScore = score > 0 && (scores.length < 10 || score > scores[scores.length - 1].score);

    if (isHighScore) {
        newHighScoreEl.innerText  = score;
        playerNameInput.value     = '';
        nameInputScreen.style.display = 'flex';
        setTimeout(() => { try { playerNameInput.focus(); } catch(e) {} }, 120);
    } else {
        gameOverScreen.style.display = 'flex';
        renderLeaderboard();
    }
}

// ═══════════════════════════════════════════════════════════════
//  EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);


// NEW: View Leaderboard Button
document.getElementById('view-leaderboard-btn').addEventListener('click', async () => {
    await renderLeaderboard();
    document.getElementById('leaderboard-modal').style.display = 'flex';
});

// NEW: Close Leaderboard Button
document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
    document.getElementById('leaderboard-modal').style.display = 'none';
});

document.getElementById('save-score-btn').addEventListener('click', async () => {
    const name = playerNameInput.value.trim() || 'Anonymous';
    await saveHighScore(name, score);
    nameInputScreen.style.display = 'none';
    gameOverScreen.style.display  = 'flex';
});

// Allow Enter key to save score
playerNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('save-score-btn').click();
    }
});

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════
renderLeaderboard();
loop();
