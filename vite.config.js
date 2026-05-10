import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map @harness/* workspace packages to their source files
      '@harness/core': resolve(__dirname, 'packages/core/src/index.js'),
      '@harness/plugin-javascript': resolve(__dirname, 'packages/plugin-javascript/src/index.jsx'),
      '@harness/plugin-python': resolve(__dirname, 'packages/plugin-python/src/index.jsx'),
      '@harness/plugin-typescript': resolve(__dirname, 'packages/plugin-typescript/src/index.jsx'),
      '@harness/provider-gemini': resolve(__dirname, 'packages/provider-gemini/src/index.js'),
      '@harness/provider-openrouter': resolve(__dirname, 'packages/provider-openrouter/src/index.js'),
      '@harness/provider-ollama': resolve(__dirname, 'packages/provider-ollama/src/index.js'),
      '@harness/provider-opencode': resolve(__dirname, 'packages/provider-opencode/src/index.js'),
      '@harness/feature-preview': resolve(__dirname, 'packages/feature-preview/src/index.jsx'),
      '@harness/feature-tasks': resolve(__dirname, 'packages/feature-tasks/src/index.jsx'),
      '@harness/feature-generate': resolve(__dirname, 'packages/feature-generate/src/index.jsx'),
    },
  },
  server: {
    proxy: {
      '/gemini-api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gemini-api/, '/v1beta/openai'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // Forward the Authorization header (Gemini API key)
            if (proxyReq.getHeader('authorization')) {
              const auth = proxyReq.getHeader('authorization')
              proxyReq.setHeader('authorization', auth)
            }
          })
        },
      },
    },
  },
  optimizeDeps: {
    // Include workspace packages for optimization
    include: ['@harness/core'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
