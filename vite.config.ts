import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' so the built site works from any subfolder (GitHub Pages, Netlify drop, etc.)
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: Number(process.env.PORT) || 5180 },
});
