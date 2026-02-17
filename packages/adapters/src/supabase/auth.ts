/**
 * Supabase Auth Module
 * Handles GitHub OAuth and magic link authentication
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer } from 'http';
import open from 'open';

interface AuthConfig {
  url: string;
  anonKey: string;
}

export class SupabaseAuth {
  private client: SupabaseClient;

  constructor(config: AuthConfig) {
    this.client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }

  /**
   * Login with GitHub OAuth (opens browser)
   */
  async loginWithGitHub(productionUrl = 'https://www.mycontxt.co'): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      githubUsername?: string;
    };
  }> {
    const callbackPort = 54321;
    // Production /auth/cli page reads the hash token and POSTs it back here
    const redirectTo = `${productionUrl}/auth/cli`;

    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        // CORS headers so the browser page can POST to us
        res.setHeader('Access-Control-Allow-Origin', productionUrl);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(204);
          res.end();
          return;
        }

        if (req.method === 'POST' && req.url === '/callback') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { access_token, refresh_token } = JSON.parse(body);

              if (!access_token) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: 'Missing access_token' }));
                server.close();
                reject(new Error('No access token received'));
                return;
              }

              // Get user info from the token
              const { data: { user }, error: userError } =
                await this.client.auth.getUser(access_token);

              if (userError || !user) {
                throw userError || new Error('Could not fetch user');
              }

              res.writeHead(200);
              res.end(JSON.stringify({ ok: true }));
              server.close();

              resolve({
                accessToken: access_token,
                user: {
                  id: user.id,
                  email: user.email!,
                  githubUsername: user.user_metadata?.user_name,
                },
              });
            } catch (err) {
              res.writeHead(500);
              res.end(JSON.stringify({ error: String(err) }));
              server.close();
              reject(err);
            }
          });
          return;
        }

        res.writeHead(404);
        res.end();
      });

      server.listen(callbackPort, async () => {
        console.log(`Waiting for authentication...`);

        const { data, error } = await this.client.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo },
        });

        if (error) {
          server.close();
          reject(error);
          return;
        }

        if (data.url) {
          console.log(`Opening browser for GitHub authentication...`);
          await open(data.url);
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        server.close();
        reject(new Error('Authentication timeout'));
      }, 5 * 60 * 1000);
    });
  }

  /**
   * Login with magic link (email)
   */
  async loginWithMagicLink(email: string): Promise<void> {
    const { error } = await this.client.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'http://localhost:54321/callback',
      },
    });

    if (error) {
      throw new Error(`Failed to send magic link: ${error.message}`);
    }

    console.log(`Magic link sent to ${email}. Check your inbox!`);
  }

  /**
   * Get current session
   */
  async getSession(): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
    };
  } | null> {
    const {
      data: { session },
    } = await this.client.auth.getSession();

    if (!session) {
      return null;
    }

    return {
      accessToken: session.access_token,
      user: {
        id: session.user.id,
        email: session.user.email!,
      },
    };
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw new Error(`Failed to logout: ${error.message}`);
    }
  }

  /**
   * Refresh session
   */
  async refreshSession(): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
    };
  }> {
    const {
      data: { session },
      error,
    } = await this.client.auth.refreshSession();

    if (error || !session) {
      throw new Error('Failed to refresh session. Please login again.');
    }

    return {
      accessToken: session.access_token,
      user: {
        id: session.user.id,
        email: session.user.email!,
      },
    };
  }
}
