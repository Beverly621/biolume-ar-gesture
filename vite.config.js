import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  },
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: false,
    fs: {
      allow: [
        '/Users/beverlykim/3-program-v2/biolume-ar-gesture',
        '/Users/beverlykim/1-use/5-biolume/eco_druid_assets'
      ]
    }
  }
});
