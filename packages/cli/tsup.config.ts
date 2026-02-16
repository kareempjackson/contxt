import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/bin/memocore.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: true,
});
