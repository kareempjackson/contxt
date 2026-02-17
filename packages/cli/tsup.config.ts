import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/bin/contxt.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: true,
});
