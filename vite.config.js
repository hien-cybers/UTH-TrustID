import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    {
      name: 'http-to-https-redirect',
      configureServer(server) {
        if (!server.httpServer) return;
        const [tlsListener] = server.httpServer.listeners('connection');
        if (!tlsListener) return;
        server.httpServer.removeListener('connection', tlsListener);
        server.httpServer.on('connection', (socket) => {
          const onReadable = () => {
            const chunk = socket.read(1);
            if (chunk === null) return;
            socket.removeListener('readable', onReadable);
            socket.unshift(chunk);
            if (chunk[0] === 0x16) {
              tlsListener.call(server.httpServer, socket);
            } else {
              socket.once('data', (raw) => {
                const reqStr = raw.toString('utf8');
                const firstLine = reqStr.split('\r\n')[0] || '';
                const reqPath = firstLine.split(' ')[1] || '/';
                const hostMatch = reqStr.match(/Host:\s*([^\r\n]+)/i);
                const host = hostMatch ? hostMatch[1].trim() : 'localhost:5173';
                const location = `https://${host}${reqPath}`;
                socket.end(
                  `HTTP/1.1 302 Found\r\nLocation: ${location}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n`
                );
              });
            }
          };
          socket.on('readable', onReadable);
        });
      }
    }
  ],
  server: {
    host: true,
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
