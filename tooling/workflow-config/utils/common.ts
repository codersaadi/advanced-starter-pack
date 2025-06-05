import { type PathLike, existsSync, mkdirSync } from 'node:fs';
// --- Helper to ensure directory exists ---
// This function can be called in the main script before writing files.
export function ensureDirectoryExists(pathLike: PathLike) {
  if (!existsSync(pathLike)) {
    mkdirSync(pathLike, { recursive: true });
  }
}
