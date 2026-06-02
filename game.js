const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI Elements
const scoreEl = document.getElementById('score-display');
const livesEl = document.getElementById('lives-display');
const startScreen = document.getElementById('start-screen');
const nameInputScreen = document.getElementById('name-input-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const newHighScoreEl = document.getElementById('new-high-score');
const playerNameInput = document.getElementById('player-name');

// Game State
let gameState = 'start';
let score = 0;
let lives = 3;
let frameCount = 0;
let baseSpeed = 3;
let spawnRate = 60;
let hasShield = false;

// Entities
const player = { x: 0, y: 0, size: 55, emoji: '👾' };
let items = [];
let particles = [];

const goodSnacks = ['🍪', '🥤', '🍟', '🍰'];
const badSnacks = ['🥦', '🌶️', '🥕'];

// Resize handling (Fixed rotation bug)
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.y = canvas.height - 80;
    
    // Keep player in bounds if screen shrinks or rotates
    if (player.x > canvas.width - player.size / 2) {
        player.x = canvas.width - player.size / 2;
    }
    if (player.x < player.size / 2) {
        player.x = player.size / 2;
    }
    
    if (gameState === 'start') player.x = canvas.width / 2;
}
window.addEventListener('resize', resize);
resize();

// Input handling (Optimized for mobile)
function handleInput(e) {
    if (gameState !== 'playing') return;
    e.preventDefault(); // Prevents scrolling
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    player.x = clientX;
    
    // Clamp player to screen edges
    if (player.x < player.size / 2) player.x = player.size / 2;
    if (player.x > canvas.width - player.size / 2) player.x = canvas.width - player.size / 2;
}
canvas.addEventListener('touchmove', handleInput, { passive: false });
canvas.addEventListener('touchstart', handleInput, { passive: false }); // Added for instant response
canvas.addEventListener('mousemove', handleInput);

// Particle System
function createParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color,
            size: Math.random() * 5 + 3
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.04; // Slightly faster fade for better performance
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawParticles() {
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
}

// --- LEADERBOARD LOGIC (Top 3, with Private Mode Safeguard) ---
function getHighScores() {
    try {
        const scores = localStorage.getItem('snackGoblinScores');
        return scores ? JSON.parse(scores) : [];
    } catch (e) {
        return []; // Fallback if localStorage is blocked (e.g., Incognito)
    }
}

