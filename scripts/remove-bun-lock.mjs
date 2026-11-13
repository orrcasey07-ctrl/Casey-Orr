import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const LOCKFILE_NAMES = new Set(['bun.lock', 'bun.lockb']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.playwright-cli']);

function removeMatchingFiles(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        removeMatchingFiles(fullPath);
      }
      continue;
    }

    if (LOCKFILE_NAMES.has(entry.name) || entry.name.endsWith('.lockb')) {
      try {
        fs.rmSync(fullPath, { force: true });
        console.log(`🧹 Entfernt: ${path.relative(rootDir, fullPath)}`);
      } catch {
        // Ignore locked/transient errors
      }
    }
  }
}

removeMatchingFiles(rootDir);

if (process.argv.includes('--all')) {
  for (const target of ['dist', 'server.js']) {
    const fullPath = path.join(rootDir, target);
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } catch {
      // Ignore missing targets
    }
  }
}
