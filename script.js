'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// TypeFighter — script.js
// All game logic wrapped in an IIFE to avoid global scope pollution.
// Architecture: ES6 classes, Canvas for rendering, DOM overlay for HUD/menus.
// ─────────────────────────────────────────────────────────────────────────────
(function () {

    // ═══════════════════════════════════════════════════════════════════════════
    // CONFIG — All tunable constants in one place
    // ═══════════════════════════════════════════════════════════════════════════
    const Config = {
        // Difficulty scaling
        LEVEL_UP_INTERVAL: 30,     // seconds between difficulty level-ups
        MAX_LEVEL: 12,

        // Enemy speed  px/s = BASE + level * MULT
        ENEMY_SPEED_BASE: 38,
        ENEMY_SPEED_MULT: 7,

        // Spawn interval (seconds) clamped between MIN and MAX
        SPAWN_INTERVAL_MAX: 3.0,
        SPAWN_INTERVAL_MIN: 0.8,
        SPAWN_INTERVAL_REDUCE: 0.18,  // seconds to subtract per level

        // Max simultaneous enemies on screen
        MAX_ENEMIES_BASE: 2,
        MAX_ENEMIES_LEVEL: 0.5,   // fractional; floor(level * this) added to base

        // Scoring
        SCORE_LETTER  : 10,
        SCORE_WORD_BONUS: 50,       // extra points for completing a full word
        SCORE_DEV_BONUS: 75,        // extra points for completing a dev snippet
        SCORE_SENTENCE_BONUS: 150,  // extra points for completing a full sentence
        SCORE_TYPO_PENALTY: 5,      // points deducted per typo/wrong key
        COMBO_MAX     : 16,
        COMBO_DECAY   : 3.0,        // seconds of inactivity before combo resets

        // Player health
        HEALTH_START  : 100,
        HEALTH_LOSS   : 20,         // HP lost per enemy that breaches the bottom (default; overridden by fail rate)
        // Fail-rate presets (HP lost per breach)
        FAIL_RATE: { low: 10, normal: 20, high: 35 },

        // Missile
        MISSILE_SPEED: 700,        // px/s

        // Power-ups
        POWERUP_CHANCE: 0.12,  // probability that a spawn is a power-up (level >= 2)
        POWERUP_SHIELD_DUR: 10.0,  // seconds
        POWERUP_SLOW_DUR: 8.0,
        POWERUP_SLOW_FACTOR: 0.4,   // enemy speed multiplier during slow
        POWERUP_AUTOFIRE_DUR: 6.0,
        POWERUP_AUTOFIRE_INT: 1.8,   // seconds between auto-fire shots

        // Colours
        COL_BG: '#08081a',
        COL_CYAN: '#00e5ff',
        COL_GREEN: '#39ff14',
        COL_YELLOW: '#ffe600',
        COL_RED: '#ff3860',
        COL_PURPLE: '#b400ff',
        COL_ORANGE: '#ff7800',

        // Word pool — 3 tiers selected by difficulty level
        // Tier 0: 3-5 letters  (levels 0-2)
        // Tier 1: 5-7 letters  (levels 3-6)
        // Tier 2: 7-10 letters (levels 7+)
        WORDS: [
      /* tier 0 */[
                'ace', 'arc', 'bat', 'bit', 'cat', 'cut', 'dog', 'dot', 'eat', 'fan', 'fix', 'fog',
                'fun', 'gap', 'gem', 'gun', 'hit', 'hop', 'hot', 'ice', 'jar', 'jet', 'joy', 'key',
                'kit', 'lap', 'lay', 'leg', 'lip', 'lit', 'log', 'map', 'mix', 'mob', 'mud', 'mug',
                'net', 'nod', 'nut', 'odd', 'oil', 'orb', 'owl', 'pad', 'pin', 'pit', 'pop', 'pot',
                'pun', 'ray', 'red', 'rip', 'rob', 'rod', 'rot', 'rub', 'run', 'sad', 'sat', 'saw',
                'set', 'sip', 'ski', 'sky', 'sob', 'spy', 'sub', 'sum', 'sun', 'tan', 'tip', 'tug',
                'via', 'vow', 'wax', 'web', 'wit', 'yap', 'ace', 'arc', 'bat', 'bit', 'cut', 'dog',
            ],
      /* tier 1 */[
                'alien', 'arrow', 'audio', 'blast', 'blaze', 'block', 'boost', 'brave', 'break',
                'brick', 'burst', 'cable', 'cache', 'carry', 'chase', 'check', 'chain', 'chunk',
                'clash', 'clean', 'clear', 'clock', 'comet', 'craft', 'crash', 'crawl', 'cycle',
                'dance', 'debug', 'decay', 'dodge', 'draft', 'drain', 'dream', 'drift', 'drill',
                'drive', 'drone', 'elect', 'ember', 'erase', 'exact', 'fault', 'feast', 'field',
                'fight', 'flame', 'flash', 'flood', 'focus', 'force', 'forge', 'frame', 'front',
                'frost', 'ghost', 'giant', 'glare', 'gleam', 'glide', 'grace', 'grade', 'greed',
                'grind', 'guard', 'guess', 'guide', 'guild', 'haunt', 'heart', 'heist', 'hover',
                'image', 'inner', 'input', 'joust', 'juice', 'knife', 'knock', 'known', 'lance',
                'laser', 'layer', 'learn', 'level', 'light', 'limit', 'logic', 'lunar', 'magic',
                'maker', 'march', 'match', 'metal', 'might', 'modal', 'model', 'morph', 'motor',
                'mount', 'music', 'nexus', 'night', 'noble', 'north', 'notch', 'octal', 'omega',
                'orbit', 'order', 'outer', 'oxide', 'ozone', 'paint', 'panel', 'patch', 'pause',
                'phase', 'pilot', 'pixel', 'place', 'plane', 'plant', 'plate', 'point', 'power',
                'press', 'price', 'prime', 'probe', 'proof', 'pulse', 'punch', 'query', 'queue',
                'quick', 'quiet', 'quote', 'radar', 'radio', 'rally', 'range', 'rapid', 'relay',
                'remix', 'repel', 'reset', 'rifle', 'rigid', 'risky', 'rival', 'robot', 'rocky',
                'rogue', 'rover', 'route', 'scala', 'scale', 'scene', 'scope', 'score', 'scout',
                'seize', 'shade', 'shaft', 'shake', 'shift', 'shine', 'shock', 'shoot', 'shore',
                'skill', 'slash', 'sleep', 'slice', 'slide', 'sling', 'slope', 'smart', 'smash',
                'smoke', 'snare', 'solid', 'solve', 'sonic', 'spark', 'spawn', 'speed', 'spell',
                'spine', 'split', 'squad', 'stack', 'stage', 'stall', 'stand', 'stash', 'state',
                'steal', 'steep', 'stomp', 'storm', 'story', 'stray', 'stuck', 'style', 'surge',
                'swift', 'swipe', 'swirl', 'synth', 'talon', 'tempo', 'theme', 'thing', 'three',
                'throw', 'timer', 'title', 'token', 'torch', 'total', 'touch', 'tough', 'trace',
                'track', 'trade', 'trail', 'train', 'trait', 'trash', 'treat', 'trend', 'trick',
                'troll', 'truck', 'trust', 'turbo', 'tweak', 'twist', 'ultra', 'under', 'union',
                'until', 'upper', 'urban', 'valid', 'value', 'vault', 'verse', 'vigor', 'virus',
                'vista', 'vital', 'vortex', 'watch', 'water', 'waves', 'world', 'worth', 'wrath',
                'xenon', 'yield', 'zones',
            ],
      /* tier 2 */[
                'absolute', 'accuracy', 'airspace', 'altitude', 'anomaly', 'asteroid',
                'autopilot', 'backbone', 'bandwidth', 'biometric', 'blastoff', 'booster',
                'boundary', 'capsule', 'checksum', 'chromatic', 'cloaking', 'coalition',
                'collision', 'compiled', 'conquest', 'cooldown', 'corridor', 'countdown',
                'database', 'deadfall', 'decipher', 'defender', 'deflect', 'deployed',
                'destroyer', 'detector', 'dimension', 'dispatch', 'distance', 'download',
                'dynamic', 'electron', 'embedded', 'emission', 'encryption', 'endpoint',
                'enforcer', 'engineer', 'equation', 'ethereal', 'evaluate', 'exclusive',
                'exponent', 'fieldwork', 'firestorm', 'flashback', 'fortress', 'fragment',
                'frequency', 'function', 'generate', 'gunsmith', 'hackproof', 'hardware',
                'highscore', 'hyperdrive', 'ignition', 'incoming', 'infinity', 'infrared',
                'initiate', 'innovate', 'intercept', 'invasion', 'junction', 'killzone',
                'kinetics', 'launcher', 'lockdown', 'mainframe', 'manifest', 'maximum',
                'megabyte', 'midnight', 'military', 'missiles', 'momentum', 'monitor',
                'multiply', 'nanosecond', 'navigate', 'networked', 'nightfall', 'objective',
                'obstacle', 'offensive', 'operator', 'optimize', 'override', 'particle',
                'penetrate', 'perimeter', 'photonic', 'pinpoint', 'platform', 'polygon',
                'precision', 'processor', 'program', 'propellant', 'protocol', 'quickstep',
                'radiation', 'reckless', 'recursive', 'redirect', 'reinforce', 'replicate',
                'resilient', 'rotation', 'sabotage', 'satellite', 'security', 'sequence',
                'shockwave', 'simulate', 'skeleton', 'snapshot', 'software', 'spaceship',
                'spectrum', 'squadron', 'starfield', 'starlight', 'stealth', 'strategic',
                'structure', 'subsystem', 'tactical', 'targeted', 'teleport', 'terminal',
                'terraform', 'threshold', 'throttle', 'thruster', 'timeline', 'torpedo',
                'tracking', 'transport', 'turbulent', 'ultrawave', 'uncharted', 'undermine',
                'validate', 'variable', 'velocity', 'vibration', 'viewport', 'volcanic',
                'warcraft', 'wavelength', 'weaponize', 'wildfire', 'wormhole', 'zeppelin',
            ],
        ],

        // Sentence pool — 3 tiers (short / medium / long)
        // On typo the player rewinds to the start of the current word only.
        SENTENCES: [
            /* tier 0 — short phrases, levels 0-3 */
            [
                'aim and fire', 'type to win', 'lock and load', 'blast them all',
                'fire the guns', 'dodge the rock', 'hit the mark', 'full power now',
                'engage the drive', 'shields are up', 'open fire now', 'charge weapons',
                'drop the bomb', 'hit and run', 'stay on target', 'brace for impact',
                'boost the engines', 'launch the probe', 'hold the line', 'take them out',
            ],
            /* tier 1 — medium sentences, levels 4-7 */
            [
                'destroy all incoming ships', 'keep your shields at full power',
                'target locked and ready to fire', 'the enemy fleet is closing in',
                'charge the laser to full power', 'hold your position and fight back',
                'boost engines and break free now', 'every second counts in battle',
                'fire all weapons at the mothership', 'your combo is on the line here',
                'navigate around the asteroid field', 'the defense grid has gone offline',
                'incoming missiles on the port side', 'we are running out of fuel fast',
                'lock all systems and prepare to jump', 'launch the strike team immediately',
            ],
            /* tier 2 — full sentences, levels 8+ */
            [
                'the shields will not hold for much longer',
                'fire all weapons and take out the enemy fleet',
                'navigate carefully through the dense asteroid belt',
                'our weapons are charged and ready for full battle',
                'boost your engines and get out of the danger zone',
                'the enemy has breached the outer defense perimeter',
                'do not let the enemies reach the bottom of the screen',
                'type faster and watch your score climb to the top',
                'the mothership is launching a full scale assault now',
                'every keystroke brings you closer to total victory here',
                'lock onto the target and unleash everything you have',
                'the galaxy depends on your speed and your accuracy now',
            ],
        ],

        // Dev snippet pool — HTML tags, CSS props, JS keywords & expressions
        // All lowercase so they display as real code. Mixed chars = extra challenge.
        // Tier 0: short keywords  (levels 0-3)
        // Tier 1: short expressions with punctuation  (levels 4-7)
        // Tier 2: longer code tokens  (levels 8+)
        DEV_SNIPPETS: [
            /* tier 0 — short tags / keywords with brackets */[
                '<div>', '<span>', '<html>', '<head>', '<body>', '<form>', '<input>',
                '<nav>', '<main>', '<ul>', '<li>', '<p>', '<h1>', '<img>',
                'const', 'let', 'var', 'null', 'true', 'false', 'async', 'await',
                'class{}', 'fn(){}', 'if(){}', 'flex', 'grid', 'return',
            ],
            /* tier 1 — properties, calls, short expressions */[
                '<div></div>', '<script>', '</script>', '<style>', '</style>',
                'class App{}', 'if(x > 0){}', 'try{}catch{}',
                'forEach(fn)', 'console.log()', 'arr.map(fn)', 'arr.filter()',
                'margin:0 auto', 'display:flex', 'border:none', 'overflow:auto',
                'export default', 'async fn(){}', 'font-size:1rem', 'padding:0px',
            ],
            /* tier 2 — longer real-code snippets */[
                'function foo(){}', 'const fn = () => {}', 'class Foo extends Bar{}',
                '<html lang="en">', '<!DOCTYPE html>', '<link rel="stylesheet">',
                'addEventListener()', 'document.querySelector()',
                'border: 1px solid #fff', 'background: rgba(0,0,0,0.5)',
                'const [x, y] = arr', 'import { x } from "m"', 'export default fn',
                'if (err) throw err', 'arr.reduce((a,b) => a+b)',
                ':root { --x: 1px }', '@keyframes spin{}',
            ],
        ],
    };

    // ═══════════════════════════════════════════════════════════════════════════
    // AUDIO MANAGER — Web Audio API synth sounds, zero external files
    // ═══════════════════════════════════════════════════════════════════════════
    class AudioManager {
        constructor() {
            this.ctx = null;
            this.enabled = true;
        }

        /** Must be called from a user-gesture handler to unlock the AudioContext. */
        init() {
            if (this.ctx) return;
            try {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            } catch (_) {
                this.enabled = false;
            }
        }

        _resume() {
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        }

        /** Play an oscillator tone with optional frequency sweep. */
        _tone(freqStart, freqEnd, type, duration, vol = 0.2) {
            if (!this.enabled || !this.ctx) return;
            this._resume();
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freqStart, now);
            if (freqEnd !== freqStart) {
                osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + duration);
            }
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            osc.start(now);
            osc.stop(now + duration + 0.02);
        }

        /** Play a band-passed white noise burst for explosion effect. */
        _noise(duration, vol = 0.25) {
            if (!this.enabled || !this.ctx) return;
            this._resume();
            const now = this.ctx.currentTime;
            const samples = Math.ceil(this.ctx.sampleRate * duration);
            const buf = this.ctx.createBuffer(1, samples, this.ctx.sampleRate);
            const data = buf.getChannelData(0);
            for (let i = 0; i < samples; i++) data[i] = Math.random() * 2 - 1;
            const src = this.ctx.createBufferSource();
            const filt = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();
            src.buffer = buf;
            filt.type = 'bandpass';
            filt.frequency.value = 300;
            filt.Q.value = 0.5;
            src.connect(filt);
            filt.connect(gain);
            gain.connect(this.ctx.destination);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
            src.start(now);
            src.stop(now + duration + 0.02);
        }

        playLaser() { this._tone(700, 300, 'square', 0.09, 0.18); }
        playExplosion() { this._noise(0.2, 0.35); }
        playTypingBlip() { this._tone(260, 260, 'sine', 0.04, 0.08); }
        playError() { this._tone(120, 80, 'sawtooth', 0.12, 0.15); }
        playPowerUp() { this._tone(440, 880, 'sine', 0.3, 0.2); }
        playGameOver() {
            if (!this.enabled || !this.ctx) return;
            [440, 330, 220, 110].forEach((f, i) =>
                setTimeout(() => this._tone(f, f * 0.8, 'sine', 0.28, 0.2), i * 220)
            );
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // STAR FIELD — 3-layer parallax background
    // ═══════════════════════════════════════════════════════════════════════════
    class StarField {
        constructor(canvas) {
            this.canvas = canvas;
            this.layers = this._build();
        }

        _build() {
            const W = this.canvas.width;
            const H = this.canvas.height;
            // [count, speed px/s, radius, alpha]
            return [
                { speed: 12, r: 0.6, alpha: 0.3, stars: _randStars(80, W, H) },
                { speed: 28, r: 1.0, alpha: 0.55, stars: _randStars(50, W, H) },
                { speed: 55, r: 1.7, alpha: 0.85, stars: _randStars(25, W, H) },
            ];
        }

        resize(w, h) {
            this.layers.forEach(l => l.stars.forEach(s => {
                if (s.x > w) s.x = Math.random() * w;
                if (s.y > h) s.y = Math.random() * h;
            }));
        }

        update(dt) {
            const W = this.canvas.width;
            const H = this.canvas.height;
            this.layers.forEach(l => l.stars.forEach(s => {
                s.y += l.speed * dt;
                if (s.y > H + 2) { s.y = -2; s.x = Math.random() * W; }
            }));
        }

        draw(ctx) {
            this.layers.forEach(l => {
                ctx.fillStyle = `rgba(255,255,255,${l.alpha})`;
                l.stars.forEach(s => {
                    ctx.beginPath();
                    ctx.arc(s.x, s.y, l.r, 0, Math.PI * 2);
                    ctx.fill();
                });
            });
        }
    }

    function _randStars(n, w, h) {
        return Array.from({ length: n }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
        }));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ASTEROID FIELD — Rocky obstacles drifting from all sides, occluding targets
    // ═══════════════════════════════════════════════════════════════════════════
    class Asteroid {
        constructor(canvas, initial = false) {
            this.canvas = canvas;
            // Jagged polygon shape (pre-generated, 10–14 vertices)
            const pts = 10 + Math.floor(Math.random() * 5);
            this.r = 16 + Math.random() * 44;   // radius 16–60 px
            this._shape = Array.from({ length: pts }, (_, i) => {
                const angle = (i / pts) * Math.PI * 2;
                const dist  = this.r * (0.55 + Math.random() * 0.45);
                return { a: angle, d: dist };
            });
            this.rot = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.9;  // rad/s
            this._spawn(initial);
        }

        _spawn(initial = false) {
            const W = this.canvas.width  || window.innerWidth;
            const H = this.canvas.height || window.innerHeight;
            const speed = 28 + Math.random() * 45;
            const edge  = Math.floor(Math.random() * 4); // 0=top 1=right 2=bottom 3=left

            if (edge === 0) {           // from top
                this.x  = Math.random() * W;
                this.y  = -(this.r + 10);
                const a = Math.PI * 0.1 + Math.random() * Math.PI * 0.8;
                this.vx = Math.cos(a) * speed;
                this.vy = Math.sin(a) * speed + 18;
            } else if (edge === 1) {   // from right
                this.x  = W + this.r + 10;
                this.y  = Math.random() * H;
                const a = Math.PI * 0.6 + Math.random() * Math.PI * 0.8;
                this.vx = -(Math.abs(Math.cos(a) * speed) + 18);
                this.vy = (Math.random() - 0.5) * speed;
            } else if (edge === 2) {   // from bottom
                this.x  = Math.random() * W;
                this.y  = H + this.r + 10;
                const a = Math.random() * Math.PI;
                this.vx = (Math.random() - 0.5) * speed;
                this.vy = -(Math.sin(a) * speed + 18);
            } else {                   // from left
                this.x  = -(this.r + 10);
                this.y  = Math.random() * H;
                const a = -Math.PI * 0.4 + Math.random() * Math.PI * 0.8;
                this.vx = Math.abs(Math.cos(a) * speed) + 18;
                this.vy = (Math.random() - 0.5) * speed;
            }

            // Scatter randomly across the screen when first created
            if (initial) {
                this.x = Math.random() * (W || 800);
                this.y = Math.random() * (H || 600);
            }
        }

        update(dt, speedMult) {
            const W = this.canvas.width;
            const H = this.canvas.height;
            this.x   += this.vx * dt * speedMult;
            this.y   += this.vy * dt * speedMult;
            this.rot += this.rotSpeed * dt;
            const m = this.r + 80;
            if (this.x < -m || this.x > W + m || this.y < -m || this.y > H + m) {
                // Regenerate shape on re-spawn for variety
                const pts = 10 + Math.floor(Math.random() * 5);
                this.r = 16 + Math.random() * 44;
                this._shape = Array.from({ length: pts }, (_, i) => {
                    const angle = (i / pts) * Math.PI * 2;
                    const dist  = this.r * (0.55 + Math.random() * 0.45);
                    return { a: angle, d: dist };
                });
                this.rotSpeed = (Math.random() - 0.5) * 0.9;
                this._spawn(false);
            }
        }

        draw(ctx) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rot);
            ctx.beginPath();
            this._shape.forEach(({ a, d }, i) => {
                const px = Math.cos(a) * d;
                const py = Math.sin(a) * d;
                i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            });
            ctx.closePath();
            ctx.fillStyle   = 'rgba(55,45,30,0.84)';
            ctx.strokeStyle = 'rgba(140,115,75,0.55)';
            ctx.lineWidth   = 1.5;
            ctx.shadowColor = 'rgba(90,65,25,0.4)';
            ctx.shadowBlur  = 8;
            ctx.fill();
            ctx.stroke();

            // Surface detail — a few small craters as dark circles
            ctx.shadowBlur = 0;
            ctx.fillStyle  = 'rgba(30,22,12,0.55)';
            for (let i = 0; i < 3; i++) {
                const angle = (i / 3) * Math.PI * 2 + this.r;
                const dist  = this.r * 0.35;
                const cr    = this.r * (0.07 + i * 0.04);
                ctx.beginPath();
                ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, cr, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    class AsteroidField {
        constructor(canvas) {
            this.canvas = canvas;
            this._rocks  = Array.from({ length: 9 }, () => new Asteroid(canvas, true));
            this._speedMult = 1;
        }

        setLevel(level) {
            // Gradually faster as difficulty climbs; cap at 2.5×
            this._speedMult = Math.min(1 + level * 0.1, 2.5);
        }

        update(dt) {
            this._rocks.forEach(r => r.update(dt, this._speedMult));
        }

        draw(ctx) {
            this._rocks.forEach(r => r.draw(ctx));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SHIP — Player's spaceship at the bottom-centre of the canvas
    // ═══════════════════════════════════════════════════════════════════════════
    class Ship {
        constructor(canvas) {
            this.canvas = canvas;
            this.time = 0;
            this.hitFlash = 0;     // seconds remaining
            this.shieldActive = false;
        }

        /** Horizontal centre of canvas */
        get x() { return this.canvas.width / 2; }
        /** Vertical position with idle sin-wave bob */
        get y() { return this.canvas.height - 72 + Math.sin(this.time * 1.8) * 4; }

        update(dt) {
            this.time += dt;
            if (this.hitFlash > 0) this.hitFlash = Math.max(0, this.hitFlash - dt);
        }

        flash() { this.hitFlash = 0.4; }

        draw(ctx) {
            const cx = this.x;
            const cy = this.y;
            ctx.save();

            // Shield bubble
            if (this.shieldActive) {
                const sg = ctx.createRadialGradient(cx, cy, 22, cx, cy, 58);
                sg.addColorStop(0, 'rgba(0,229,255,0)');
                sg.addColorStop(0.6, 'rgba(0,229,255,0.07)');
                sg.addColorStop(1, 'rgba(0,229,255,0.38)');
                ctx.beginPath();
                ctx.arc(cx, cy, 58, 0, Math.PI * 2);
                ctx.fillStyle = sg;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,229,255,0.55)';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }

            // Engine afterburner glow
            const eg = ctx.createRadialGradient(cx, cy + 24, 2, cx, cy + 24, 24);
            eg.addColorStop(0, 'rgba(0,229,255,0.9)');
            eg.addColorStop(0.3, 'rgba(0,120,255,0.45)');
            eg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = eg;
            ctx.beginPath();
            ctx.ellipse(cx, cy + 24, 9, 18, 0, 0, Math.PI * 2);
            ctx.fill();

            // Choose body colour (red flash on hit)
            const f = this.hitFlash > 0 ? Math.min(1, this.hitFlash / 0.4) : 0;
            const bodyColor = f > 0
                ? `rgba(255,${Math.floor(80 * (1 - f))},${Math.floor(80 * (1 - f))},1)`
                : '#a0d4ff';

            ctx.shadowColor = Config.COL_CYAN;
            ctx.shadowBlur = f > 0 ? 22 : 8;

            // Main hull (arrowhead)
            ctx.beginPath();
            ctx.moveTo(cx, cy - 30);   // nose tip
            ctx.lineTo(cx + 18, cy + 14);   // right base
            ctx.lineTo(cx + 6, cy + 8);    // right inner notch
            ctx.lineTo(cx, cy + 20);   // engine centre
            ctx.lineTo(cx - 6, cy + 8);    // left inner notch
            ctx.lineTo(cx - 18, cy + 14);   // left base
            ctx.closePath();
            ctx.fillStyle = bodyColor;
            ctx.fill();

            // Wing accent panels
            const wingCol = f > 0 ? '#ff4444' : '#2d7ab8';
            ctx.fillStyle = wingCol;
            ctx.beginPath();
            ctx.moveTo(cx, cy - 12);
            ctx.lineTo(cx + 27, cy + 22);
            ctx.lineTo(cx + 18, cy + 14);
            ctx.closePath();
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(cx, cy - 12);
            ctx.lineTo(cx - 27, cy + 22);
            ctx.lineTo(cx - 18, cy + 14);
            ctx.closePath();
            ctx.fill();

            // Cockpit
            ctx.beginPath();
            ctx.ellipse(cx, cy - 8, 4, 9, 0, 0, Math.PI * 2);
            ctx.fillStyle = f > 0 ? '#ffffff' : Config.COL_CYAN;
            ctx.shadowColor = Config.COL_CYAN;
            ctx.shadowBlur = 14;
            ctx.fill();

            ctx.restore();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PARTICLE — A single particle in an explosion / impact burst
    // ═══════════════════════════════════════════════════════════════════════════
    class Particle {
        constructor(x, y, color) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 200;
            this.x = x;
            this.y = y;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.life = 0.55 + Math.random() * 0.5;
            this.maxLife = this.life;
            this.size = 2 + Math.random() * 4;
            this.color = color;
            this.gravity = 90;
        }

        update(dt) {
            this.x += this.vx * dt;
            this.y += this.vy * dt;
            this.vy += this.gravity * dt;
            this.vx *= Math.pow(0.15, dt);   // drag
            this.life -= dt;
        }

        get alive() { return this.life > 0; }

        draw(ctx) {
            const a = Math.max(0, this.life / this.maxLife);
            ctx.save();
            ctx.globalAlpha = a;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * a, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // EFFECTS MANAGER — Particle explosions + screen shake
    // ═══════════════════════════════════════════════════════════════════════════
    class EffectsManager {
        constructor(canvas) {
            this.canvas = canvas;
            this.particles = [];
            this._shaking = false;
        }

        explode(x, y, color = Config.COL_CYAN, count = 20) {
            for (let i = 0; i < count; i++) this.particles.push(new Particle(x, y, color));
        }

        /** Trigger a one-shot CSS shake animation on the canvas. */
        triggerShake() {
            if (this._shaking) return;
            this._shaking = true;
            this.canvas.classList.add('shake');
            setTimeout(() => {
                this.canvas.classList.remove('shake');
                this._shaking = false;
            }, 320);
        }

        update(dt) {
            this.particles = this.particles.filter(p => { p.update(dt); return p.alive; });
        }

        draw(ctx) {
            this.particles.forEach(p => p.draw(ctx));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // Utility: draw a round-cornered rectangle path (no fill/stroke — caller decides)
    // ═══════════════════════════════════════════════════════════════════════════
    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.lineTo(x + w, y + h - r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.lineTo(x + r, y + h);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.lineTo(x, y + r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ENEMY — A single falling entity (letter, word, or power-up)
    // ═══════════════════════════════════════════════════════════════════════════
    class Enemy {
        /**
         * @param {object} opts
         * @param {'letter'|'word'|'powerup'} opts.type
         * @param {string}  opts.value        — the typed label (e.g. "fire", "A", "SHIELD")
         * @param {number}  opts.x
         * @param {number}  opts.y
         * @param {number}  opts.speed        — px/s downward
         * @param {string|null} opts.powerupKind — 'shield' | 'slow' | 'autofire'
         */
        constructor({ type, value, x, y, speed, powerupKind = null }) {
            this.type = type;
            this.value = value.toLowerCase();
            // Dev snippets keep lowercase display so they look like real code
            this.displayVal = type === 'dev' ? value.toLowerCase() : value.toUpperCase();
            this.x = x;
            this.y = y;
            this.speed = speed;
            this.typedIndex = 0;       // chars correctly typed so far
            this.active = false;   // currently targeted by player (word mode)
            this.id = ++Enemy._nextId;
            this.powerupKind = powerupKind;
            // Font sizing: sentences smallest, dev slightly smaller than words
            this._charW    = type === 'sentence' ? 8.5 : type === 'dev' ? 9.5 : 11.5;
            this._fontSize = type === 'sentence' ? 14  : type === 'dev' ? 15  : 18;
            this._pad      = 10;
        }

        get completed() { return this.typedIndex >= this.value.length; }

        get width() { return this.value.length * this._charW + this._pad * 2; }
        get height() { return this._fontSize + this._pad * 2; }

        /** Central impact point for missiles */
        get targetX() { return this.x; }
        get targetY() { return this.y; }

        /**
         * Sentence mode: index of the first char of the current word.
         * On typo we rewind here instead of resetting the whole sentence.
         */
        get wordStartIndex() {
            for (let i = this.typedIndex - 1; i >= 0; i--) {
                if (this.value[i] === ' ') return i + 1;
            }
            return 0;
        }

        update(dt) {
            this.y += this.speed * dt;
        }

        draw(ctx) {
            const { x, y, value, displayVal, typedIndex, active, type, powerupKind } = this;
            const w = this.width;
            const h = this.height;
            const bx = x - w / 2;
            const by = y - h / 2;

            ctx.save();
            ctx.font = `bold ${this._fontSize}px 'Courier New', monospace`;

            // --- Colour scheme by entity type & state ---
            let borderCol, bgCol, untypedCol, glowCol;
            if (type === 'powerup') {
                const palette = {
                    shield: Config.COL_CYAN,
                    slow: Config.COL_PURPLE,
                    autofire: Config.COL_ORANGE,
                };
                borderCol = palette[powerupKind] || Config.COL_CYAN;
                glowCol = borderCol;
                bgCol = 'rgba(20,0,40,0.75)';
                untypedCol = borderCol;
            } else if (type === 'dev' && active) {
                borderCol = Config.COL_ORANGE;
                glowCol   = Config.COL_ORANGE;
                bgCol     = 'rgba(32,14,0,0.82)';
                untypedCol = 'rgba(255,180,80,0.75)';
            } else if (type === 'dev') {
                borderCol  = 'rgba(255,120,0,0.5)';
                glowCol    = Config.COL_ORANGE;
                bgCol      = 'rgba(24,10,0,0.68)';
                untypedCol = Config.COL_ORANGE;
            } else if (active) {
                borderCol = Config.COL_YELLOW;
                glowCol = Config.COL_YELLOW;
                bgCol = 'rgba(30,25,0,0.78)';
                untypedCol = 'rgba(0,229,255,0.6)';
            } else {
                borderCol = 'rgba(0,229,255,0.45)';
                glowCol = Config.COL_CYAN;
                bgCol = 'rgba(0,20,35,0.65)';
                untypedCol = Config.COL_CYAN;
            }

            // Background box
            ctx.shadowColor = glowCol;
            ctx.shadowBlur = active ? 18 : 8;
            roundRect(ctx, bx, by, w, h, 5);
            ctx.fillStyle = bgCol;
            ctx.fill();
            ctx.strokeStyle = borderCol;
            ctx.lineWidth = active ? 2 : 1;
            ctx.stroke();

            // Power-up icon (drawn to the left of the box)
            if (type === 'powerup') {
                const icon = powerupKind === 'shield' ? '🛡' : powerupKind === 'slow' ? '⏱' : '🔥';
                ctx.font = '14px sans-serif';
                ctx.shadowBlur = 0;
                ctx.fillText(icon, bx - 22, y + 6);
                ctx.font = `bold ${this._fontSize}px 'Courier New', monospace`;
            }

            // Text — split typed (green) / untyped chars
            ctx.shadowBlur = 10;
            if (type === 'letter') {
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = typedIndex > 0 ? Config.COL_GREEN : untypedCol;
                ctx.shadowColor = typedIndex > 0 ? Config.COL_GREEN : glowCol;
                ctx.fillText(displayVal, x, y);
            } else {
                // Word / powerup: char by char
                const totalW = value.length * this._charW;
                let cx = x - totalW / 2;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                for (let i = 0; i < displayVal.length; i++) {
                    const done = i < typedIndex;
                    ctx.fillStyle = done ? Config.COL_GREEN : untypedCol;
                    ctx.shadowColor = done ? Config.COL_GREEN : glowCol;
                    ctx.fillText(displayVal[i], cx, y);
                    cx += this._charW;
                }
            }

            ctx.restore();
        }
    }
    Enemy._nextId = 0;

    // ═══════════════════════════════════════════════════════════════════════════
    // ENEMY MANAGER — Spawning, difficulty, updates, breach detection
    // ═══════════════════════════════════════════════════════════════════════════
    class EnemyManager {
        constructor(canvas, gameState, effects, audio) {
            this.canvas = canvas;
            this.gameState = gameState;
            this.effects = effects;
            this.audio = audio;
            this.enemies = [];
            this.spawnTimer = 0;
            this.slowFactor = 1.0;    // modified by slow power-up
        }

        reset() {
            this.enemies = [];
            this.spawnTimer = 0;
            this.slowFactor = 1.0;
        }

        _spawnInterval() {
            const lvl = this.gameState.level;
            return Math.max(
                Config.SPAWN_INTERVAL_MIN,
                Config.SPAWN_INTERVAL_MAX - lvl * Config.SPAWN_INTERVAL_REDUCE
            );
        }

        _enemySpeed() {
            const lvl = this.gameState.level;
            return (Config.ENEMY_SPEED_BASE + lvl * Config.ENEMY_SPEED_MULT) * this.slowFactor;
        }

        _maxEnemies() {
            // Sentence mode keeps at most 2 on screen (they are very wide)
            if (this.gameState.mode === 'sentence') return this.gameState.level < 5 ? 1 : 2;
            // Dev mode: slightly more enemies than word mode for extra challenge
            if (this.gameState.mode === 'dev') return Config.MAX_ENEMIES_BASE + 1 + Math.floor(this.gameState.level * Config.MAX_ENEMIES_LEVEL);
            return Config.MAX_ENEMIES_BASE + Math.floor(this.gameState.level * Config.MAX_ENEMIES_LEVEL);
        }

        _pickWord() {
            const lvl = this.gameState.level;
            const tier = lvl < 3 ? 0 : lvl < 7 ? 1 : 2;
            const pool = Config.WORDS[tier];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        _pickSentence() {
            const lvl = this.gameState.level;
            const tier = lvl < 4 ? 0 : lvl < 8 ? 1 : 2;
            const pool = Config.SENTENCES[tier];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        _pickDevSnippet() {
            const lvl = this.gameState.level;
            const tier = lvl < 4 ? 0 : lvl < 8 ? 1 : 2;
            const pool = Config.DEV_SNIPPETS[tier];
            return pool[Math.floor(Math.random() * pool.length)];
        }

        _spawnX() {
            const margin = 70;
            return margin + Math.random() * (this.canvas.width - margin * 2);
        }

        spawn() {
            const isPowerUp = this.gameState.level >= 2 && Math.random() < Config.POWERUP_CHANCE;
            const mode = this.gameState.mode;
            let enemy;

            if (isPowerUp) {
                const kinds = ['shield', 'slow', 'autofire'];
                const kind = kinds[Math.floor(Math.random() * kinds.length)];
                const label = { shield: 'SHIELD', slow: 'SLOW', autofire: 'FIRE' }[kind];
                enemy = new Enemy({
                    type: 'powerup', value: label,
                    x: this._spawnX(), y: -24,
                    speed: this._enemySpeed() * 0.7,
                    powerupKind: kind,
                });
            } else if (mode === 'letter') {
                const alpha = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
                const letter = alpha[Math.floor(Math.random() * alpha.length)];
                enemy = new Enemy({ type: 'letter', value: letter, x: this._spawnX(), y: -24, speed: this._enemySpeed() });
            } else if (mode === 'sentence') {
                // Sentences spawn horizontally centred and descend slowly
                enemy = new Enemy({
                    type: 'sentence', value: this._pickSentence(),
                    x: this.canvas.width / 2, y: -24,
                    speed: this._enemySpeed() * 0.6,
                });
            } else if (mode === 'dev') {
                enemy = new Enemy({
                    type: 'dev', value: this._pickDevSnippet(),
                    x: this._spawnX(), y: -24,
                    speed: this._enemySpeed(),
                });
            } else {
                enemy = new Enemy({ type: 'word', value: this._pickWord(), x: this._spawnX(), y: -24, speed: this._enemySpeed() });
            }

            this.enemies.push(enemy);
        }

        update(dt) {
            // Throttle spawns
            this.spawnTimer -= dt;
            if (this.spawnTimer <= 0) {
                if (this.enemies.length < this._maxEnemies()) this.spawn();
                this.spawnTimer = this._spawnInterval();
            }

            const bottom = this.canvas.height;
            const breached = [];

            this.enemies.forEach(e => {
                e.update(dt);
                if (e.y - this._enemySize(e) > bottom) breached.push(e);
            });

            breached.forEach(e => {
                this.removeEnemy(e);
                if (e.type !== 'powerup') {
                    this.gameState.loseHealth();
                    this.effects.explode(e.x, bottom - 20, Config.COL_RED, 16);
                    this.effects.triggerShake();
                }
            });
        }

        _enemySize(e) { return e.height / 2 + 4; }

        removeEnemy(enemy) {
            const idx = this.enemies.indexOf(enemy);
            if (idx !== -1) this.enemies.splice(idx, 1);
        }

        draw(ctx) {
            this.enemies.forEach(e => e.draw(ctx));
        }

        // ── Query helpers used by InputHandler ────────────────────

        /** Letter mode: find the lowest (most dangerous) enemy matching 'key'. */
        findByLetter(key) {
            const k = key.toLowerCase();
            const matches = this.enemies.filter(e => e.type === 'letter' && e.value === k);
            if (!matches.length) return null;
            return matches.reduce((best, e) => e.y > best.y ? e : best);
        }

        /** Word/sentence mode: return the currently active (targeted) enemy. */
        getActiveWord() {
            return this.enemies.find(e => (e.type === 'word' || e.type === 'powerup' || e.type === 'sentence' || e.type === 'dev') && e.active) || null;
        }

        /**
         * Word mode: find the lowest enemy whose first char matches key,
         * mark it active, and return it. Returns null if none found.
         */
        activateByFirstChar(key) {
            const k = key.toLowerCase();
            const candidates = this.enemies.filter(
                e => (e.type === 'word' || e.type === 'powerup' || e.type === 'sentence' || e.type === 'dev') && !e.active && e.value[0] === k
            );
            if (!candidates.length) return null;
            const target = candidates.reduce((best, e) => e.y > best.y ? e : best);
            target.active = true;
            return target;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MISSILE — A projectile that flies from the ship to a target enemy
    // ═══════════════════════════════════════════════════════════════════════════
    class Missile {
        constructor(startX, startY, target, onImpact) {
            this.x = startX;
            this.y = startY;
            this.target = target;
            this.onImpact = onImpact;
            this.done = false;
            this.trail = [];
            this.TRAIL = 8;
        }

        update(dt) {
            if (this.done) return;
            const tx = this.target.targetX;
            const ty = this.target.targetY;
            const dx = tx - this.x;
            const dy = ty - this.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 8) {
                this.done = true;
                this.onImpact();
                return;
            }
            const step = Math.min(Config.MISSILE_SPEED * dt, d);
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.TRAIL) this.trail.shift();
            this.x += (dx / d) * step;
            this.y += (dy / d) * step;
        }

        draw(ctx) {
            if (this.done) return;
            ctx.save();
            // Trail
            this.trail.forEach((pt, i) => {
                const a = (i / this.trail.length) * 0.5;
                const r = 1.5 * (i / this.trail.length);
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0,229,255,${a})`;
                ctx.fill();
            });
            // Head
            ctx.beginPath();
            ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = Config.COL_CYAN;
            ctx.shadowBlur = 14;
            ctx.fill();
            ctx.restore();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // MISSILE MANAGER — Creates, updates, and resolves missiles
    // ═══════════════════════════════════════════════════════════════════════════
    class MissileManager {
        constructor(ship, enemyMgr, effects, audio) {
            this.ship = ship;
            this.enemyMgr = enemyMgr;
            this.effects = effects;
            this.audio = audio;
            this.missiles = [];
        }

        reset() { this.missiles = []; }

        fire(target) {
            const m = new Missile(this.ship.x, this.ship.y, target, () => this._onImpact(target));
            this.missiles.push(m);
            this.audio.playLaser();
        }

        _onImpact(enemy) {
            if (enemy.completed) {
                this.effects.explode(enemy.targetX, enemy.targetY, Config.COL_CYAN, 22);
                this.effects.triggerShake();
                this.audio.playExplosion();
                this.enemyMgr.removeEnemy(enemy);
            }
            // Partial hits (mid-word) just light up effects without removing
        }

        update(dt) {
            this.missiles = this.missiles.filter(m => { m.update(dt); return !m.done; });
        }

        draw(ctx) {
            this.missiles.forEach(m => m.draw(ctx));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HUD — Updates the DOM overlay (score, combo, health, mode)
    // ═══════════════════════════════════════════════════════════════════════════
    class HUD {
        constructor() {
            this._hud    = document.getElementById('hud');
            this._score  = document.getElementById('hud-score');
            this._mode   = document.getElementById('hud-mode');
            this._combo  = document.getElementById('hud-combo');
            this._errors = document.getElementById('hud-errors');
            this._health = document.getElementById('hud-health-bar');
            this._lastCombo = 1;
        }

        show() { this._hud.classList.remove('hidden'); }
        hide() { this._hud.classList.add('hidden'); }

        setScore(v) { this._score.textContent = v.toLocaleString(); }
        setMode(m)  {
            const labels = { letter: 'LETTERS', word: 'WORDS', sentence: 'SENTENCES', dev: 'DEV MODE' };
            this._mode.textContent = labels[m] || m.toUpperCase();
        }
        setErrors(n) { this._errors.textContent = n; }

        setCombo(v) {
            this._combo.textContent = `x${v}`;
            if (v > this._lastCombo) {
                this._combo.classList.remove('pop');
                void this._combo.offsetWidth;   // force reflow to re-trigger animation
                this._combo.classList.add('pop');
            }
            this._lastCombo = v;
        }

        setHealth(hp) {
            const pct = Math.max(0, hp);
            this._health.style.width = `${pct}%`;
            pct <= 30
                ? this._health.classList.add('danger')
                : this._health.classList.remove('danger');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // POWER-UP MANAGER — Timed active effects: shield, slow, auto-fire
    // ═══════════════════════════════════════════════════════════════════════════
    class PowerUpManager {
        constructor(enemyMgr, ship, gameState, audio, missileMgrRef) {
            this.enemyMgr = enemyMgr;
            this.ship = ship;
            this.gameState = gameState;
            this.audio = audio;
            this.missileMgrRef = missileMgrRef; // getter fn to avoid circular dep
            this.active = {};            // { kind: secondsRemaining }
            this.autofireTimer = 0;
            this._banner = document.getElementById('powerup-banner');
            this._bannerTO = null;
        }

        reset() {
            this.active = {};
            this.autofireTimer = 0;
            this.ship.shieldActive = false;
            this.gameState.shielded = false;
            this.enemyMgr.slowFactor = 1.0;
            this._banner.classList.add('hidden');
            if (this._bannerTO) clearTimeout(this._bannerTO);
        }

        activate(kind) {
            this.audio.playPowerUp();
            if (kind === 'shield') {
                this.active.shield = Config.POWERUP_SHIELD_DUR;
                this.ship.shieldActive = true;
                this.gameState.shielded = true;
                this._showBanner('🛡 SHIELD ACTIVE', 'shield');
            } else if (kind === 'slow') {
                this.active.slow = Config.POWERUP_SLOW_DUR;
                this.enemyMgr.slowFactor = Config.POWERUP_SLOW_FACTOR;
                this._showBanner('⏱ SLOW-MO ACTIVE', 'slow');
            } else if (kind === 'autofire') {
                this.active.autofire = Config.POWERUP_AUTOFIRE_DUR;
                this.autofireTimer = 0;
                this._showBanner('🔥 AUTO-FIRE ACTIVE', 'autofire');
            }
        }

        _showBanner(msg, cls) {
            this._banner.textContent = msg;
            this._banner.className = cls;  // strips 'hidden'
            if (this._bannerTO) clearTimeout(this._bannerTO);
            this._bannerTO = setTimeout(() => this._banner.classList.add('hidden'), 2600);
        }

        update(dt) {
            ['shield', 'slow', 'autofire'].forEach(k => {
                if (this.active[k] === undefined) return;
                this.active[k] -= dt;
                if (this.active[k] <= 0) {
                    delete this.active[k];
                    if (k === 'shield') { this.ship.shieldActive = false; this.gameState.shielded = false; }
                    if (k === 'slow') { this.enemyMgr.slowFactor = 1.0; }
                }
            });

            // Auto-fire: periodically destroy the lowest enemy
            if (this.active.autofire !== undefined) {
                this.autofireTimer -= dt;
                if (this.autofireTimer <= 0) {
                    this.autofireTimer = Config.POWERUP_AUTOFIRE_INT;
                    const target = this._lowestEnemy();
                    if (target) {
                        target.typedIndex = target.value.length;  // mark complete
                        this.missileMgrRef().fire(target);
                    }
                }
            }
        }

        _lowestEnemy() {
            let best = null;
            let bestY = -Infinity;
            this.enemyMgr.enemies.forEach(e => {
                if (e.y > bestY) { bestY = e.y; best = e; }
            });
            return best;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // KEY LOG — Debug overlay showing every keystroke and its outcome
    // ═══════════════════════════════════════════════════════════════════════════
    class KeyLog {
        constructor() {
            this._panel   = document.getElementById('key-log');
            this._entries = document.getElementById('key-log-entries');
            this._MAX     = 12;  // max rows visible
        }

        show() { this._panel.classList.remove('hidden'); }
        hide() { this._panel.classList.add('hidden'); }

        /**
         * @param {string} key      - the character pressed
         * @param {'hit'|'miss'|'none'} result
         * @param {string} detail   - short description (e.g. target word + progress)
         */
        push(key, result, detail) {
            const entry = document.createElement('div');
            entry.className = 'kl-entry';

            const kSpan = document.createElement('span');
            kSpan.className = `kl-key ${result}`;
            kSpan.textContent = key === ' ' ? '␣' : key;  // show ␣ for space

            const dSpan = document.createElement('span');
            dSpan.className = 'kl-detail';
            dSpan.textContent = detail;

            entry.appendChild(kSpan);
            entry.appendChild(dSpan);
            this._entries.prepend(entry);

            // Keep max rows
            while (this._entries.children.length > this._MAX) {
                this._entries.removeChild(this._entries.lastChild);
            }
        }

        clear() { this._entries.innerHTML = ''; }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME STATE — Score, health, combos, level, state machine
    // ═══════════════════════════════════════════════════════════════════════════
    class GameState {
        constructor() {
            this.state = 'MENU';  // MENU | PLAYING | PAUSED | GAMEOVER
            this.mode = 'letter';
            this.score = 0;
            this.health = Config.HEALTH_START;
            this.combo = 1;
            this.typos = 0;
            this.level = 0;
            this.levelTimer = 0;
            this.comboTimer = 0;
            this.shielded = false;
            this.fogEnabled = false;  // toggled on start screen
            this.fogOpacity = 0;     // 0–0.9, thickens with typos, clears after idle
            this._fogIdleTimer = 0;  // seconds since last typo
            this._cbGameOver = null;
            this._cbHealthChange = null;
        }

        onGameOver(fn) { this._cbGameOver = fn; }
        onHealthChange(fn) { this._cbHealthChange = fn; }

        reset(mode, failRate = 'normal', fogEnabled = false) {
            this.mode = mode;
            this.failRate = failRate;
            this.healthLoss = Config.FAIL_RATE[failRate] ?? Config.HEALTH_LOSS;
            this.score = 0;
            this.health = Config.HEALTH_START;
            this.combo = 1;
            this.typos = 0;
            this.level = 0;
            this.levelTimer = 0;
            this.comboTimer = 0;
            this.shielded = false;
            this.fogEnabled = fogEnabled ?? false;
            this.fogOpacity = 0;
            this._fogIdleTimer = 0;
            this.state = 'PLAYING';
        }

        update(dt) {
            if (this.state !== 'PLAYING') return;

            // Level progression
            this.levelTimer += dt;
            if (this.levelTimer >= Config.LEVEL_UP_INTERVAL && this.level < Config.MAX_LEVEL) {
                this.levelTimer -= Config.LEVEL_UP_INTERVAL;
                this.level++;
            }

            // Combo decay
            if (this.combo > 1) {
                this.comboTimer += dt;
                if (this.comboTimer >= Config.COMBO_DECAY) {
                    this.combo = 1;
                    this.comboTimer = 0;
                }
            }

            // Fog decay — after 10 s without a typo, clear at 0.08 opacity/s
            if (this.fogOpacity > 0) {
                this._fogIdleTimer += dt;
                if (this._fogIdleTimer >= 10) {
                    this.fogOpacity = Math.max(0, this.fogOpacity - 0.08 * dt);
                }
            }
        }

        addScore(base) {
            this.score += base * this.combo;
        }

        recordTypo() {
            this.typos++;
            this.score = Math.max(0, this.score - Config.SCORE_TYPO_PENALTY);
            this.fogOpacity = Math.min(this.fogOpacity + 0.1, 0.9);
            this._fogIdleTimer = 0;  // reset the grace period on each new typo
        }

        increaseCombo() {
            if (this.combo < Config.COMBO_MAX) this.combo++;
            this.comboTimer = 0;
        }

        breakCombo() {
            this.combo = 1;
            this.comboTimer = 0;
        }

        loseHealth() {
            if (this.shielded) return;
            this.health = Math.max(0, this.health - (this.healthLoss ?? Config.HEALTH_LOSS));
            if (this._cbHealthChange) this._cbHealthChange(this.health);
            if (this.health <= 0 && this.state === 'PLAYING') {
                this.state = 'GAMEOVER';
                if (this._cbGameOver) this._cbGameOver(this.score, this.level + 1, this.combo);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INPUT HANDLER — Routes keyboard events to game logic
    // ═══════════════════════════════════════════════════════════════════════════
    class InputHandler {
        constructor(gameState, enemyMgr, missileMgr, effects, audio, hud, powerups) {
            this.gameState = gameState;
            this.enemyMgr = enemyMgr;
            this.missileMgr = missileMgr;
            this.effects = effects;
            this.audio = audio;
            this.hud = hud;
            this.powerups = powerups;
            this.keyLog = new KeyLog();
            this._handler = this._onKey.bind(this);
        }

        attach() { window.addEventListener('keydown', this._handler); }
        detach() { window.removeEventListener('keydown', this._handler); }

        _onKey(e) {
            if (this.gameState.state !== 'PLAYING') return;
            if (e.key.length !== 1) return;  // ignore arrows, Enter, etc.
            const key = e.key.toLowerCase();
            if (this.gameState.mode === 'letter') this._letterMode(key);
            else if (this.gameState.mode === 'sentence') this._sentenceMode(key);
            else this._wordMode(key);  // 'word' and 'dev' share the same input logic
            // Sync HUD after each key press
            this.hud.setScore(this.gameState.score);
            this.hud.setCombo(this.gameState.combo);
            this.hud.setErrors(this.gameState.typos);
        }

        // Helper: build a readable detail string for the log
        _logDetail(active, key, hit) {
            if (!active) return 'no target';
            const progress = active.value.substring(0, active.typedIndex);
            const remaining = active.value.substring(active.typedIndex);
            return `${progress}║${remaining}` + (hit ? '' : ` ← got '${key}'`);
        }

        _letterMode(key) {
            const enemy = this.enemyMgr.findByLetter(key);
            if (!enemy) {
                this.keyLog.push(key, 'none', 'no letter match');
                return;
            }
            enemy.typedIndex = 1;
            this.gameState.addScore(Config.SCORE_LETTER);
            this.gameState.increaseCombo();
            this.audio.playTypingBlip();
            this.missileMgr.fire(enemy);
            this.keyLog.push(key, 'hit', `letter '${key}' destroyed`);
        }

        _wordMode(key) {
            let active = this.enemyMgr.getActiveWord();

            if (!active) {
                // No active word — try to start one
                active = this.enemyMgr.activateByFirstChar(key);
                if (!active) {
                    // No word starts with this key
                    this.keyLog.push(key, 'none', 'no word starts with this');
                    this.gameState.breakCombo();
                    this.gameState.recordTypo();
                    this.audio.playError();
                    this.hud.setCombo(this.gameState.combo);
                    return;
                }
                this.keyLog.push(key, 'hit', `activated: ${active.value}`);
            }

            const nextChar = active.value[active.typedIndex];
            if (key === nextChar) {
                // Correct character
                active.typedIndex++;
                this.gameState.addScore(Config.SCORE_LETTER);
                this.gameState.increaseCombo();
                this.audio.playTypingBlip();

                if (active.completed) {
                    // Word/dev fully typed — completion bonus + kill shot
                    const bonus = active.type === 'dev' ? Config.SCORE_DEV_BONUS : Config.SCORE_WORD_BONUS;
                    this.gameState.addScore(bonus);
                    active.active = false;
                    this.missileMgr.fire(active);
                    // Activate power-up if this was a power-up entity
                    if (active.type === 'powerup') this.powerups.activate(active.powerupKind);
                    this.keyLog.push(key, 'hit', `DONE: ${active.value}`);
                } else {
                    // Mid-word — fire a partial shot (animate progress)
                    this.missileMgr.fire(active);
                    this.keyLog.push(key, 'hit', this._logDetail(active, key, true));
                }
            } else {
                // Wrong character — reset this word, break combo, flash
                this.keyLog.push(key, 'miss', this._logDetail(active, key, false));
                active.typedIndex = 0;
                active.active = false;
                this.gameState.breakCombo();
                this.gameState.recordTypo();
                this.audio.playError();
                this.effects.triggerShake();
                this.hud.setCombo(this.gameState.combo);
            }
        }

        _sentenceMode(key) {
            let active = this.enemyMgr.getActiveWord();

            if (!active) {
                // No active sentence — try to start one by matching its first char
                active = this.enemyMgr.activateByFirstChar(key);
                if (!active) {
                    this.keyLog.push(key, 'none', 'no sentence starts with this');
                    this.gameState.breakCombo();
                    this.gameState.recordTypo();
                    this.audio.playError();
                    this.hud.setCombo(this.gameState.combo);
                    return;
                }
                this.keyLog.push(key, 'hit', `activated: ${active.value.substring(0,20)}…`);
            }

            const nextChar = active.value[active.typedIndex];
            if (key === nextChar) {
                active.typedIndex++;
                this.gameState.addScore(Config.SCORE_LETTER);
                this.gameState.increaseCombo();
                this.audio.playTypingBlip();

                if (active.completed) {
                    // Full sentence typed — bonus + kill
                    this.gameState.addScore(Config.SCORE_SENTENCE_BONUS);
                    active.active = false;
                    this.missileMgr.fire(active);
                    this.keyLog.push(key, 'hit', `DONE: sentence`);
                } else {
                    // Mid-sentence progress shot
                    this.missileMgr.fire(active);
                    this.keyLog.push(key, 'hit', this._logDetail(active, key, true));
                }
            } else {
                // Typo — rewind to the start of the current word only, not the whole sentence
                this.keyLog.push(key, 'miss', this._logDetail(active, key, false));
                active.typedIndex = active.wordStartIndex;
                this.gameState.breakCombo();
                this.gameState.recordTypo();
                this.audio.playError();
                this.effects.triggerShake();
                this.hud.setCombo(this.gameState.combo);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // GAME — Master class; owns the canvas, RAF loop, and all subsystems
    // ═══════════════════════════════════════════════════════════════════════════
    class Game {
        constructor() {
            this.canvas = document.getElementById('gameCanvas');
            this.ctx = this.canvas.getContext('2d');

            // Instantiate all subsystems
            this.gameState = new GameState();
            this.audio = new AudioManager();
            this.starField = new StarField(this.canvas);
            this.ship = new Ship(this.canvas);
            this.effects = new EffectsManager(this.canvas);
            this.asteroidField = new AsteroidField(this.canvas);
            this.enemyMgr = new EnemyManager(this.canvas, this.gameState, this.effects, this.audio);
            // missileMgr needs a back-ref for powerups — pass a getter to avoid circular dep
            this.missileMgr = new MissileManager(this.ship, this.enemyMgr, this.effects, this.audio);
            this.hud = new HUD();
            this.powerups = new PowerUpManager(
                this.enemyMgr, this.ship, this.gameState, this.audio,
                () => this.missileMgr
            );
            this.input = new InputHandler(
                this.gameState, this.enemyMgr, this.missileMgr,
                this.effects, this.audio, this.hud, this.powerups
            );

            // Screen DOM references
            this._screens = {
                start: document.getElementById('screen-start'),
                gameover: document.getElementById('screen-gameover'),
                pause: document.getElementById('screen-pause'),
            };

            this._lastTs = 0;

            this._bindUI();
            this._resize();
            window.addEventListener('resize', () => this._resize());

            // Kick off the render loop immediately (animates stars on main menu)
            requestAnimationFrame(ts => this._loop(ts));
        }

        // ── UI / Event wiring ─────────────────────────────────────

        _bindUI() {
            // Fail-rate selector
            const failBtns = document.getElementById('fail-rate-buttons');
            failBtns.addEventListener('click', e => {
                const btn = e.target.closest('.btn-fail');
                if (!btn) return;
                failBtns.querySelectorAll('.btn-fail').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._selectedFailRate = btn.dataset.rate;
            });
            this._selectedFailRate = 'normal'; // default

            // Fog toggle
            const fogBtns = document.getElementById('fog-buttons');
            fogBtns.addEventListener('click', e => {
                const btn = e.target.closest('.btn-fog');
                if (!btn) return;
                fogBtns.querySelectorAll('.btn-fog').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._fogEnabled = btn.dataset.fog === 'on';
            });
            this._fogEnabled = false; // default: off

            // Start screen
            document.getElementById('btn-letter-mode').addEventListener('click', () => this.start('letter'));
            document.getElementById('btn-word-mode').addEventListener('click',   () => this.start('word'));
            document.getElementById('btn-sentence-mode').addEventListener('click', () => this.start('sentence'));
            document.getElementById('btn-dev-mode').addEventListener('click',      () => this.start('dev'));

            // Game-over screen restarts
            document.getElementById('btn-restart-letter').addEventListener('click',   () => this.start('letter'));
            document.getElementById('btn-restart-word').addEventListener('click',     () => this.start('word'));
            document.getElementById('btn-restart-sentence').addEventListener('click', () => this.start('sentence'));
            document.getElementById('btn-restart-dev').addEventListener('click',      () => this.start('dev'));

            // Pause screen buttons
            document.getElementById('btn-pause-restart').addEventListener('click', () => this.start(this.gameState.mode, this.gameState.failRate));
            document.getElementById('btn-pause-menu').addEventListener('click', () => this._mainMenu());

            // Pause / resume
            window.addEventListener('keydown', e => {
                if (e.key !== 'Escape') return;
                if (this.gameState.state === 'PLAYING') this._pause();
                else if (this.gameState.state === 'PAUSED') this._resume();
            });

            // Callbacks from GameState
            this.gameState.onGameOver((score, level, combo) => {
                this._onGameOver(score, level, combo);
            });
            this.gameState.onHealthChange(hp => {
                this.hud.setHealth(hp);
                if (hp > 0) this.ship.flash();
            });
        }

        _resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
            this.starField.resize(this.canvas.width, this.canvas.height);
        }

        // ── Game lifecycle ─────────────────────────────────────────

        start(mode, failRate) {
            this.audio.init();           // unlock AudioContext on first gesture
            // Use provided failRate, or the one selected on the start screen
            const rate = failRate || this._selectedFailRate || 'normal';
            this.gameState.reset(mode, rate, this._fogEnabled ?? false);
            this.enemyMgr.reset();
            this.missileMgr.reset();
            this.powerups.reset();

            this.hud.show();
            this.hud.setScore(0);
            this.hud.setCombo(1);
            this.hud.setErrors(0);
            this.hud.setHealth(Config.HEALTH_START);
            this.hud.setMode(mode);

            // Show key log only in dev mode; hide (and clear) otherwise
            if (mode === 'dev') {
                this.input.keyLog.clear();
                this.input.keyLog.show();
            } else {
                this.input.keyLog.hide();
            }

            this._showScreen(null);
            this.input.attach();
        }

        _pause() {
            this.gameState.state = 'PAUSED';
            this._showScreen('pause');
        }

        _resume() {
            this.gameState.state = 'PLAYING';
            this._showScreen(null);
            this._lastTs = performance.now(); // reset dt to avoid large time-jump
        }

        _mainMenu() {
            this.input.detach();
            this.enemyMgr.reset();
            this.missileMgr.reset();
            this.powerups.reset();
            this.hud.hide();
            this.gameState.state = 'MENU';
            this._showScreen('start');
        }

        _onGameOver(score, level, _combo) {
            this.input.detach();
            this.hud.hide();
            const typos   = this.gameState.typos;
            const penalty = typos * Config.SCORE_TYPO_PENALTY;
            document.getElementById('gameover-score').textContent = score.toLocaleString();
            document.getElementById('gameover-combo').textContent =
                `Level ${level} · Peak combo ×${_combo} · Typos: ${typos} (−${penalty} pts)`;
            this.audio.playGameOver();
            this._showScreen('gameover');
        }

        _showScreen(name) {
            Object.entries(this._screens).forEach(([k, el]) => {
                name === k ? el.classList.remove('hidden') : el.classList.add('hidden');
            });
        }

        // ── Game Loop ──────────────────────────────────────────────

        _loop(timestamp) {
            requestAnimationFrame(ts => this._loop(ts));

            let dt = (timestamp - this._lastTs) / 1000;
            this._lastTs = timestamp;
            // Cap delta — prevents spiral-of-death after tab is hidden/unhidden
            if (dt > 0.1) dt = 0.1;

            this._update(dt);
            this._draw();
        }

        _update(dt) {
            // Stars and ship animate even on the menu screen
            this.starField.update(dt);
            this.ship.update(dt);
            this.asteroidField.update(dt);

            if (this.gameState.state !== 'PLAYING') return;

            this.gameState.update(dt);
            this.enemyMgr.update(dt);
            this.missileMgr.update(dt);
            this.effects.update(dt);
            this.powerups.update(dt);
            this.asteroidField.setLevel(this.gameState.level);

            // Keep HUD in sync every frame
            this.hud.setScore(this.gameState.score);
            this.hud.setCombo(this.gameState.combo);
            this.hud.setErrors(this.gameState.typos);
            this.hud.setHealth(this.gameState.health);
        }

        _draw() {
            const ctx = this.ctx;
            const W = this.canvas.width;
            const H = this.canvas.height;

            // Background
            ctx.fillStyle = Config.COL_BG;
            ctx.fillRect(0, 0, W, H);

            // Parallax stars
            this.starField.draw(ctx);

            // Particle effects (behind enemies so explosions don't occlude active text)
            this.effects.draw(ctx);

            // Game entities — only while playing or paused
            if (this.gameState.state === 'PLAYING' || this.gameState.state === 'PAUSED') {
                this.enemyMgr.draw(ctx);
                // Asteroids are drawn AFTER enemies so they occlude target labels
                this.asteroidField.draw(ctx);
                this.missileMgr.draw(ctx);
            } else {
                // Still draw asteroids on menu / game-over for atmosphere
                this.asteroidField.draw(ctx);
            }

            // Ship — show whenever NOT on main menu
            if (this.gameState.state !== 'MENU') {
                this.ship.draw(ctx);
            }

            // Typo fog — only when enabled on the start screen.
            // Black veil thickens with each mistake, clears after 10 s of clean typing.
            if (this.gameState.fogEnabled &&
                (this.gameState.state === 'PLAYING' || this.gameState.state === 'PAUSED')) {
                const fogOpacity = this.gameState.fogOpacity;
                if (fogOpacity > 0) {
                    ctx.fillStyle = `rgba(0,0,0,${fogOpacity.toFixed(3)})`;
                    ctx.fillRect(0, 0, W, H);
                }
            }

            // Danger line at canvas bottom (subtle red glow) — drawn after fog so it peeks through
            if (this.gameState.state === 'PLAYING') {
                const g = ctx.createLinearGradient(0, H - 2, W, H - 2);
                g.addColorStop(0, 'rgba(255,56,96,0)');
                g.addColorStop(0.5, 'rgba(255,56,96,0.4)');
                g.addColorStop(1, 'rgba(255,56,96,0)');
                ctx.fillStyle = g;
                ctx.fillRect(0, H - 2, W, 2);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // BOOTSTRAP — Start the game once the DOM is ready
    // ═══════════════════════════════════════════════════════════════════════════
    document.addEventListener('DOMContentLoaded', () => { new Game(); });


    /*
    ═══════════════════════════════════════════════════════════════════════════════
    MULTIPLAYER DESIGN  (Future Phase — architecture only, not implemented)
    ═══════════════════════════════════════════════════════════════════════════════
  
    OVERVIEW
    ─────────────────────────────────────────────────────────────────────────────
    Real-time 2–4 player typing battle where players compete to destroy shared
    enemies. A Node.js + Socket.io server is authoritative for all game state.
  
    SERVER  (Node.js + Express + Socket.io v4)
    ─────────────────────────────────────────────────────────────────────────────
    • Room-based: players join via a room code. Game begins when headcount >= 2.
    • Only the server runs the spawn clock; clients receive `enemy:spawn` events.
    • Server ticks at 20 Hz (~50 ms), broadcasting `state:tick` with all enemy
      y-positions. Clients interpolate between ticks for smooth visuals.
    • Authoritative scoring: when a player emits `player:typed`, the server
      validates the character, updates scores, and broadcasts `score:update`.
  
    CLIENT CHANGES
    ─────────────────────────────────────────────────────────────────────────────
    • On `enemy:spawn`     → EnemyManager.addFromServer(data)
    • On `state:tick`      → lerp each enemy's y toward authoritative position
    • On keypress          → emit `player:typed { roomId, enemyId, char }`
                             (instead of mutating local state directly)
    • On `enemy:claimed`   → dim/grey-out enemy for all other players
    • On `enemy:destroyed` → trigger local explosion + score flash
    • On `room:gameover`   → show end-of-round leaderboard overlay
  
    CLAIM SYSTEM
    ─────────────────────────────────────────────────────────────────────────────
    • First player to type the first correct character of a word server-locks it.
    • Other players see the enemy dimmed ("claimed" CSS style).
    • If the claiming player makes a typo, the word is released for anyone.
  
    STORAGE & LEADERBOARD
    ─────────────────────────────────────────────────────────────────────────────
    • POST /scores  — submit end-of-round { playerId, score, level, mode }
    • GET  /scores?top=10  — return top leaderboard entries
    • Backed by Redis sorted sets in production, SQLite in development.
  
    SYNC STRATEGY
    ─────────────────────────────────────────────────────────────────────────────
    • Server broadcasts authoritative enemy y-positions at 20 Hz.
    • Clients apply linear interpolation over the 50 ms tick window.
    • Latency tolerance: server accepts `player:typed` events up to +200 ms
      after the enemy's breach deadline before rejecting as too late.
  
    SUGGESTED TECH STACK
    ─────────────────────────────────────────────────────────────────────────────
    Server:    Node.js 20+, Express 4, Socket.io 4
    Storage:   Redis (sorted sets for leaderboard, pub/sub for room events)
    Auth:      Ephemeral UUID per browser tab — no login required
    Deployment:Any Node.js host (Railway, Fly.io, Render, etc.)
  
    ═══════════════════════════════════════════════════════════════════════════════
    */

})();
