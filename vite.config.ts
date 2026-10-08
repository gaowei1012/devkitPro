/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import sitemap from 'vite-plugin-sitemap';
import { robots } from 'vite-plugin-robots';
import { sitemapRoutes, SITE_URL } from './src/config/seoMeta';

const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  base: '/devkitPro/',
  plugins: [
    react({
      babel: {
        env: {
          production: {
            plugins: [
              ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
              'babel-plugin-transform-remove-debugger',
            ],
          },
        },
      },
    }),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
    }),
    sitemap({
      hostname: SITE_URL,
      dynamicRoutes: sitemapRoutes.filter((route) => route !== '/'),
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
      generateRobotsTxt: false,
    }),
    robots({ enableDebug: false }),
    ...(isAnalyze
      ? [
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      crypto: path.resolve(__dirname, './src/shims/node-crypto.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('xlsx')) return 'vendor-xlsx';
          if (id.includes('html2pdf')) return 'vendor-html2pdf';
          if (id.includes('prettier')) return 'vendor-prettier';

          return 'vendor';
        },
        chunkFileNames: 'assets/[name].[hash].js',
        entryFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**'],
    },
  },
});
