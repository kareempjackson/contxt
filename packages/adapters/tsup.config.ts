import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  entry: ['src/index.ts', 'src/sqlite/index.ts', 'src/supabase/index.ts'],
  format: ['esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  onSuccess: async () => {
    // Copy schema.sql to dist
    const distDir = join(__dirname, 'dist', 'sqlite');
    mkdirSync(distDir, { recursive: true });
    copyFileSync(
      join(__dirname, 'src', 'sqlite', 'schema.sql'),
      join(distDir, 'schema.sql')
    );
    console.log('✓ Copied schema.sql to dist');
  },
});
