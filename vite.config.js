import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// base: './' garante que os assets funcionem em qualquer subpasta (ex.: Cloudflare Pages).
export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicons/favicon-16x16.png', 'icons/icon-192.png'],
      manifest: {
        name: 'Pokédex',
        short_name: 'Pokédex',
        description: 'Pokédex web que consome a PokéAPI: busca, tipos, stats, evolução e mais.',
        theme_color: '#ef5350',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/pokeapi\.co\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'pokeapi',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 7 },
            },
          },
          {
            urlPattern: /^https:\/\/raw\.githubusercontent\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'sprites',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
