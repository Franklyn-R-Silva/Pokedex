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
          {
            // Imagens das cartas do TCG: imutáveis, cache longo.
            urlPattern: /^https:\/\/images\.pokemontcg\.io\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tcg-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // Dados das cartas (inclui preço): revalida em segundo plano.
            urlPattern: /^https:\/\/api\.pokemontcg\.io\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'tcg-api',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 3 },
            },
          },
          {
            // Fontes (Google Fonts): disponíveis offline.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    // Alvo amplo para funcionar em navegadores um pouco mais antigos.
    target: ['es2020', 'chrome87', 'edge88', 'firefox78', 'safari14'],
    cssTarget: ['chrome87', 'edge88', 'firefox78', 'safari14'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
