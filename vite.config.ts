import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
        tailwindcss(),
  ],
  server: {
    proxy: {
      // أي طلب يبدأ بـ /api سيتم تحويله سراً إلى خادم Somee
      '/api': {
        target: 'http://www.marketexpress.somee.com',
        changeOrigin: true,
        secure: false, // مهم جداً لأن الخادم الوجهة يعمل بـ http
      }
    }
  }
})
