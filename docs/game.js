// ═══════════════════════════════════════════════════════════════
//  SNACK GOBLIN – STORE EDITION (iOS / Android / Web)
//  Complete Arcade Experience with Procedural Audio Engine,
//  Delta-Time Physics, Fever Mode, Wardrobe, Achievements & Resilient Leaderboard
// ═══════════════════════════════════════════════════════════════

(function() {
'use strict';

// ── DOM ELEMENTS ─────────────────────────────────────────────
const canvas           = document.getElementById('gameCanvas');
const ctx              = canvas.getContext('2d');

// ── AUTHENTIC APPLE iOS EMOJI ASSETS ─────────────────────────
const emojiImages = {};
const EMOJI_NAMES = [
    'cookie', 'soda', 'fries', 'cake', 'donut', 'taco', 'pizza',
    'broccoli', 'chili', 'carrot', 'cucumber', 'onion',
    'shield', 'star', 'magnet', 'freeze', 'coin'
];
EMOJI_NAMES.forEach(name => {
    const img = new Image();
    img.src = `assets/emojis/${name}.png`;
    emojiImages[name] = img;
});

// HUD Elements
const scoreDisplay     = document.getElementById('score-display');
const scoreCard        = document.getElementById('score-card');
const coinsDisplay     = document.getElementById('coins-display');
const livesDisplay     = document.getElementById('lives-display');
const comboContainer   = document.getElementById('combo-container');
const comboDisplay     = document.getElementById('combo-display');
const comboMeterFill   = document.getElementById('combo-meter-fill');
const feverMeterBar    = document.getElementById('fever-meter-bar');
const feverMeterFill   = document.getElementById('fever-meter-fill');
const powerupsDock     = document.getElementById('powerups-dock');
const pauseBtn         = document.getElementById('pause-btn');
const flashOverlay     = document.getElementById('flash-overlay');
const toastContainer   = document.getElementById('toast-container');

// Modals & Screens
const startScreen      = document.getElementById('start-screen');
const wardrobeModal    = document.getElementById('wardrobe-modal');
const achievementsModal= document.getElementById('achievements-modal');
const leaderboardModal = document.getElementById('leaderboard-modal');
const settingsModal    = document.getElementById('settings-modal');
const howToPlayModal   = document.getElementById('how-to-play-modal');
const privacyModal     = document.getElementById('privacy-modal');
const pauseModal       = document.getElementById('pause-modal');
const nameInputScreen  = document.getElementById('name-input-screen');
const gameOverScreen   = document.getElementById('game-over-screen');
const exitScreen       = document.getElementById('exit-screen');

// Tier Toast
const tierToast = document.createElement('div');
tierToast.id = 'tier-toast';
document.body.appendChild(tierToast);

// ── JOKES DATABASE ───────────────────────────────────────────
const JOKES = [
    "Why did the cookie go to the hospital? Because it felt crummy! 🍪",
    "What do you call cheese that isn't yours? Nacho cheese! 🧀",
    "Why did the tomato turn red? Because it saw the salad dressing! 🍅",
    "Why do melons have weddings? Because they cantaloupe! 🍈",
    "What did the grape say when it got stepped on? Nothing, it just let out a little wine! 🍇",
    "Why did the banana go to the doctor? Because it wasn't peeling well! 🍌",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why did the mushroom go to the party? Because he was a fungi! 🍄",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the coffee file a police report? It got mugged! ☕",
    "Why did the goblin refuse to eat broccoli? He only has a stomach for junk food! 🥦",
    "What do you call a goblin who loves math? A mathemagoblin! 🧮",
    "What’s a goblin’s favorite type of music? Wrap music! 🎁",
    "Why don't skeletons fight each other? They don't have the guts! 💀",
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "How do you comfort a JavaScript bug? You console it! 💻",
    "Why did the Wi-Fi and internet break up? Because there was no connection! 📶",
    "Why did the developer go broke? Because he used up all his cache! 💸",
    "I'm reading a book about anti-gravity. It's impossible to put down! 📖",
    "What do you call a pile of cats? A meowtain! 🐈",
    "What do you call a factory that makes okay products? A satisfactory! 🏭"
];

// ── SKINS REGISTRY ───────────────────────────────────────────
const SKINS = [
    {
        id: 'munchy',
        name: 'Munchy Green',
        emoji: '👾',
        icon: '👾',
        color: '#00e676',
        ears: '#00b359',
        perk: 'Classic joyful muncher',
        price: 0,
        coinBonus: 1.0
    },
    {
        id: 'king',
        name: 'King Gobble',
        emoji: '👑',
        icon: '👑',
        color: '#ba68c8',
        ears: '#7b1fa2',
        perk: '+10% Bonus Coins!',
        price: 40,
        coinBonus: 1.1
    },
    {
        id: 'chef',
        name: 'Chef Chomper',
        emoji: '👨‍🍳',
        icon: '👨‍🍳',
        color: '#ffb74d',
        ears: '#f57c00',
        perk: 'Mouth opens 20% wider!',
        price: 75,
        coinBonus: 1.0
    },
    {
        id: 'ninja',
        name: 'Ninja Muncher',
        emoji: '🥷',
        icon: '🥷',
        color: '#455a64',
        ears: '#263238',
        perk: 'Smoke dash trail FX',
        price: 120,
        coinBonus: 1.0
    },
    {
        id: 'cyber',
        name: 'Cyber G-3000',
        emoji: '🤖',
        icon: '🤖',
        color: '#00e5ff',
        ears: '#0091ea',
        perk: 'Neon visor & spark trail',
        price: 180,
        coinBonus: 1.05
    },
    {
        id: 'vampire',
        name: 'Count Snackula',
        emoji: '🧛',
        icon: '🧛',
        color: '#e91e63',
        ears: '#880e4f',
        perk: 'Fever lasts +1.5 seconds!',
        price: 250,
        coinBonus: 1.0
    },
    {
        id: 'golden',
        name: 'Golden God',
        emoji: '✨',
        icon: '✨',
        color: '#ffd700',
        ears: '#ff8f00',
        perk: 'Pure gold aura & sparkles!',
        price: 400,
        coinBonus: 1.25
    }
];

// ── ACHIEVEMENTS REGISTRY ────────────────────────────────────
const ACHIEVEMENTS = [
    { id: 'first_munch',  icon: '🍪', title: 'First Bite',       desc: 'Eat your first tasty snack.' },
    { id: 'snack_novice', icon: '🌱', title: 'Snack Novice',     desc: 'Score 100 points in one game.' },
    { id: 'feast_master', icon: '🔥', title: 'Feast Master',     desc: 'Reach 500 points in one run.' },
    { id: 'chaos_goblin', icon: '🌪️', title: 'Chaos Champion',   desc: 'Survive to Chaos Goblin Tier (1000 pts).' },
    { id: 'combo_king',   icon: '⚡', title: 'Combo King',       desc: 'Reach a 5× combo multiplier.' },
    { id: 'veggie_dodge', icon: '🏃', title: 'Veggie Dodger',    desc: 'Dodge 25 veggies in a single run.' },
    { id: 'fever_rage',   icon: '🌶️', title: 'Fever Frenzy',     desc: 'Fill your meter and trigger Fever Mode.' },
    { id: 'fashion_icon', icon: '👕', title: 'Fashion Goblin',   desc: 'Unlock any skin from the Wardrobe.' }
];

// ── PERSISTENT STORAGE ───────────────────────────────────────
const Storage = {
    load() {
        try {
            return {
                highScore: parseInt(localStorage.getItem('sg_highScore') || '0', 10),
                totalCoins: parseInt(localStorage.getItem('sg_coins') || '0', 10),
                equippedSkin: localStorage.getItem('sg_equippedSkin') || 'munchy',
                unlockedSkins: JSON.parse(localStorage.getItem('sg_unlockedSkins') || '["munchy"]'),
                unlockedAchievements: JSON.parse(localStorage.getItem('sg_achievements') || '[]'),
                playerName: localStorage.getItem('sg_playerName') || '',
                sfx: localStorage.getItem('sg_sfx') !== 'false',
                music: localStorage.getItem('sg_music') !== 'false',
                haptics: localStorage.getItem('sg_haptics') !== 'false'
            };
        } catch (e) {
            return {
                highScore: 0, totalCoins: 0, equippedSkin: 'munchy',
                unlockedSkins: ['munchy'], unlockedAchievements: [],
                playerName: '', sfx: true, music: true, haptics: true
            };
        }
    },
    save(data) {
        try {
            if (data.highScore !== undefined) localStorage.setItem('sg_highScore', data.highScore);
            if (data.totalCoins !== undefined) localStorage.setItem('sg_coins', data.totalCoins);
            if (data.equippedSkin !== undefined) localStorage.setItem('sg_equippedSkin', data.equippedSkin);
            if (data.unlockedSkins !== undefined) localStorage.setItem('sg_unlockedSkins', JSON.stringify(data.unlockedSkins));
            if (data.unlockedAchievements !== undefined) localStorage.setItem('sg_achievements', JSON.stringify(data.unlockedAchievements));
            if (data.playerName !== undefined) localStorage.setItem('sg_playerName', data.playerName);
            if (data.sfx !== undefined) localStorage.setItem('sg_sfx', data.sfx);
            if (data.music !== undefined) localStorage.setItem('sg_music', data.music);
            if (data.haptics !== undefined) localStorage.setItem('sg_haptics', data.haptics);
        } catch (e) {}
    }
};

let userSave = Storage.load();

// ── AUDIO SYNTHESIZER ENGINE (Web Audio API) ─────────────────
let audioCtx = null;
let sfxGainNode = null;
let musicGainNode = null;
let musicInterval = null;
let isMusicPlaying = false;

function initAudio() {
    if (!audioCtx) {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();

            sfxGainNode = audioCtx.createGain();
            sfxGainNode.gain.setValueAtTime(userSave.sfx ? 0.45 : 0.0, audioCtx.currentTime);
            sfxGainNode.connect(audioCtx.destination);

            musicGainNode = audioCtx.createGain();
            musicGainNode.gain.setValueAtTime(userSave.music ? 0.18 : 0.0, audioCtx.currentTime);
            musicGainNode.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Procedural Sound Effects
const SFX = {
    playTone(freq, type, duration, vol = 0.3, startFreq = null, endFreq = null) {
        if (!userSave.sfx) return;
        initAudio();
        if (!audioCtx || !sfxGainNode) return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(sfxGainNode);

        osc.type = type;
        const t = audioCtx.currentTime;

        if (startFreq && endFreq) {
            osc.frequency.setValueAtTime(startFreq, t);
            osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
        } else {
            osc.frequency.setValueAtTime(freq, t);
        }

        gain.gain.setValueAtTime(vol, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc.start(t);
        osc.stop(t + duration + 0.02);
    },

    crunch() {
        // Multi-layered crispy munch sound (noise burst + tone chirp)
        if (!userSave.sfx) return;
        initAudio();
        if (!audioCtx || !sfxGainNode) return;

        const t = audioCtx.currentTime;
        // 1. Noise burst for crunch
        const bufferSize = audioCtx.sampleRate * 0.08;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;

        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, t);
        filter.Q.setValueAtTime(3, t);

        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.35, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(sfxGainNode);

        noise.start(t);

        // 2. Tonal chew chirp
        this.playTone(450, 'triangle', 0.07, 0.25, 450, 750);
    },

    coin() {
        this.playTone(1318, 'sine', 0.12, 0.35, 1318, 1760);
    },

    combo(n) {
        const notes = [330, 392, 440, 523, 587, 659, 784, 880, 1046];
        const pitch = notes[Math.min(n - 1, notes.length - 1)];
        this.playTone(pitch, 'sine', 0.16, 0.4);
    },

    shield() {
        this.playTone(440, 'sine', 0.25, 0.3, 440, 880);
    },

    powerup() {
        this.playTone(523, 'square', 0.1, 0.2);
        setTimeout(() => this.playTone(659, 'square', 0.1, 0.2), 80);
        setTimeout(() => this.playTone(784, 'square', 0.12, 0.25), 160);
        setTimeout(() => this.playTone(1046, 'square', 0.18, 0.3), 240);
    },

    fever() {
        [523, 659, 784, 1046, 1318].forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 'triangle', 0.18, 0.35), idx * 70);
        });
    },

    freeze() {
        this.playTone(1200, 'sine', 0.25, 0.3, 1200, 400);
    },

    miss() {
        this.playTone(280, 'sawtooth', 0.22, 0.35, 280, 70);
    },

    achievement() {
        [587, 740, 880, 1174].forEach((freq, idx) => {
            setTimeout(() => this.playTone(freq, 'sine', 0.2, 0.35), idx * 80);
        });
    },

    tierUp() {
        [523, 659, 784, 1047].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sine', 0.25, 0.2), i * 90);
        });
    },

    gameOver() {
        [440, 392, 349, 293].forEach((f, i) => {
            setTimeout(() => this.playTone(f, 'sawtooth', 0.35, 0.3), i * 180);
        });
    },

    click() {
        this.playTone(600, 'sine', 0.03, 0.15, 600, 300);
    }
};

