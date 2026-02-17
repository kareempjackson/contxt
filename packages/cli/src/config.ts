/**
 * Contxt CLI Configuration
 *
 * Supabase credentials are injected at build time via tsup esbuildOptions.define,
 * so end users never need to set environment variables.
 *
 * For local development / CI builds, set:
 *   CONTXT_SUPABASE_URL=https://your-project.supabase.co
 *   CONTXT_SUPABASE_ANON_KEY=your-anon-key
 */

// These string literals are replaced at build time by tsup's esbuildOptions.define.
// At runtime they fall back to process.env for local development.
export const SUPABASE_URL: string = process.env.CONTXT_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY: string = process.env.CONTXT_SUPABASE_ANON_KEY ?? '';

export function getSupabaseConfig(): { url: string; anonKey: string } {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      'Contxt is not configured for cloud sync.\n' +
      'If you installed via npm, please reinstall the latest version.\n' +
      'If building locally, set CONTXT_SUPABASE_URL and CONTXT_SUPABASE_ANON_KEY before running `pnpm build`.'
    );
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
}
