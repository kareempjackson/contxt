import { defineConfig } from 'tsup';
import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  entry: ['src/bin/contxt.ts'],
  format: ['esm'],
  dts: false,
  sourcemap: true,
  clean: true,
  splitting: false,
  shims: true,
  noExternal: ['@mycontxt/core', '@mycontxt/adapters'],
  external: ['better-sqlite3', 'tiktoken'],
  onSuccess: async () => {
    // schema.sql is loaded at runtime via __dirname — copy it next to the bundle
    copyFileSync(
      join(__dirname, '../adapters/src/sqlite/schema.sql'),
      join(__dirname, 'dist/schema.sql')
    );
  },
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