// Procedural Retro Arcade Background Music Sequencer
const BGM = {
    step: 0,
    bassNotes: [110, 110, 130, 110, 146, 130, 164, 146],
    leadNotes: [440, 523, 659, 784, 659, 523, 587, 440],

    start() {
        if (!userSave.music || isMusicPlaying) return;
        initAudio();
        if (!audioCtx || !musicGainNode) return;

        isMusicPlaying = true;
        this.step = 0;
        const tempoMs = 180; // ~133 BPM arcade bounce

        musicInterval = setInterval(() => {
            if (!userSave.music || gameState !== 'playing') return;
            const t = audioCtx.currentTime;

            // Bass note
            const bass = audioCtx.createOscillator();
            const bassGain = audioCtx.createGain();
            bass.type = 'triangle';
            bass.frequency.setValueAtTime(this.bassNotes[this.step % this.bassNotes.length], t);
            bassGain.gain.setValueAtTime(0.2, t);
            bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
            bass.connect(bassGain);
            bassGain.connect(musicGainNode);
            bass.start(t);
            bass.stop(t + 0.17);

            // Arpeggio lead
            if (this.step % 2 === 0) {
                const lead = audioCtx.createOscillator();
                const leadGain = audioCtx.createGain();
                lead.type = feverTimer > 0 ? 'sawtooth' : 'sine';
                const pitch = this.leadNotes[(this.step / 2) % this.leadNotes.length];
                lead.frequency.setValueAtTime(feverTimer > 0 ? pitch * 1.5 : pitch, t);
                leadGain.gain.setValueAtTime(feverTimer > 0 ? 0.15 : 0.08, t);
                leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
                lead.connect(leadGain);
                leadGain.connect(musicGainNode);
                lead.start(t);
                lead.stop(t + 0.13);
            }

            this.step++;
        }, tempoMs);
    },

    stop() {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
        isMusicPlaying = false;
    },

    updateVolume() {
        if (!audioCtx || !musicGainNode) return;
        musicGainNode.gain.setValueAtTime(userSave.music ? 0.18 : 0.0, audioCtx.currentTime);
        if (userSave.music && gameState === 'playing' && !isMusicPlaying) {
            this.start();
        } else if (!userSave.music && isMusicPlaying) {
            this.stop();
        }
    }
};

