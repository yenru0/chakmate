import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        onboarding: resolve(__dirname, 'src/pages/scene_onboarding.html'),
        dashboard: resolve(__dirname, 'src/pages/scene_dashboard.html'),
        swipe: resolve(__dirname, 'src/pages/scene_swipe.html'),
        settings: resolve(__dirname, 'src/pages/scene_settings.html'),
        'ai-classification': resolve(__dirname, 'src/pages/scene_ai_classification.html'),
        gamification: resolve(__dirname, 'src/pages/scene_gamification.html'),
        visualization: resolve(__dirname, 'src/pages/scene_visualization.html'),
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'logo.svg') return 'assets/[name][extname]';
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  },
  publicDir: 'public',
  server: {
    port: 5173,
    strictPort: true
  }
})