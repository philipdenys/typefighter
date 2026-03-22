# TypeFighter — Features

`[x]` = implemented and active  
`[ ]` = planned / not yet implemented

---

## 🎮 Game Modes

- [x] **Letter Mode** — individual letters fall, type to shoot
- [x] **Word Mode** — full words descend, typed character by character
- [x] **Sentence Mode** — full sentences fall; a typo rewinds only to the start of the current word
- [x] **DEV Mode** — HTML/CSS/JS snippets with brackets, colons, semicolons, and special chars; orange neon theme

---

## 💥 Core Gameplay

- [x] **Health system** — 100 HP, lose HP each time an enemy breaches the bottom
- [x] **Fail Rate selector** — LOW (−10 HP) / NORMAL (−20 HP) / HIGH (−35 HP) per breach
- [x] **Combo multiplier** — consecutive correct keys build up to ×16; decays after 3 s of inactivity
- [x] **Typo counter** — tracks mistaken keystrokes; shown in HUD and game-over summary
- [x] **Score penalty** — −5 pts per typo
- [x] **Difficulty scaling** — enemy speed, spawn rate, and word tier increase every 30 seconds
- [x] **Game-over screen** — shows final score, total typos, and cumulative penalty

---

## 🌫️ Difficulty Options

- [x] **Typo Fog** (OFF/ON toggle) — black fog overlay thickens with each typo (opacity = typos × 0.1, max 0.9); auto-clears after 10 s of clean typing

---

## 🛸 Power-Ups

- [x] **Shield** (🛡) — 10 s immunity to HP loss from breaches
- [x] **Slow-Mo** (⏱) — 8 s of halved enemy speed
- [x] **Auto-Fire** (🔥) — 6 s of automatic enemy destruction

---

## 🌌 Visuals & Effects

- [x] **Parallax star field** — 3 depth layers scrolling at different speeds
- [x] **Missile system** — projectiles with glowing trail effects
- [x] **Particle explosions** — burst of colored particles on enemy destruction
- [x] **Screen shake** — triggered on enemy breach, scales with fail rate
- [x] **Asteroid field** — 9 jagged rocks drift in from all 4 edges, scale with level, occlude text
- [x] **Neon glow aesthetic** — per-mode color themes (cyan / green / yellow / orange)

---

## 🖥️ HUD & UI

- [x] **Score display** with combo multiplier indicator
- [x] **Mode indicator** — shows active game mode
- [x] **Health bar** — animated, pulses red when low
- [x] **Typo counter** in HUD
- [x] **Power-up banner** — slides in with active power-up name + countdown
- [x] **DEV key log panel** — bottom-right overlay; shows each keypress result (green = hit with progress, red = miss with expected vs actual, grey = no target); DEV mode only
- [x] **Pause screen** — ESC key; shows Restart and Main Menu buttons
- [x] **Game-over screen** — per-mode restart buttons + Main Menu

---

## 🔊 Audio

- [x] **Synthesized sound effects** — Web Audio API oscillator synth; zero external audio files
- [ ] **Sound toggle** — mute/unmute without refreshing

---

## 🌐 Multiplayer / Future

- [ ] **Multiplayer** — 2–4 players, competitive lanes; architecture designed for Node.js + Socket.io (documented in code)
- [ ] **High score leaderboard** — persistent best scores
- [ ] **Mobile / touch support** — on-screen keyboard integration
- [ ] **Custom word lists** — user-supplied text input for practice mode
