import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // `npm run dev:worker` serves the copilot Worker on :8787
    proxy: { '/api': 'http://127.0.0.1:8787' },
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/test-setup.js'],
    exclude: ['worker/**', 'node_modules/**'],
  },
})
