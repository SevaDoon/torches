import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' and a HashRouter, so a built copy runs from any static host or
// subfolder with no server rewrite rules. Same reasoning as the sibling app.
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { port: Number(process.env.PORT) || 5190 },
});
