import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsxInject: "import React from 'react';",
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/test/**', 'src/**/__tests__/**', 'src/main.jsx'],
      thresholds: {
        statements: 45,
        branches: 60,
        functions: 50,
        lines: 45,
      },
    },
  },
})
