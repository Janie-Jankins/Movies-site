import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { handleMediaRequest } from './server/media.js'

function mediaApi() {
  return {
    name: 'media-api',
    configureServer(server) {
      server.middlewares.use('/api/media', handleMediaRequest)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/media', handleMediaRequest)
    },
  }
}

function tmdbProxy(apiKey) {
  return {
    target: 'https://api.themoviedb.org/3',
    changeOrigin: true,
    rewrite: (path) => {
      const stripped = path.replace(/^\/tmdb/, '') || '/'
      const join = stripped.includes('?') ? '&' : '?'
      return `${stripped}${join}api_key=${encodeURIComponent(apiKey)}`
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiKey = env.TMDB_API_KEY || env.VITE_TMDB_API_KEY || ''
  const proxy = { '/tmdb': tmdbProxy(apiKey) }

  return {
    plugins: [react(), tailwindcss(), mediaApi()],
    server: { proxy },
    preview: { proxy },
  }
})
