# FreeChess ♟️

A responsive, installable chess experience with four dark Liquid Glass color themes.

## Features
- Bot strength presets from **100 to 3000 Elo** in 100-point increments.
- Four themes: **Red**, **Green**, **Blue**, and **Yellow**.
- Dedicated play page at `/play`, legal moves, move history, undo, board flip, and game-state detection.
- Chess runs locally in the browser; no account or game-data upload.
- PWA manifest, service worker, and Apple Home Screen metadata.

## Run locally
```bash
npm install
npm run dev
npm run build
```

## Strength note
The Elo selector is a target-strength preset, not a certified rating. Actual playing strength varies by device, search time, and position. This lightweight browser engine is intended for casual play and practice, not tournament-strength benchmarking.

## Install
On iPhone/iPad, open the site in Safari, tap Share, then **Add to Home Screen**. On desktop/Android, use the browser's install option when available.
