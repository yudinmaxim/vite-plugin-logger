import { defineConfig } from 'vite'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      treeshake: false,
      external: ['node:fs', 'node:path'],

      input: {
        main: path.resolve(__dirname, './src/index.ts'),
        logger: path.resolve(__dirname, './src/logger.ts')
      },
      output: [
        {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'main') {
              return 'index.js'
            }
            return `${chunkInfo.name}/index.js`
          },
          format: 'es',
        },
        {
          entryFileNames: (chunkInfo) => {
            if (chunkInfo.name === 'main') {
              return 'index.cjs'
            }
            return `${chunkInfo.name}/index.cjs`
          },
          format: 'cjs',
        }
      ],
    },
    minify: false,
    target: 'esnext',
    cssCodeSplit: true,
    sourcemap: true,
    chunkSizeWarningLimit: 1000
  },
})