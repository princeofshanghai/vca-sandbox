import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY']
  const missingEnvVars = requiredEnvVars.filter((key) => !env[key])

  if (command === 'build' && missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables for production build: ${missingEnvVars.join(', ')}`
    )
  }

  return {
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
            if (id.includes('@xyflow') || id.includes('reactflow') || id.includes('elkjs') || id.includes('d3-')) return 'flow';
            if (
              id.includes('@tiptap') ||
              id.includes('prosemirror') ||
              id.includes('orderedmap') ||
              id.includes('rope-sequence') ||
              id.includes('w3c-keyname')
            ) {
              return 'tiptap';
            }
            if (
              id.includes('@radix-ui') ||
              id.includes('@floating-ui') ||
              id.includes('aria-hidden') ||
              id.includes('react-remove-scroll')
            ) {
              return 'radix';
            }
            if (id.includes('@dnd-kit')) return 'dnd-kit';
            if (id.includes('@tsparticles') || id.includes('tsparticles')) return 'tsparticles';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'icons';
            if (
              id.includes('react-markdown') ||
              id.includes('remark') ||
              id.includes('rehype') ||
              id.includes('micromark') ||
              id.includes('mdast') ||
              id.includes('hast') ||
              id.includes('unist') ||
              id.includes('vfile') ||
              id.includes('property-information') ||
              id.includes('space-separated-tokens') ||
              id.includes('comma-separated-tokens') ||
              id.includes('decode-named-character-reference') ||
              id.includes('html-url-attributes') ||
              id.includes('trim-lines')
            ) {
              return 'markdown';
            }
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
  }
})
