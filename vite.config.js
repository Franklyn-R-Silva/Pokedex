import { defineConfig } from 'vite';

// base: './' garante que os assets funcionem em qualquer subpasta (ex.: Netlify).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
  },
});
