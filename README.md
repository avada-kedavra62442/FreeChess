# FreeChess ♟️

A responsive, installable chess experience with a Stockfish-powered chess engine and four richly styled dark Liquid Glass color themes.

## Features
- Stockfish 19 Lite powers the opponent in a dedicated Web Worker, with adjustable strength presets from **100 to 3000 Elo** in 100-point increments.
- Four color-only themes: **Red**, **Green**, **Blue**, and **Yellow**, each with a distinct accent palette and matching board colors.
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
The Elo selector is an approximate strength target, not a certified rating. Stockfish skill settings are used for beginner levels and its Elo-limiting option for stronger levels; actual playing strength varies with device performance and thinking time. The browser loads the single-threaded Lite engine (about 1.7 MB plus its WASM file) in a Web Worker so the board remains responsive. Stockfish is GPL-3.0; its license is copied into the deployed engine folder.

## Install
On iPhone/iPad, open the site in Safari, tap Share, then **Add to Home Screen**. On desktop/Android, use the browser's install option when available.
