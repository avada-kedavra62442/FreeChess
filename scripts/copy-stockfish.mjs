import { createRequire } from "node:module";
import { access, copyFile, mkdir } from "node:fs/promises";
import { dirname, basename, join } from "node:path";

const require = createRequire(import.meta.url);
const stockfish = require("stockfish");
const enginePath = stockfish.findEngine("lite-single");
const engineDir = join(process.cwd(), "public", "engine");
await mkdir(engineDir, { recursive: true });
const wasmPath = enginePath.replace(/\.js$/i, ".wasm");
await copyFile(enginePath, join(engineDir, basename(enginePath)));
await copyFile(wasmPath, join(engineDir, basename(wasmPath)));
const licensePath = join(dirname(dirname(enginePath)), "Copying.txt");
try {
  await access(licensePath);
  await copyFile(licensePath, join(engineDir, "LICENSE.txt"));
} catch {
  console.warn("Stockfish license file not found at", licensePath);
}
console.log("Copied Stockfish Lite engine into public/engine.");
