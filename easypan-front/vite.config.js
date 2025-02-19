import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import VitePluginWorker from 'vite-plugin-worker';
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 1024,
    hmr: true,
    proxy: {
      "/api": {
        target: "http://localhost:7090",
        changeOrigin: true,
        pathRewrite:{
          "^api": "/api"
        }
      }
    }
  }
})
