import { defineConfig } from 'vite'
import path, { resolve } from 'path'
import dts from 'vite-plugin-dts'

const entries = {
  index: resolve(__dirname, './src/index.ts'),
  logger: resolve(__dirname, './src/logger.ts')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({
      outDir: './dist/types',
      include: [ './src/**/*' ],
      exclude: [ './src/**/*.stories.ts', './src/**/*.test.ts' ],
      rollupTypes: true
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      treeshake: false,
      external: ['node:fs', 'node:path'],
      input: entries,
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