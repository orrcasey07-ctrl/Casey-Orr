import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function removeBunLockFiles(rootDir: string) {
  for (const file of ['bun.lock', 'bun.lockb']) {
    const target = path.join(rootDir, file);
    try {
      if (fs.existsSync(target)) {
        fs.rmSync(target, { force: true });
      }
    } catch {
      // Ignore transient errors
    }
  }
}

function autoRemoveBunLockPlugin(): Plugin {
  let rootDir = __dirname;

  return {
    name: 'notenpilot-remove-bun-lock',
    configResolved(config) {
      rootDir = config.root || __dirname;
      removeBunLockFiles(rootDir);
    },
    buildStart() {
      removeBunLockFiles(rootDir);
    },
    handleHotUpdate() {
      removeBunLockFiles(rootDir);
    },
    closeBundle() {
      removeBunLockFiles(rootDir);
    },
    configureServer(server) {
      removeBunLockFiles(rootDir);
      let watcher: fs.FSWatcher | null = null;
      try {
        watcher = fs.watch(rootDir, (_eventType, filename) => {
          if (
            typeof filename === 'string' &&
            (filename === 'bun.lock' || filename === 'bun.lockb' || filename.endsWith('.lockb'))
          ) {
            removeBunLockFiles(rootDir);
          }
        });
        server.httpServer?.once('close', () => {
          watcher?.close();
          watcher = null;
        });
      } catch {
        // Ignore if fs.watch is unavailable
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), autoRemoveBunLockPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          impressum: path.resolve(__dirname, 'impressum.html'),
          datenschutz: path.resolve(__dirname, 'datenschutz.html'),
          kontakt: path.resolve(__dirname, 'kontakt.html'),
          notFound: path.resolve(__dirname, '404.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
