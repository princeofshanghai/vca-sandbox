import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('react-router')) return 'react-router';
          if (id.includes('@xyflow') || id.includes('reactflow') || id.includes('elkjs')) return 'flow';
          if (id.includes('@tiptap')) return 'tiptap';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('@dnd-kit')) return 'dnd-kit';
          if (id.includes('@tsparticles') || id.includes('tsparticles')) return 'tsparticles';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('react-markdown') || id.includes('remark')) return 'markdown';
          if (
            id.includes('tailwind') ||
            id.includes('clsx') ||
            id.includes('class-variance-authority') ||
            id.includes('sonner') ||
            id.includes('nanoid')
          ) {
            return 'ui-utils';
          }
          // Keep React in vendor to avoid circular chunk init with vendor/react splits.
          if (id.includes('react')) return 'vendor';

          return 'vendor';
        },
      },
    },
  },
})
