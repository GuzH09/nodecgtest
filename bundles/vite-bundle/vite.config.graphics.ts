import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/graphics',
  build: {
    outDir: '../../graphics',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/graphics/index.html'),
      },
      output: {
        entryFileNames: 'index.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})