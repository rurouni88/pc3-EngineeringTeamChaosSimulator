import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // relative asset paths so the build also works on GitHub Pages subpaths
  base: './',
  plugins: [react(), tailwindcss()],
});
