// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://houtougumi-memorial.anatofuz.net',
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-body',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'japanese'],
      fallbacks: ['Hiragino Sans', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Quicksand',
      cssVariable: '--font-en',
      weights: ['300 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  }
});
