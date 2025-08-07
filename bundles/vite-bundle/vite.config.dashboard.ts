import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  root: 'src/dashboard',
  build: {
    outDir: '../../dashboard',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        panel: resolve(__dirname, 'src/dashboard/panel.html'),
      },
      output: {
        entryFileNames: 'panel.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
})
