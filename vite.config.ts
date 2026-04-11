// vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
    },
    define: {
      'import.meta.env.VITE_AUTH_CLIENT_ID': JSON.stringify(env.VITE_AUTH_CLIENT_ID),
      'import.meta.env.VITE_AUTH_TENANT_ID': JSON.stringify(env.VITE_AUTH_TENANT_ID),
      'import.meta.env.VITE_AUTH_REDIRECT_URI': JSON.stringify(env.VITE_AUTH_REDIRECT_URI),
      'import.meta.env.VITE_AUTHORITY_URI': JSON.stringify(env.VITE_AUTHORITY_URI),
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
    }
  }
})
