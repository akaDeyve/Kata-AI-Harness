import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
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
})
