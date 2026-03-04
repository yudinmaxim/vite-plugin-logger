import { defineConfig } from 'vite'
import path from 'path'
// import dts from 'vite-plugin-dts' // надо для автотипов
import packageJson from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@logger': path.resolve(__dirname, './src/logger.ts')
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: [ 'es', 'cjs' ],
      fileName: 'index'
    },
    target: 'esnext',
    minify: false,
    rollupOptions: {
      external: ['node:fs', 'node:path'],
      output: {
        minifyInternalExports: false
      }
    }
  }
})
