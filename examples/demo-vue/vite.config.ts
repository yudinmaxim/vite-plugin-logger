import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import loggerPlugin from '../../src/index.ts'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      'vite-plugin-logger/logger': path.resolve(__dirname, '../../src/logger.ts')
    }
  },
  plugins: [
    vue(),
    loggerPlugin({
      packageName: 'demo-vue',
      color: '#42b883',
      isLocal: true
    })
  ]
})
