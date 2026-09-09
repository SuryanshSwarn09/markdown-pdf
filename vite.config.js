import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/katex')) {
            return 'vendor-katex';
          }
          if (
            id.includes('node_modules/marked') ||
            id.includes('node_modules/marked-katex-extension') ||
            id.includes('node_modules/marked-highlight') ||
            id.includes('node_modules/dompurify')
          ) {
            return 'vendor-markdown';
          }
          if (id.includes('node_modules/highlight.js')) {
            return 'vendor-highlighter';
          }
        },
      },
    },
  },
})