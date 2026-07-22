/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the built app loads from a file:// path inside the
  // packaged desktop app (offline), and still works served at a web root.
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
})
