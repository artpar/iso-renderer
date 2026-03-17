import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  if (mode === 'demo') {
    // Demo mode — serve the demo page
    return {
      root: 'demo',
      plugins: [react()],
    };
  }

  // Library build
  return {
    plugins: [
      react(),
      dts({ rollupTypes: true }),
    ],
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          'react/index': resolve(__dirname, 'src/react/index.ts'),
        },
        formats: ['es'],
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
      },
    },
  };
});
