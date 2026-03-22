# 🎮 TypeFighter

> A space-arcade typing game. Destroy falling enemies by typing what you see — before they reach the bottom.

![TypeFighter](https://img.shields.io/badge/game-typing_arcade-00e5ff?style=flat-square) ![Vanilla JS](https://img.shields.io/badge/built_with-vanilla_JS-ffe600?style=flat-square) ![No dependencies](https://img.shields.io/badge/dependencies-none-39ff14?style=flat-square)

---

## 🚀 Play

No build step. No dependencies. Just open `index.html` in a browser.

```bash
# Clone
git clone https://github.com/philipdenys/typefighter.git
cd typefighter

# Serve locally (any static server works)
npx serve .
# or
python3 -m http.server 5500
```

Then open [http://localhost:5500](http://localhost:5500).

---

## 🕹️ Game Modes

| Mode | Description | Difficulty |
|------|-------------|------------|
| **Letter Mode** | Single letters rain down — type them to shoot | Beginner |
| **Word Mode** | Full words descend — type them char by char | Advanced |
| **Sentence Mode** | Full sentences fall — typo rewinds current word only | Expert |
| **Dev Mode** | HTML tags, CSS props, JS snippets with special chars | Hacker |

---

## ⚙️ Options

- **Fail Rate** — LOW (-10 HP) / NORMAL (-20 HP) / HIGH (-35 HP) per breach  
- **Typo Fog** — ON: screen darkens with each typo, clears after 10 s of clean typing

---

## 🛸 Mechanics

- **Combo multiplier** — consecutive correct keys multiply your score (up to ×16)
- **Health bar** — enemies reaching the bottom cost HP; game over at 0
- **Power-ups** — 🛡 Shield, ⏱ Slow-Mo, 🔥 Auto-Fire drop randomly from level 2+
- **Difficulty scaling** — speed, enemy count, and word tier increase every 30 seconds
- **Asteroids** — rocky obstacles drift in from all sides, occluding targets
- **Screen shake + explosions** — satisfying particle effects on every kill

---

## 🏗️ Architecture

| File | Purpose |
|------|---------|
| `index.html` | Canvas + HUD DOM overlay + all screen modals |
| `styles.css` | Space theme, neon glow, HUD layout, animations |
| `script.js` | All game logic — 14 ES6 classes in a single IIFE |

**No frameworks. No build step.** Canvas API for rendering, Web Audio API for synth sounds, `requestAnimationFrame` game loop with delta-time capping.

See [FEATURES.md](FEATURES.md) for a full feature inventory.

---

## 📜 License

MIT
