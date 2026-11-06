import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

// Cấu hình Vite Độc Lập cho Web Portal Giảng Viên & Quản Trị Viên (Chạy trên Port 5174)
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    {
      name: 'faculty-portal-spa-fallback',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (
            req.url &&
            !req.url.startsWith('/api') &&
            !req.url.startsWith('/socket.io') &&
            !req.url.startsWith('/src') &&
            !req.url.startsWith('/node_modules') &&
            !req.url.startsWith('/@') &&
            !req.url.includes('.')
          ) {
            req.url = '/portal.html';
          }
          next();
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:4000',
        ws: true,
        changeOrigin: true,
      },
    },
  }
});
