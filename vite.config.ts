
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.gltf', '**/*.bin'],
  server: {
    port: 3000,       
    host: '0.0.0.0',  
    strictPort: true,
    // Para testeo de vistas en otros dispositivos con: npx localtunnel --port 5173  
    allowedHosts: ['spotty-numbers-judge.loca.lt'] 
  },
});