// ── HAPTICS (Capacitor Native + Web Vibrate) ─────────────────
function triggerHaptic(type = 'light') {
    if (!userSave.haptics) return;

    // 1. Capacitor Haptics plugin
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics) {
            const { Haptics } = window.Capacitor.Plugins;
            if (type === 'light') Haptics.impact({ style: 'LIGHT' });
            else if (type === 'medium') Haptics.impact({ style: 'MEDIUM' });
            else if (type === 'heavy') Haptics.impact({ style: 'HEAVY' });
            else if (type === 'notification') Haptics.notification({ type: 'SUCCESS' });
            return;
        }
    } catch (e) {}

    // 2. Web Vibration API fallback
    try {
        if (navigator.vibrate) {
            if (type === 'light') navigator.vibrate(25);
            else if (type === 'medium') navigator.vibrate(50);
            else if (type === 'heavy') navigator.vibrate([60, 40, 80]);
            else if (type === 'notification') navigator.vibrate([40, 60, 40]);
        }
    } catch (e) {}
}

// ── SHARE SCORE (Native Capacitor + Web Share API) ───────────
async function shareScore() {
    const text = `I just scored ${score} points in Snack Goblin! Can you beat my high score? 👾🍪`;
    const url = 'https://sadiarumpa.github.io/snack-goblin/';

    // 1. Capacitor Share plugin
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share) {
            await window.Capacitor.Plugins.Share.share({
                title: 'Snack Goblin Score',
                text: text,
                url: url,
                dialogTitle: 'Share with friends'
            });
            return;
        }
    } catch (e) {}

    // 2. Web Share API
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Snack Goblin',
                text: text,
                url: url
            });
            return;
        } catch (e) {}
    }

    // 3. Fallback: Copy to clipboard
    try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        showToast('📋 Copied score link to clipboard!');
    } catch (e) {
        showToast('Score: ' + score + ' points!');
    }
}

