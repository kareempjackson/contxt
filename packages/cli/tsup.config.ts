import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/bin/contxt.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: true,
  esbuildOptions(options) {
    // Bake Supabase credentials into the binary at build time.
    // Set CONTXT_SUPABASE_URL and CONTXT_SUPABASE_ANON_KEY before building
    // (or in CI/CD) so end users don't need to configure anything.
    options.define = {
      ...options.define,
      'process.env.CONTXT_SUPABASE_URL': JSON.stringify(
        process.env.CONTXT_SUPABASE_URL ?? ''
      ),
      'process.env.CONTXT_SUPABASE_ANON_KEY': JSON.stringify(
        process.env.CONTXT_SUPABASE_ANON_KEY ?? ''
      ),
    };
  },
});
