import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import loggerPlugin from 'vite-plugin-logger'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5010
  },
  plugins: [

    loggerPlugin({
      packageName: 'demo-vue',
      color: '#42b883'
    }),
    vue()
  ],
  build: {
    minify: false,
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: true,
    // chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 1,
    modulePreload: {
      polyfill: false
    },
    rollupOptions: {
      external: ['vite-plugin-logger', 'vite-plugin-logger/logger']
    }
  }
})