// ── TOAST & ANNOUNCEMENT NOTIFICATIONS ───────────────────────
function showToast(message, icon = '✨') {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `<span style="font-size: 24px;">${icon}</span><span style="font-family: var(--font-display); font-size: 15px;">${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-toast-out');
        setTimeout(() => toast.remove(), 350);
    }, 2800);
}

function unlockAchievement(id) {
    if (userSave.unlockedAchievements.includes(id)) return;
    userSave.unlockedAchievements.push(id);
    Storage.save(userSave);

    const ach = ACHIEVEMENTS.find(a => a.id === id);
    if (ach) {
        SFX.achievement();
        triggerHaptic('notification');
        showToast(`ACHIEVEMENT: ${ach.title}!`, ach.icon);
    }
}

let toastTimer = null;
function showTierToast(label) {
    tierToast.textContent = label;
    tierToast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => tierToast.classList.remove('show'), 2000);
}

function flashScreen(type) {
    flashOverlay.className = '';
    void flashOverlay.offsetWidth;
    flashOverlay.classList.add(`flash-${type}`);
}

// ── CONFETTI CELEBRATIONS ────────────────────────────────────
function triggerConfetti() {
    try {
        if (window.confetti) {
            window.confetti({
                particleCount: 60,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
//  GAME STATE & VARIABLES
// ═══════════════════════════════════════════════════════════════
let W = window.innerWidth;
let H = window.innerHeight;

let gameState       = 'start'; // 'start', 'playing', 'paused', 'gameover'
let score           = 0;
let roundCoins      = 0;
let lives           = 3;
let combo           = 0;
let comboTimer      = 0;       // in seconds
const COMBO_WINDOW  = 1.8;     // seconds to keep combo alive
let comboTimerMax   = 1.8;

// Powerup states (in seconds)
let hasShield       = false;
let doubleTimer     = 0;
let magnetTimer     = 0;
let freezeTimer     = 0;
let feverTimer      = 0;
let feverStreak     = 0;
const FEVER_THRESHOLD = 10;

// Stats tracking for run achievements
let dodgedVeggies   = 0;
let currentTier     = 0;
let baseSpeed       = 200;     // pixels per second
let spawnInterval   = 1.0;     // seconds between spawns
let spawnTimer      = 0;
let lastTimestamp   = 0;

// Entities
const player = {
    x: W / 2,
    y: H - 85,
    size: 64,
    emoji: '👾',
    vx: 0,
    mouthOpen: 0,
    chewTimer: 0,
    hurtTimer: 0
};

let items      = [];
let particles  = [];
let floatTexts = [];

const GOOD_SNACKS = ['🍪', '🥤', '🍟', '🍰', '🍩', '🌮', '🍕'];
const BAD_VEGGIES = ['🥦', '🌶️', '🥕', '🥒', '🧅'];

const TIERS = [
    { score: 0,   label: '🌱 Snack Pup',    speedMult: 1.0, spawnInterval: 1.0 },
    { score: 100, label: '🔥 Goblin Mode',   speedMult: 1.4, spawnInterval: 0.8 },
    { score: 250, label: '💀 Junk Fiend',    speedMult: 1.9, spawnInterval: 0.62 },
    { score: 500, label: '🌪️ CHAOS GOBLIN', speedMult: 2.6, spawnInterval: 0.45 }
];

// ═══════════════════════════════════════════════════════════════
//  FIREBASE FIRESTORE GLOBAL LEADERBOARD
// ═══════════════════════════════════════════════════════════════
const firebaseConfig = {
    apiKey: "AIzaSyAAB4JQhpuwGsS7HGo9Fk7FRRr_CXVMu4w",
    authDomain: "snack-goblin.firebaseapp.com",
    projectId: "snack-goblin",
    storageBucket: "snack-goblin.firebasestorage.app",
    messagingSenderId: "142678656082",
    appId: "1:142678656082:web:1138270d15d03494cfcb8b",
    measurementId: "G-60PKZYJH6B"
};

let db = null;
let scoresRef = null;

try {
    if (window.firebase) {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        scoresRef = db.collection("scores");
    }
} catch (e) {
    console.warn("Firebase init skipped:", e);
}

async function getHighScores() {
    if (!scoresRef) {
        // Fallback: local best score
        return [{ name: userSave.playerName || 'You', score: userSave.highScore }];
    }
    try {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('timeout'), 4000));
        const fetchPromise = scoresRef.orderBy("score", "desc").limit(10).get();
        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);
        
        const scores = [];
        snapshot.forEach(doc => scores.push(doc.data()));
        return scores;
    } catch (e) {
        return [{ name: userSave.playerName || 'You', score: userSave.highScore }];
    }
}

async function saveHighScore(name, scoreToSave) {
    userSave.playerName = name;
    Storage.save(userSave);

    if (scoresRef) {
        try {
            await scoresRef.add({
                name: name || 'Anonymous',
                score: scoreToSave,
                ts: Date.now()
            });
        } catch (e) {
            console.warn("Failed to push cloud score:", e);
        }
    }
    await renderLeaderboard();
}

async function renderLeaderboard() {
    const modalEl = document.getElementById('modal-leaderboard');
    const finalEl = document.getElementById('final-leaderboard');
    if (!modalEl && !finalEl) return;

    const loadingHtml = '<div class="lb-loading">Loading top scores…</div>';
    if (modalEl) modalEl.innerHTML = loadingHtml;
    if (finalEl) finalEl.innerHTML = loadingHtml;

    const scores = await getHighScores();

    const rows = scores.map((s, i) => {
        const isMe = userSave.playerName && s.name === userSave.playerName && s.score === userSave.highScore;
        return `
            <div class="lb-entry ${isMe ? 'lb-me' : ''}">
                <span class="lb-rank">#${i + 1}</span>
                <span class="lb-name">${escapeHtml(s.name)}</span>
                <span class="lb-score">${s.score}</span>
            </div>`;
    }).join('');

    const emptyCount = Math.max(0, 10 - scores.length);
    const emptyRows = Array(emptyCount).fill(
        '<div class="lb-entry"><span class="lb-rank">-</span><span class="lb-name">---</span><span class="lb-score">0</span></div>'
    ).join('');

    const fullHtml = rows + emptyRows;
    if (modalEl) modalEl.innerHTML = fullHtml;
    if (finalEl) finalEl.innerHTML = fullHtml;
}

function escapeHtml(str) {
    return String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS RESIZING & HIGH-DPI SUPPORT
// ═══════════════════════════════════════════════════════════════
function resizeCanvas() {
    W = window.innerWidth;
    H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    player.size = 64;
    player.y = H - 85;
    player.x = Math.max(player.size / 2, Math.min(W - player.size / 2, player.x || W / 2));
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ═══════════════════════════════════════════════════════════════
//  TOUCH, MOUSE & KEYBOARD CONTROLS
// ═══════════════════════════════════════════════════════════════
function updatePlayerPosition(clientX) {
    if (gameState !== 'playing') return;
    const clampedX = Math.max(player.size / 2, Math.min(W - player.size / 2, clientX));
    player.vx = (clampedX - player.x) * 0.4;
    player.x = clampedX;
}

function handleTouchMove(e) {
    if (gameState !== 'playing') return;
    e.preventDefault();
    const touch = e.touches[0];
    updatePlayerPosition(touch.clientX);
}

function handleMouseMove(e) {
    if (gameState !== 'playing') return;
    updatePlayerPosition(e.clientX);
}

canvas.addEventListener('touchstart', handleTouchMove, { passive: false });
canvas.addEventListener('touchmove',  handleTouchMove, { passive: false });
canvas.addEventListener('mousemove',  handleMouseMove);

// Keyboard controls (Arrow keys & A/D)
const keys = { left: false, right: false };
window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = true;
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') togglePause();
});
window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keys.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.right = false;
});

// Auto-pause on app visibility change or blur
document.addEventListener('visibilitychange', () => {
    if (document.hidden && gameState === 'playing') {
        pauseGame();
    }
});

// ═══════════════════════════════════════════════════════════════
//  PARTICLES & FLOATING TEXTS
// ═══════════════════════════════════════════════════════════════
function createParticles(x, y, color, count = 10, burst = false) {
    for (let i = 0; i < count; i++) {
        const angle = burst ? (i / count) * Math.PI * 2 : Math.random() * Math.PI * 2;
        const speed = burst ? (100 + Math.random() * 150) : (60 + Math.random() * 120);
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - (burst ? 0 : 40),
            life: 1.0,
            decay: 1.8 + Math.random() * 0.8,
            color,
            size: 3 + Math.random() * 5,
            isStar: Math.random() < 0.4
        });
    }
}

function spawnFloatText(x, y, text, color = '#ffca28') {
    floatTexts.push({
        x, y,
        text,
        color,
        life: 1.0,
        vy: -70
    });
}

function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x  += p.vx * dt;
        p.y  += p.vy * dt;
        p.vy += 220 * dt; // gravity
        p.life -= p.decay * dt;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function updateFloatTexts(dt) {
    for (let i = floatTexts.length - 1; i >= 0; i--) {
        const f = floatTexts[i];
        f.y += f.vy * dt;
        f.life -= 1.4 * dt;
        if (f.life <= 0) floatTexts.splice(i, 1);
    }
}

// ═══════════════════════════════════════════════════════════════
//  ITEM SPAWNING & REWARD LOGIC
// ═══════════════════════════════════════════════════════════════
function spawnItem() {
    const rand = Math.random();
    let emoji, type = 'snack', kind = 'cookie';

    if (rand < 0.05) {
        emoji = '🛡️'; type = 'shield'; kind = 'shield';
    } else if (rand < 0.10) {
        emoji = '⭐'; type = 'double'; kind = 'double';
    } else if (rand < 0.15) {
        emoji = '🧲'; type = 'magnet'; kind = 'magnet';
    } else if (rand < 0.19) {
        emoji = '❄️'; type = 'freeze'; kind = 'freeze';
    } else if (rand < 0.22) {
        emoji = '🌮'; type = 'fever';  kind = 'fever';
    } else if (rand < 0.32) {
        emoji = '🪙'; type = 'coin';   kind = 'coin';
    } else if (rand < 0.72) {
        type = 'snack';
        const snackList = [
            { e: '🍪', k: 'cookie' },
            { e: '🥤', k: 'soda' },
            { e: '🍟', k: 'fries' },
            { e: '🍰', k: 'cake' },
            { e: '🍩', k: 'donut' },
            { e: '🌮', k: 'taco' },
            { e: '🍕', k: 'pizza' }
        ];
        const pick = snackList[Math.floor(Math.random() * snackList.length)];
        emoji = pick.e;
        kind  = pick.k;
    } else {
        type = 'veggie';
        const veggieList = [
            { e: '🥦', k: 'broccoli' },
            { e: '🌶️', k: 'chili' },
            { e: '🥕', k: 'carrot' },
            { e: '🥒', k: 'cucumber' },
            { e: '🧅', k: 'onion' }
        ];
        const pick = veggieList[Math.floor(Math.random() * veggieList.length)];
        emoji = pick.e;
        kind  = pick.k;
    }

    const margin = 50;
    const x = Math.random() * (W - margin * 2) + margin;
    const speed = baseSpeed + (Math.random() * 60 - 20);

    items.push({
        x,
        y: -50,
        size: type === 'coin' ? 38 : 48,
        emoji,
        type,
        kind,
        speed,
        wobble: Math.random() * Math.PI * 2,
        wobbleAmp: 30 + Math.random() * 25,
        scale: 1.0
    });
}

// ═══════════════════════════════════════════════════════════════
//  DIFFICULTY TIERS & HUD UPDATES
// ═══════════════════════════════════════════════════════════════
function checkDifficultyTier() {
    for (let i = TIERS.length - 1; i >= 0; i--) {
        if (score >= TIERS[i].score) {
            if (i !== currentTier) {
                currentTier = i;
                baseSpeed     = 200 * TIERS[i].speedMult;
                spawnInterval = TIERS[i].spawnInterval;
                SFX.tierUp();
                triggerHaptic('medium');
                showTierToast(TIERS[i].label);

                if (i === 3) unlockAchievement('chaos_goblin');
                else if (i === 2) unlockAchievement('feast_master');
                else if (i === 1) unlockAchievement('snack_novice');
            }
            return;
        }
    }
}

function updateHUD() {
    scoreDisplay.innerText = score;
    coinsDisplay.innerText = userSave.totalCoins;

    // Hearts
    let hearts = '';
    for (let i = 0; i < lives; i++) hearts += '❤️';
    livesDisplay.innerText = hearts || '💀';

    // Combo
    if (combo >= 2) {
        comboContainer.style.display = 'block';
        comboDisplay.innerText = `${combo}× COMBO!`;
        const pct = Math.max(0, Math.min(100, (comboTimer / comboTimerMax) * 100));
        comboMeterFill.style.width = pct + '%';
    } else {
        comboContainer.style.display = 'none';
    }

    // Fever Meter
    const feverPct = Math.min(100, (feverStreak / FEVER_THRESHOLD) * 100);
    feverMeterFill.style.width = (feverTimer > 0 ? 100 : feverPct) + '%';
    if (feverTimer > 0) {
        feverMeterBar.classList.add('fever-active-glow');
    } else {
        feverMeterBar.classList.remove('fever-active-glow');
    }

    // Power-ups Dock
    let dockHtml = '';
    if (hasShield) {
        dockHtml += `<div class="powerup-chip" style="color: #00e5ff;">🛡️ SHIELD</div>`;
    }
    if (doubleTimer > 0) {
        dockHtml += `<div class="powerup-chip" style="color: #ffca28;">⭐ 2× (${Math.ceil(doubleTimer)}s)</div>`;
    }
    if (magnetTimer > 0) {
        dockHtml += `<div class="powerup-chip" style="color: #ff9100;">🧲 MAGNET (${Math.ceil(magnetTimer)}s)</div>`;
    }
    if (freezeTimer > 0) {
        dockHtml += `<div class="powerup-chip" style="color: #80d8ff;">❄️ FREEZE (${Math.ceil(freezeTimer)}s)</div>`;
    }
    if (feverTimer > 0) {
        dockHtml += `<div class="powerup-chip" style="color: #f50057; font-weight: 900;">🔥 FEVER (${Math.ceil(feverTimer)}s)</div>`;
    }
    powerupsDock.innerHTML = dockHtml;
}

// ═══════════════════════════════════════════════════════════════
//  COLLISION HANDLING & GAME RULES
// ═══════════════════════════════════════════════════════════════
function handleCollision(item, index) {
    items.splice(index, 1);
    player.mouthOpen = 1.0;
    player.chewTimer = 0.35; // chew animation trigger

    // Check equipped skin perk
    const currentSkin = SKINS.find(s => s.id === userSave.equippedSkin) || SKINS[0];

    switch (item.type) {
        case 'shield':
            hasShield = true;
            createParticles(item.x, item.y, '#00e5ff', 16, true);
            flashScreen('shield');
            SFX.shield();
            triggerHaptic('medium');
            spawnFloatText(item.x, item.y - 20, 'SHIELD ON!', '#00e5ff');
            break;

        case 'double':
            doubleTimer = 6.0;
            createParticles(item.x, item.y, '#ffd700', 16, true);
            flashScreen('good');
            SFX.powerup();
            triggerHaptic('medium');
            spawnFloatText(item.x, item.y - 20, '2× SCORE!', '#ffd700');
            break;

        case 'magnet':
            magnetTimer = 6.0;
            createParticles(item.x, item.y, '#ff9100', 16, true);
            flashScreen('good');
            SFX.powerup();
            triggerHaptic('medium');
            spawnFloatText(item.x, item.y - 20, '🧲 MAGNET!', '#ff9100');
            break;

        case 'freeze':
            freezeTimer = 5.0;
            createParticles(item.x, item.y, '#80d8ff', 18, true);
            flashScreen('freeze');
            SFX.freeze();
            triggerHaptic('medium');
            spawnFloatText(item.x, item.y - 20, '❄️ FREEZE!', '#80d8ff');
            break;

        case 'fever':
            triggerFeverMode();
            spawnFloatText(item.x, item.y - 20, '🔥 FEVER MODE!', '#f50057');
            break;

        case 'coin':
            const coinGain = Math.round(1 * currentSkin.coinBonus);
            roundCoins += coinGain;
            userSave.totalCoins += coinGain;
            Storage.save(userSave);
            createParticles(item.x, item.y, '#ffe082', 12, true);
            SFX.coin();
            triggerHaptic('light');
            spawnFloatText(item.x, item.y - 20, `+${coinGain} 🪙`, '#ffe082');
            break;

        case 'snack':
            combo++;
            comboTimer = COMBO_WINDOW;
            feverStreak++;

            if (feverStreak >= FEVER_THRESHOLD && feverTimer <= 0) {
                triggerFeverMode();
            }

            unlockAchievement('first_munch');
            if (combo >= 5) unlockAchievement('combo_king');

            const multiplier = doubleTimer > 0 ? 2 : 1;
            const comboBonus = combo >= 2 ? (combo - 1) * 5 : 0;
            const pts = (10 + comboBonus) * multiplier;
            score += pts;

            createParticles(item.x, item.y, '#ffd54f', 12);
            flashScreen('good');
            SFX.crunch();
            if (combo >= 2) SFX.combo(combo);
            triggerHaptic('light');

            scoreCard.classList.remove('score-bump');
            void scoreCard.offsetWidth;
            scoreCard.classList.add('score-bump');

            const label = combo >= 2 ? `${combo}× +${pts}` : `+${pts}`;
            spawnFloatText(item.x, item.y - 20, label, combo >= 3 ? '#ff8a80' : '#ffd54f');
            break;

        case 'veggie':
            if (feverTimer > 0) {
                // In Fever Mode, goblin devours veggies for giant bonus!
                score += 50;
                createParticles(item.x, item.y, '#f50057', 16, true);
                SFX.crunch();
                triggerHaptic('medium');
                spawnFloatText(item.x, item.y - 20, 'GOBBLED! +50', '#f50057');
                unlockAchievement('fever_rage');
            } else if (hasShield) {
                hasShield = false;
                createParticles(item.x, item.y, '#00e5ff', 18, true);
                flashScreen('shield');
                SFX.shield();
                triggerHaptic('heavy');
                spawnFloatText(item.x, item.y - 20, 'BLOCKED!', '#00e5ff');
            } else {
                lives--;
                combo = 0;
                feverStreak = 0;
                player.hurtTimer = 0.5;

                createParticles(item.x, item.y, '#ff5252', 20, true);
                flashScreen('bad');
                SFX.miss();
                triggerHaptic('heavy');

                canvas.classList.add('shake');
                setTimeout(() => canvas.classList.remove('shake'), 380);
                spawnFloatText(item.x, item.y - 20, 'OUCH! -1 ❤️', '#ff5252');

                if (lives <= 0) {
                    endGame();
                    return;
                }
            }
            break;
    }

    updateHUD();
    checkDifficultyTier();
}

function triggerFeverMode() {
    feverTimer = userSave.equippedSkin === 'vampire' ? 8.5 : 7.0;
    feverStreak = 0;
    flashScreen('fever');
    SFX.fever();
    triggerHaptic('heavy');
    unlockAchievement('fever_rage');
}

// ═══════════════════════════════════════════════════════════════
//  MAIN UPDATE LOOP (DELTA TIME PHYSICS)
// ═══════════════════════════════════════════════════════════════
function update(dt) {
    if (gameState !== 'playing') return;

    // Keyboard movement
    if (keys.left)  player.x -= 380 * dt;
    if (keys.right) player.x += 380 * dt;
    player.x = Math.max(player.size / 2, Math.min(W - player.size / 2, player.x));

    // Timers
    if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
            combo = 0;
            updateHUD();
        }
    }

    if (doubleTimer > 0) {
        doubleTimer -= dt;
        if (doubleTimer <= 0) updateHUD();
    }
    if (magnetTimer > 0) {
        magnetTimer -= dt;
        if (magnetTimer <= 0) updateHUD();
    }
    if (freezeTimer > 0) {
        freezeTimer -= dt;
        if (freezeTimer <= 0) updateHUD();
    }
    if (feverTimer > 0) {
        feverTimer -= dt;
        if (feverTimer <= 0) updateHUD();
    }
    if (player.chewTimer > 0) {
        player.chewTimer -= dt;
    }
    if (player.hurtTimer > 0) {
        player.hurtTimer -= dt;
    }

    // Spawn items
    spawnTimer += dt;
    if (spawnTimer >= spawnInterval) {
        spawnItem();
        spawnTimer = 0;
    }

    // Update items
    const mouthRadius = player.size * (userSave.equippedSkin === 'chef' ? 0.65 : 0.52);

    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        // Freeze slow-down effect on veggies
        const isFrozenVeggie = freezeTimer > 0 && item.type === 'veggie';
        const effectiveSpeed = isFrozenVeggie ? item.speed * 0.25 : item.speed;

        item.y += effectiveSpeed * dt;
        item.wobble += 3.5 * dt;
        item.x += Math.sin(item.wobble) * (item.wobbleAmp * dt);

        // Magnet attraction on snacks & coins
        if (magnetTimer > 0 && (item.type === 'snack' || item.type === 'coin' || item.type === 'double' || item.type === 'shield')) {
            const dx = player.x - item.x;
            const dy = player.y - item.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 350) {
                const pull = (350 - dist) * 3.5 * dt;
                item.x += (dx / dist) * pull;
                item.y += (dy / dist) * pull;
            }
        }

        // Proximity detection: open goblin's mouth wide when food is near!
        const dx = player.x - item.x;
        const dy = player.y - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 140 && item.y < player.y) {
            player.mouthOpen = Math.max(player.mouthOpen, (140 - dist) / 140);
        }

        // Collision Check
        const hitDist = (feverTimer > 0 ? player.size * 0.75 : mouthRadius) + item.size * 0.45;
        if (dist < hitDist) {
            handleCollision(item, i);
            continue;
        }

        // Missed item off-screen
        if (item.y > H + 50) {
            if (item.type === 'veggie') {
                dodgedVeggies++;
                if (dodgedVeggies >= 25) unlockAchievement('veggie_dodge');
            }
            items.splice(i, 1);
        }
    }

    updateParticles(dt);
    updateFloatTexts(dt);
    updateHUD();
}

// ═══════════════════════════════════════════════════════════════
//  CRISP VECTOR & SPRITE DRAWING ROUTINES
// ═══════════════════════════════════════════════════════════════

function drawItem(ctx, item) {
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.scale !== 1) ctx.scale(item.scale, item.scale);

    const r = item.size / 2;

    // Freeze ice block effect for veggies
    if (freezeTimer > 0 && item.type === 'veggie') {
        ctx.fillStyle = 'rgba(128, 216, 255, 0.45)';
        ctx.strokeStyle = '#80d8ff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(-r - 4, -r - 4, (r + 4) * 2, (r + 4) * 2, 8);
        ctx.fill();
        ctx.stroke();
    }

    // Render authentic Apple iOS food emoji!
    const img = emojiImages[item.kind];
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, -r, -r, item.size, item.size);
    } else {
        // Fallback font
        ctx.font = `${item.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
    }

    ctx.restore();
}

