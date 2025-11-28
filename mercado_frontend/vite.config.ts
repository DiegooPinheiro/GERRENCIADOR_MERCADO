import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy `/api` requests to the backend API base. VITE_API_URL is expected to include the `/api` prefix
      // Example: VITE_API_URL=http://backend:8000/api
      '/api': {
        // Default to localhost for developer machines (frontend running locally).
        // When running frontend inside Docker, docker-compose should set VITE_API_URL to the
        // internal backend host (eg. http://backend:8000/api).
        target: process.env.VITE_API_URL || 'http://localhost:8000/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
