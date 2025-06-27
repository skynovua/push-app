import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [
      tailwindcss(),
      react(),
      ...(command === 'build'
        ? [
            VitePWA({
              registerType: 'autoUpdate',
              includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icon-*.png'],
              // Use our custom manifest.json instead of generating one
              manifest: false,
              workbox: {
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                navigateFallback: null,
              },
            }),
          ]
        : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  };
});
