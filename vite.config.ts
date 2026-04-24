import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
  base: '/hex-map-tool/',
  plugins: [react(), svgr()],
  server: {
    port: 3000,
  },
});
