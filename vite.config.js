import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'alluring-solace-production-1d29.up.railway.app',
      '.up.railway.app',
    ]
  }
});