// ═══════════════════════════════════════════════════════════════
//  ORIGINAL GOBLIN RENDERER
// ═══════════════════════════════════════════════════════════════
function drawPlayer(ctx, x, y, skin, isFever, isHurt, chewTimer, mouthOpen, frameTime) {
    ctx.save();

    // ── Aura Glow ──
    if (isFever) {
        ctx.shadowColor = '#f50057';
        ctx.shadowBlur = 35;
    } else if (hasShield) {
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 28;
    } else if (doubleTimer > 0) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 28;
    } else {
        ctx.shadowColor = 'rgba(241, 196, 15, 0.65)';
        ctx.shadowBlur = 25;
    }

    // ── Bounce & Movement Tilt ──
    const animFrame = frameTime || 0;
    const bounce = Math.sin(animFrame * 0.1) * 3;
    const chewBounce = chewTimer > 0 ? Math.sin(chewTimer * 28) * 4 : 0;
    const lean = Math.max(-0.35, Math.min(0.35, player.vx * 0.03));

    ctx.translate(x, y + bounce - chewBounce);
    ctx.rotate(lean);

    // ── Fever Mode Giant Scale ──
    if (isFever) {
        ctx.scale(1.35, 1.35);
    }

    // ── Hurt Flicker ──
    if (isHurt && Math.floor(animFrame * 0.3) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // ── Original Goblin Emoji (👾 space-invader / alien monster) ──
    const emoji = skin?.emoji || '👾';
    ctx.font = `${player.size}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 0, 0);

    // ── Shield Icon ──
    if (hasShield) {
        ctx.shadowBlur = 0;
        ctx.font = '22px sans-serif';
        ctx.fillText('🛡️', 30, -30);
    }

    // ── 2× Multiplier Badge ──
    if (doubleTimer > 0) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffd700';
        ctx.font = `bold 16px 'Fredoka One', cursive`;
        ctx.fillText('2×', 30, -28);
    }

    // ── Magnet Badge ──
    if (magnetTimer > 0) {
        ctx.shadowBlur = 0;
        ctx.font = '20px sans-serif';
        ctx.fillText('🧲', -30, -30);
    }

    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, W, H);

    // 1. Draw Falling Items with Crisp Vector Renderer
    for (const item of items) {
        drawItem(ctx, item);
    }

    // 2. Draw Original Goblin
    const currentSkin = SKINS.find(s => s.id === userSave.equippedSkin) || SKINS[0];
    drawPlayer(
        ctx,
        player.x,
        player.y,
        currentSkin,
        feverTimer > 0,
        player.hurtTimer > 0,
        player.chewTimer,
        player.mouthOpen,
        lastTimestamp ? lastTimestamp * 0.06 : 0
    );
    player.mouthOpen = Math.max(0, player.mouthOpen - 0.05);

    // 3. Draw Particles
    for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // 4. Draw Floating Score Numbers
    for (const f of floatTexts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, f.life);
        ctx.fillStyle   = f.color;
        ctx.font        = "bold 20px 'Fredoka One', cursive";
        ctx.textAlign   = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur  = 6;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
    }
}

function gameLoop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.08); // cap max delta
    lastTimestamp = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════════════════
//  GAME LIFECYCLE: START, PAUSE, RESTART, GAME OVER
// ═══════════════════════════════════════════════════════════════
function startGame() {
    initAudio();
    SFX.click();

    score           = 0;
    roundCoins      = 0;
    lives           = 3;
    combo           = 0;
    comboTimer      = 0;
    hasShield       = false;
    doubleTimer     = 0;
    magnetTimer     = 0;
    freezeTimer     = 0;
    feverTimer      = 0;
    feverStreak     = 0;
    dodgedVeggies   = 0;
    currentTier     = 0;
    baseSpeed       = 200;
    spawnInterval   = 1.0;
    spawnTimer      = 0;
    items           = [];
    particles       = [];
    floatTexts      = [];
    player.vx       = 0;
    player.x        = W / 2;
    gameState       = 'playing';

    startScreen.style.display     = 'none';
    gameOverScreen.style.display  = 'none';
    pauseModal.style.display      = 'none';
    nameInputScreen.style.display = 'none';

    updateHUD();
    BGM.start();
}

function pauseGame() {
    if (gameState !== 'playing') return;
    gameState = 'paused';
    SFX.click();
    BGM.stop();

    document.getElementById('pause-score').innerText = score;
    document.getElementById('pause-coins').innerText = roundCoins;
    pauseModal.style.display = 'flex';
}

function resumeGame() {
    if (gameState !== 'paused') return;
    gameState = 'playing';
    SFX.click();
    pauseModal.style.display = 'none';
    lastTimestamp = performance.now();
    BGM.start();
}

function togglePause() {
    if (gameState === 'playing') pauseGame();
    else if (gameState === 'paused') resumeGame();
}

async function endGame() {
    gameState = 'gameover';
    BGM.stop();
    SFX.gameOver();
    triggerHaptic('heavy');

    showRandomJoke();
    document.getElementById('final-score').innerText = score;
    document.getElementById('round-coins').innerText = `+${roundCoins} 🪙`;

    const isNewPersonalBest = score > userSave.highScore;
    if (isNewPersonalBest) {
        userSave.highScore = score;
        Storage.save(userSave);
        triggerConfetti();
        document.getElementById('new-best-badge').style.display = 'block';
    } else {
        document.getElementById('new-best-badge').style.display = 'none';
    }

    // Check if score qualifies for Global Top 10
    const scores = await getHighScores();
    const isGlobalHighScore = score > 0 && (scores.length < 10 || score > (scores[scores.length - 1]?.score || 0));

    if (isGlobalHighScore) {
        document.getElementById('new-high-score').innerText = score;
        document.getElementById('player-name').value = userSave.playerName || '';
        nameInputScreen.style.display = 'flex';
        triggerConfetti();
        setTimeout(() => {
            try { document.getElementById('player-name').focus(); } catch(e) {}
        }, 120);
    } else {
        gameOverScreen.style.display = 'flex';
        renderLeaderboard();
    }
}

function returnToMenu() {
    gameState = 'start';
    SFX.click();
    BGM.stop();

    gameOverScreen.style.display  = 'none';
    pauseModal.style.display      = 'none';
    exitScreen.style.display      = 'none';
    wardrobeModal.style.display   = 'none';
    achievementsModal.style.display = 'none';
    leaderboardModal.style.display = 'none';
    settingsModal.style.display   = 'none';
    howToPlayModal.style.display  = 'none';
    privacyModal.style.display    = 'none';

    refreshMenuStats();
    startScreen.style.display     = 'flex';
}

function refreshMenuStats() {
    document.getElementById('menu-high-score').innerText = userSave.highScore;
    document.getElementById('menu-coins').innerText = userSave.totalCoins;
    const currentSkin = SKINS.find(s => s.id === userSave.equippedSkin) || SKINS[0];
    document.getElementById('menu-skin-name').innerText = currentSkin.name.split(' ')[0];
    const mascotEmoji = document.getElementById('mascot-avatar-emoji');
    if (mascotEmoji) mascotEmoji.innerText = currentSkin.emoji || '👾';
}

// ═══════════════════════════════════════════════════════════════
//  WARDROBE (SKINS SHOP) SYSTEM
// ═══════════════════════════════════════════════════════════════
function renderWardrobe() {
    document.getElementById('wardrobe-coins-display').innerText = userSave.totalCoins;
    const grid = document.getElementById('skins-grid');
    grid.innerHTML = '';

    SKINS.forEach(skin => {
        const isUnlocked = userSave.unlockedSkins.includes(skin.id);
        const isEquipped = userSave.equippedSkin === skin.id;

        const card = document.createElement('div');
        card.className = `skin-card ${isEquipped ? 'equipped' : ''}`;

        let actionBtnHtml = '';
        if (isEquipped) {
            actionBtnHtml = `<button class="skin-btn skin-btn-equipped">EQUIPPED</button>`;
        } else if (isUnlocked) {
            actionBtnHtml = `<button class="skin-btn skin-btn-equip" data-skin="${skin.id}">EQUIP</button>`;
        } else {
            actionBtnHtml = `<button class="skin-btn skin-btn-buy" data-skin="${skin.id}">🪙 ${skin.price}</button>`;
        }

        card.innerHTML = `
            <div class="skin-preview-icon">${skin.icon}</div>
            <div class="skin-name">${skin.name}</div>
            <div class="skin-perk">${skin.perk}</div>
            ${actionBtnHtml}
        `;

        card.addEventListener('click', (e) => {
            const btn = card.querySelector('.skin-btn');
            if (isEquipped) return;

            if (isUnlocked) {
                userSave.equippedSkin = skin.id;
                Storage.save(userSave);
                SFX.click();
                triggerHaptic('light');
                renderWardrobe();
                refreshMenuStats();
            } else {
                if (userSave.totalCoins >= skin.price) {
                    userSave.totalCoins -= skin.price;
                    userSave.unlockedSkins.push(skin.id);
                    userSave.equippedSkin = skin.id;
                    Storage.save(userSave);
                    SFX.powerup();
                    triggerHaptic('notification');
                    triggerConfetti();
                    unlockAchievement('fashion_icon');
                    renderWardrobe();
                    refreshMenuStats();
                } else {
                    SFX.miss();
                    triggerHaptic('medium');
                    showToast(`Need ${skin.price - userSave.totalCoins} more coins!`, '🪙');
                }
            }
        });

        grid.appendChild(card);
    });
}

// ═══════════════════════════════════════════════════════════════
//  ACHIEVEMENTS SYSTEM
// ═══════════════════════════════════════════════════════════════
function renderAchievements() {
    const list = document.getElementById('achievements-list');
    list.innerHTML = '';
    const completedCount = userSave.unlockedAchievements.length;
    document.getElementById('completed-achievements-count').innerText = completedCount;
    document.getElementById('total-achievements-count').innerText = ACHIEVEMENTS.length;

    ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = userSave.unlockedAchievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `achievement-item ${isUnlocked ? 'unlocked' : ''}`;
        item.innerHTML = `
            <div class="ach-icon">${ach.icon}</div>
            <div class="ach-info">
                <div class="ach-title">${ach.title}</div>
                <div class="ach-desc">${ach.desc}</div>
            </div>
            <div class="ach-status">${isUnlocked ? '✅' : '🔒'}</div>
        `;
        list.appendChild(item);
    });
}

// ═══════════════════════════════════════════════════════════════
//  SETTINGS & TOGGLES
// ═══════════════════════════════════════════════════════════════
function initSettings() {
    const sfxCheckbox     = document.getElementById('setting-sfx');
    const musicCheckbox   = document.getElementById('setting-music');
    const hapticsCheckbox = document.getElementById('setting-haptics');

    sfxCheckbox.checked     = userSave.sfx;
    musicCheckbox.checked   = userSave.music;
    hapticsCheckbox.checked = userSave.haptics;

    sfxCheckbox.addEventListener('change', () => {
        userSave.sfx = sfxCheckbox.checked;
        Storage.save(userSave);
        if (sfxGainNode && audioCtx) {
            sfxGainNode.gain.setValueAtTime(userSave.sfx ? 0.45 : 0.0, audioCtx.currentTime);
        }
        SFX.click();
    });

    musicCheckbox.addEventListener('change', () => {
        userSave.music = musicCheckbox.checked;
        Storage.save(userSave);
        BGM.updateVolume();
        SFX.click();
    });

    hapticsCheckbox.addEventListener('change', () => {
        userSave.haptics = hapticsCheckbox.checked;
        Storage.save(userSave);
        triggerHaptic('light');
    });

    document.getElementById('reset-data-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all high scores, coins, and unlocked skins?')) {
            localStorage.clear();
            userSave = Storage.load();
            SFX.miss();
            refreshMenuStats();
            renderWardrobe();
            renderAchievements();
            showToast('Save data reset.', '⚠️');
        }
    });
}

// ═══════════════════════════════════════════════════════════════
//  JOKES SYSTEM
// ═══════════════════════════════════════════════════════════════
function showRandomJoke() {
    const randomIndex = Math.floor(Math.random() * JOKES.length);
    const joke = JOKES[randomIndex];
    const goJokeEl = document.getElementById('game-over-joke-text');
    if (goJokeEl) goJokeEl.innerText = `"${joke}"`;
    const exitJokeEl = document.getElementById('joke-text');
    if (exitJokeEl) exitJokeEl.innerText = `"${joke}"`;
}

// ═══════════════════════════════════════════════════════════════
//  UI EVENT LISTENERS & WIRING
// ═══════════════════════════════════════════════════════════════
function setupEventListeners() {
    // Start / Restart / Pause Buttons
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', startGame);
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) homeBtn.addEventListener('click', returnToMenu);
    document.getElementById('pause-restart-btn').addEventListener('click', startGame);
    pauseBtn.addEventListener('click', togglePause);
    document.getElementById('resume-btn').addEventListener('click', resumeGame);
    document.getElementById('pause-menu-btn').addEventListener('click', returnToMenu);

    // Next Joke Button
    const nextJokeBtn = document.getElementById('next-joke-btn');
    if (nextJokeBtn) {
        nextJokeBtn.addEventListener('click', () => {
            SFX.click();
            showRandomJoke();
        });
    }

    // Wardrobe Modal (ONLY on Home Page)
    document.getElementById('open-wardrobe-btn').addEventListener('click', () => {
        SFX.click();
        renderWardrobe();
        wardrobeModal.style.display = 'flex';
    });
    document.getElementById('close-wardrobe-btn').addEventListener('click', () => {
        SFX.click();
        wardrobeModal.style.display = 'none';
        refreshMenuStats();
    });

    // Achievements Modal
    document.getElementById('open-achievements-btn').addEventListener('click', () => {
        SFX.click();
        renderAchievements();
        achievementsModal.style.display = 'flex';
    });
    document.getElementById('close-achievements-btn').addEventListener('click', () => {
        SFX.click();
        achievementsModal.style.display = 'none';
    });

    // Leaderboard Modal
    document.getElementById('view-leaderboard-btn').addEventListener('click', async () => {
        SFX.click();
        leaderboardModal.style.display = 'flex';
        await renderLeaderboard();
    });
    document.getElementById('refresh-leaderboard-btn').addEventListener('click', async () => {
        SFX.click();
        await renderLeaderboard();
    });
    document.getElementById('close-leaderboard-btn').addEventListener('click', () => {
        SFX.click();
        leaderboardModal.style.display = 'none';
    });

    // Settings Modal
    document.getElementById('open-settings-btn').addEventListener('click', () => {
        SFX.click();
        settingsModal.style.display = 'flex';
    });
    document.getElementById('pause-settings-btn').addEventListener('click', () => {
        SFX.click();
        settingsModal.style.display = 'flex';
    });
    document.getElementById('close-settings-btn').addEventListener('click', () => {
        SFX.click();
        settingsModal.style.display = 'none';
    });

    // How to Play Modal
    document.getElementById('open-how-to-play-btn').addEventListener('click', () => {
        SFX.click();
        howToPlayModal.style.display = 'flex';
    });
    document.getElementById('close-how-to-play-btn').addEventListener('click', () => {
        SFX.click();
        howToPlayModal.style.display = 'none';
    });

    // Privacy Policy Modal
    document.getElementById('open-privacy-btn').addEventListener('click', () => {
        SFX.click();
        privacyModal.style.display = 'flex';
    });
    document.getElementById('close-privacy-btn').addEventListener('click', () => {
        SFX.click();
        privacyModal.style.display = 'none';
    });

    // Exit / Joke Modal
    const exitBtn = document.getElementById('exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            SFX.click();
            gameOverScreen.style.display = 'none';
            showRandomJoke();
            exitScreen.style.display = 'flex';
        });
    }

    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', returnToMenu);
    }

    // Save High Score
    document.getElementById('save-score-btn').addEventListener('click', async () => {
        const input = document.getElementById('player-name');
        const name = input.value.trim() || 'Anonymous';
        SFX.click();
        await saveHighScore(name, score);
        nameInputScreen.style.display = 'none';
        showRandomJoke();
        gameOverScreen.style.display  = 'flex';
    });

    document.getElementById('player-name').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('save-score-btn').click();
        }
    });
}

// ═══════════════════════════════════════════════════════════════
//  INITIALIZATION
// ═══════════════════════════════════════════════════════════════
function init() {
    refreshMenuStats();
    initSettings();
    setupEventListeners();
    renderLeaderboard();
    requestAnimationFrame(gameLoop);
}

init();

})();