function saveHighScore(name, score) {
    try {
        const scores = getHighScores();
        scores.push({ name: name || 'Anonymous', score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('snackGoblinScores', JSON.stringify(scores.slice(0, 3)));
    } catch (e) {
        console.log("Could not save score (Private mode?)");
    }
    renderLeaderboard();
}

function renderLeaderboard() {
    const scores = getHighScores();
    const html = scores.map((s, i) => `
        <div class="lb-entry">
            <span class="lb-rank">#${i + 1}</span>
            <span class="lb-name">${s.name}</span>
            <span class="lb-score">${s.score}</span>
        </div>
    `).join('');
    
    const emptySlots = 3 - scores.length;
    const emptyHtml = Array(emptySlots).fill('<div class="lb-entry"><span class="lb-rank">-</span><span class="lb-name">---</span><span class="lb-score">0</span></div>').join('');
    
    const fullHtml = html + emptyHtml;
    
    document.getElementById('leaderboard-preview').innerHTML = scores.length ? `<h3>🏆 TOP 3 GOBLINS</h3>${fullHtml}` : '';
    document.getElementById('final-leaderboard').innerHTML = `<h3>🏆 TOP 3 GOBLINS</h3>${fullHtml}`;
    
    if (scores.length > 0) {
        document.getElementById('high-score-display').innerText = `Best: ${scores[0].score}`;
    }
}

// Game Logic
function spawnItem() {
    const rand = Math.random();
    let emoji, isGood, isShield = false;

    if (rand < 0.05) { 
        emoji = '🛡️'; isGood = true; isShield = true;
    } else if (rand < 0.65) { 
        emoji = goodSnacks[Math.floor(Math.random() * goodSnacks.length)];
        isGood = true;
    } else { 
        emoji = badSnacks[Math.floor(Math.random() * badSnacks.length)];
        isGood = false;
    }

    // Prevent spawning off-screen on very narrow devices
    const maxX = Math.max(40, canvas.width - 40);
    items.push({
        x: Math.random() * (maxX - 40) + 20,
        y: -50,
        size: 40,
        emoji: emoji,
        isGood: isGood,
        isShield: isShield,
        speed: baseSpeed + Math.random() * 2
    });
}

function vibrate(pattern) {
    if (navigator.vibrate) navigator.vibrate(pattern);
}

function update() {
    if (gameState !== 'playing') return;
    frameCount++;

    if (frameCount % Math.floor(spawnRate) === 0) spawnItem();

    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < (player.size / 2 + item.size / 2)) {
            if (item.isShield) {
                hasShield = true;
                createParticles(item.x, item.y, '#3498db', 12);
                vibrate(50);
            } else if (item.isGood) {
                score += 10;
                createParticles(item.x, item.y, '#f1c40f', 10);
                vibrate(30);
                if (score % 100 === 0) {
                    baseSpeed += 0.5;
                    spawnRate = Math.max(20, spawnRate - 5);
                }
            } else {
                if (hasShield) {
                    hasShield = false;
                    createParticles(item.x, item.y, '#e74c3c', 15);
                    vibrate([50, 50, 50]);
                } else {
                    lives--;
                    createParticles(item.x, item.y, '#2ecc71', 15);
                    vibrate([100, 50, 100]);
                    canvas.classList.add('shake');
                    setTimeout(() => canvas.classList.remove('shake'), 400);
                    
                    if (lives <= 0) {
                        endGame();
                    }
                }
            }
            items.splice(i, 1);
            updateUI();
            continue;
        }

        if (item.y > canvas.height + 50) items.splice(i, 1);
    }
    updateParticles();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.shadowColor = hasShield ? '#3498db' : '#f1c40f';
    ctx.shadowBlur = 25;
    ctx.font = `${player.size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const bounce = Math.sin(frameCount * 0.1) * 3;
    ctx.fillText(player.emoji, player.x, player.y + bounce);
    
    if (hasShield) {
        ctx.font = '22px Arial';
        ctx.shadowBlur = 0;
        ctx.fillText('🛡️', player.x + 28, player.y - 28);
    }
    ctx.restore();

    for (let item of items) {
        ctx.font = `${item.size}px Arial`;
        ctx.fillText(item.emoji, item.x, item.y);
    }

    drawParticles();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

function updateUI() {
    scoreEl.innerText = score;
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️';
    if (hasShield) hearts += ' 🛡️';
    livesEl.innerText = hearts;
}

function startGame() {
    score = 0;
    lives = 3;
    hasShield = false;
    baseSpeed = 3;
    spawnRate = 60;
    items = [];
    particles = [];
    frameCount = 0;
    gameState = 'playing';
    
    startScreen.style.display = 'none';
    gameOverScreen.style.display = 'none';
    nameInputScreen.style.display = 'none';
    updateUI();
}

function endGame() {
    gameState = 'gameover';
    finalScoreEl.innerText = score;
    
    const scores = getHighScores();
    const isHighScore = scores.length < 3 || score > scores[scores.length - 1].score;
    
    if (isHighScore && score > 0) {
        newHighScoreEl.innerText = score;
        playerNameInput.value = '';
        nameInputScreen.style.display = 'flex';
        // Slight delay to ensure mobile keyboard can trigger
        setTimeout(() => {
            try { playerNameInput.focus(); } catch(e){}
        }, 100);
    } else {
        gameOverScreen.style.display = 'flex';
        renderLeaderboard();
    }
}

// Event Listeners
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);

document.getElementById('save-score-btn').addEventListener('click', () => {
    const name = playerNameInput.value.trim() || 'Anonymous';
    saveHighScore(name, score);
    nameInputScreen.style.display = 'none';
    gameOverScreen.style.display = 'flex';
});

// Initialize
renderLeaderboard();
loop();
