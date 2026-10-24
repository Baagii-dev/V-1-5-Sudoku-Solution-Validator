import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages дээр хадгалах газрын нэрээр (project page) ажиллана.
export default defineConfig({
  base: '/V-1-5-Sudoku-Solution-Validator/',
  plugins: [react()],
  worker: { format: 'es' },
});
