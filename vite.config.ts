import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { copyFileSync, writeFileSync, mkdirSync } from 'fs';

export default defineConfig({
  base: '/hex-map-tool/',
  build: {
    outDir: 'dist/hex-map-tool',
    emptyOutDir: true,
  },
  plugins: [
    react(),
    svgr(),
    {
      name: 'cloudflare-subpath',
      apply: 'build' as const,
      closeBundle() {
        mkdirSync('dist', { recursive: true });
        copyFileSync('dist/hex-map-tool/index.html', 'dist/app.html');
        writeFileSync('dist/_redirects', '/hex-map-tool/* /app.html 200\n');
      },
    },
  ],
  server: {
    port: 3000,
  },
});
