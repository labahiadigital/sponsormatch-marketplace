import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://sponsormatch.es',
  vite: {
    plugins: [tailwindcss()],
  },
});
