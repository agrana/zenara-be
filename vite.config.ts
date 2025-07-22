import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { analyzer } from "vite-bundle-analyzer";
import viteCompression from "vite-plugin-compression";

export default defineConfig(async ({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      runtimeErrorOverlay(),
      // Compression plugins for production
      ...(mode === 'production' ? [
        viteCompression({ algorithm: 'gzip' }),
        viteCompression({ algorithm: 'brotliCompress', ext: '.br' }),
      ] : []),
      // Bundle analyzer (only when ANALYZE=true)
      ...(process.env.ANALYZE ? [
        analyzer({ analyzerMode: 'static', openAnalyzer: true })
      ] : []),
      ...(process.env.NODE_ENV !== "production" &&
      process.env.REPL_ID !== undefined
        ? [
            await import("@replit/vite-plugin-cartographer").then((m) =>
              m.cartographer(),
            ),
          ]
        : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
      // Performance optimizations
      minify: 'esbuild', // Faster than terser
      target: 'es2020', // Better tree-shaking
      sourcemap: false, // Disable sourcemaps for production
      cssMinify: true,
      // Bundle splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk for React and core libraries
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI libraries chunk
            'vendor-ui': [
              '@radix-ui/react-slot', 
              '@radix-ui/react-dialog',
              '@radix-ui/react-collapsible',
              '@radix-ui/react-progress',
              '@radix-ui/react-select',
              '@radix-ui/react-tooltip',
              '@radix-ui/react-toast'
            ],
            // State management and data fetching
            'vendor-state': ['@tanstack/react-query', 'zustand'],
            // Utility libraries
            'vendor-utils': ['clsx', 'tailwind-merge', 'date-fns', 'zod'],
            // Authentication and Supabase
            'vendor-auth': ['@supabase/supabase-js', '@supabase/auth-helpers-react'],
            // Icons - separate chunk to optimize loading
            'vendor-icons': ['lucide-react'],
          },
          // Optimize chunk size thresholds
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
            return `assets/[name]-[hash].js`;
          },
        },
      },
      // Chunk size warning limit
      chunkSizeWarningLimit: 600,
    },
    define: {
      'import.meta.env': {
        SUPABASE_URL: JSON.stringify(env.SUPABASE_URL),
        SUPABASE_ANON_KEY: JSON.stringify(env.SUPABASE_ANON_KEY)
      }
    },
    server: {
      host: true,
      allowedHosts: [
        'localhost',
        'devserver-main--profound-parfait-9b4ca5.netlify.app',
        '.netlify.app',
        'zenara.be'
      ]
    },
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'clsx',
        'tailwind-merge'
      ],
      exclude: [
        // Exclude large dependencies from pre-bundling to enable tree-shaking
        'lucide-react',
      ],
    }
  };
});
