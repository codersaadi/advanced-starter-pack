import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: false, // Can be true if you have multiple entry points or large utils
  sourcemap: true,
  clean: true,
  minify: !options.watch, // Minify only for production builds
  external: ['react', 'react-dom'], // Peer dependencies
  banner: {
    js: "'use client';", // Add 'use client' for ESM builds if components are exported
  },
  // onSuccess: options.watch ? 'pnpm typegen' : undefined, // Optionally run typegen after dev build
}));
