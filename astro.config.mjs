// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import react from '@astrojs/react';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://houtougumi-memorial.anatofuz.net',
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.houtougumi-memorial.anatofuz.net',
        pathname: '/fanart/images/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.houtougumi-memorial.anatofuz.net',
        pathname: '/comments/avatars/**',
      },
    ],
  },
  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Noto Sans JP',
      cssVariable: '--font-body',
      display: 'block',
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'japanese'],
      fallbacks: ['Hiragino Sans', 'sans-serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Quicksand',
      cssVariable: '--font-en',
      display: 'block',
      weights: ['300 700'],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['sans-serif'],
    },
  ],
  integrations: [react()],
  prefetch: true,

  vite: {
    plugins: [tailwindcss()]
  }
});
