import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    // When the FastAPI backend is ready, set VITE_MOCK_MODE=false and the
    // app will hit `/api` which is proxied to the backend below.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    // The core vendor bundle (React, Radix, Router, Query) is intentionally
    // one cacheable chunk; the two heaviest, self-contained libraries are
    // split out so they load lazily where used.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor'))
            return 'charts';
          if (id.includes('@xyflow') || id.includes('@reactflow')) return 'flow';
          return 'vendor';
        },
      },
    },
  },
});
