/**
 * Auth Commands - Handle authentication with Supabase
 */

import { SupabaseAuth } from '@contxt/adapters/supabase-auth';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import { getSupabaseConfig } from '../config.js';

const CONFIG_DIR = join(homedir(), '.contxt');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');

interface AuthData {
  accessToken: string;
  userId: string;
  email: string;
  githubUsername?: string;
  expiresAt?: string;
}

/**
 * Save auth data to disk
 */
function saveAuthData(data: AuthData): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Load auth data from disk
 */
function loadAuthData(): AuthData | null {
  if (!existsSync(AUTH_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Login command
 */
export const authCommand = {
  async login(options: { email?: string }) {
    try {
      const config = getSupabaseConfig();
      const auth = new SupabaseAuth(config);

      console.log('🔐 Contxt Authentication\n');

      if (options.email) {
        // Magic link flow
        await auth.loginWithMagicLink(options.email);
        console.log('\n✅ Magic link sent! Check your email and click the link.');
        console.log('   Then run `contxt auth status` to verify.');
      } else {
        // GitHub OAuth flow
        console.log('Opening browser for GitHub authentication...\n');

        const result = await auth.loginWithGitHub();

        saveAuthData({
          accessToken: result.accessToken,
          userId: result.user.id,
          email: result.user.email,
          githubUsername: result.user.githubUsername,
        });

        console.log('\n✅ Successfully authenticated!');
        console.log(`   Email: ${result.user.email}`);
        if (result.user.githubUsername) {
          console.log(`   GitHub: @${result.user.githubUsername}`);
        }
        console.log('\nYou can now use `contxt push` and `contxt pull` to sync your memory.');
      }
    } catch (error) {
      console.error(
        '❌ Authentication failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  async logout() {
    try {
      const config = getSupabaseConfig();
      const auth = new SupabaseAuth(config);

      await auth.logout();

      // Remove local auth file
      if (existsSync(AUTH_FILE)) {
        const fs = await import('fs/promises');
        await fs.unlink(AUTH_FILE);
      }

      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error(
        '❌ Logout failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },

  async status() {
    try {
      const authData = loadAuthData();

      if (!authData) {
        console.log('❌ Not authenticated');
        console.log('\nRun `contxt auth login` to authenticate.');
        process.exit(1);
      }

      console.log('✅ Authenticated');
      console.log(`   Email: ${authData.email}`);
      if (authData.githubUsername) {
        console.log(`   GitHub: @${authData.githubUsername}`);
      }
      console.log(`   User ID: ${authData.userId}`);

      // Try to refresh session to check if still valid
      const config = getSupabaseConfig();
      const auth = new SupabaseAuth(config);

      try {
        await auth.refreshSession();
        console.log('\n✅ Session is valid');
      } catch {
        console.log('\n⚠️  Session expired. Run `contxt auth login` to re-authenticate.');
      }
    } catch (error) {
      console.error(
        '❌ Status check failed:',
        error instanceof Error ? error.message : error
      );
      process.exit(1);
    }
  },
};

/**
 * Get access token for API calls
 */
export function getAccessToken(): string | null {
  const authData = loadAuthData();
  return authData?.accessToken || null;
}
