import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000',
      '/call-handler': 'http://localhost:5000',
      '/inbound-fallback': 'http://localhost:5000',
      '/voicemail-recording': 'http://localhost:5000',
      '/call-recording-callback': 'http://localhost:5000',
    },
  },
  build: {
    outDir: '../client/dist',
  },
});
