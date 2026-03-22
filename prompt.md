You are a senior JavaScript game developer.

Build a web-based typing game with a fun, arcade-style experience using HTML, CSS, and vanilla JavaScript (no heavy frameworks). The game must be clean, modular, and easy to expand later.

----------------------------------
CORE GAME CONCEPT
----------------------------------
- The player controls a spaceship positioned at the bottom of the screen.
- Enemies (letters or words) descend from the top of the screen.
- The player types on their keyboard to destroy them.
- When correctly typed, the spaceship automatically shoots missiles at the target.
- Add satisfying visual feedback (explosions, particles, screen shake).

----------------------------------
GAME MODES
----------------------------------

1. LETTER MODE (Beginner)
- Individual letters fall from the top.
- When the correct key is pressed:
  → the letter explodes
  → a missile shoots from the spaceship
- If missed, the letter reaches the bottom and damages the player.

2. WORD MODE (Advanced)
- Whole words descend instead of letters.
- The player must type the word in the correct sequence.
- Each correct letter:
  → highlights progress visually
  → fires a shot at the enemy
- If a wrong letter is typed:
  → reset progress for that word
  → show visual feedback (glitch or red flash)

----------------------------------
GAME MECHANICS
----------------------------------
- Increasing difficulty over time:
  → faster falling speed
  → longer words
  → more simultaneous enemies
- Score system:
  → points per correct input
  → combo multiplier for streaks
- Health system:
  → player loses health when enemies reach the bottom
- Game over + restart system

----------------------------------
VISUALS & UX
----------------------------------
- Clean arcade UI with a space theme
- Smooth animations using requestAnimationFrame
- Missile animations from ship to target
- Explosion effects when enemies are destroyed
- HUD showing:
  → score
  → combo
  → health
  → current mode

----------------------------------
TECH STRUCTURE
----------------------------------
- Use modular JS (separate concerns):
  → Game loop
  → Input handler
  → Enemy manager
  → Rendering system
- Avoid global clutter
- Use object-oriented or component-based structure

----------------------------------
OPTIONAL FEATURES (if time permits)
----------------------------------
- Sound effects (laser, explosion, typing feedback)
- Background parallax stars
- Power-ups:
  → slow motion
  → auto-fire
  → shield

----------------------------------
MULTIPLAYER (FUTURE PHASE - DESIGN ONLY)
----------------------------------
Design (do NOT fully implement yet):
- Real-time multiplayer typing battle
- Players compete to destroy shared enemies
- Leaderboard or versus mode
- Suggested tech:
  → WebSockets (e.g. Socket.io)
  → simple Node.js backend
- Sync:
  → enemy positions
  → player scores
  → typed inputs

----------------------------------
DELIVERABLE
----------------------------------
- Provide complete working code:
  → index.html
  → styles.css
  → script.js
- Keep it readable and well commented
- Focus on fun, responsiveness, and expandability