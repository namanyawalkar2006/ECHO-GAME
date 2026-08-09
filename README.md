# ECHO — The World Remembers How You Play

A top-down 2D puzzle/adventure web game with an adaptive behavior engine.

## Controls
- **WASD / Arrow Keys**: Move the player.
- **R**: Restart current level.
- **ESC**: Pause the game.

## Adaptive System
ECHO tracks your playstyle across three main metrics behind the scenes:
- **SPEED**: Measured by how quickly you reach the exit of each level. Faster completion results in a higher speed score, which increases the speed of hazards in later levels.
- **RISK**: Determined by how many optional shards you collect out of the total available. Higher risk leads to changes in how hazards are spawned on shard-heavy routes.
- **PATH**: Your vertical position is tracked in each level to determine if you prefer "Top-Heavy" (Left) or "Bottom-Heavy" (Right) routes. Hazards will target your preferred route more aggressively.

At Level 4, the game reveals its collected analysis of your playstyle via the PLAYSTYLE panel.

## Tech Stack
- **Engine**: Phaser 3 (Canvas/WebGL)
- **Framework**: React / Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Installation
```bash
npm install
npm run dev
```

## Notice
Developed with the assistance of Google AI Studio.
