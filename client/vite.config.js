import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: '/',
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:5036',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    plugins: [react()],
})