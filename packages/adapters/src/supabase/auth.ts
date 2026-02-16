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
  async loginWithGitHub(): Promise<{
    accessToken: string;
    user: {
      id: string;
      email: string;
      githubUsername?: string;
    };
  }> {
    const callbackPort = 54321;
    const callbackUrl = `http://localhost:${callbackPort}/callback`;

    return new Promise((resolve, reject) => {
      const server = createServer(async (req, res) => {
        if (req.url?.startsWith('/callback')) {
          const url = new URL(req.url, `http://localhost:${callbackPort}`);
          const code = url.searchParams.get('code');
          const error = url.searchParams.get('error');

          if (error) {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
            server.close();
            reject(new Error(error));
            return;
          }

          if (code) {
            try {
              // Exchange code for session
              const { data, error: sessionError } =
                await this.client.auth.exchangeCodeForSession(code);

              if (sessionError || !data.session) {
                throw sessionError || new Error('No session returned');
              }

              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>✅ Authentication Successful!</h1>
                    <p>You can close this window and return to your terminal.</p>
                  </body>
                </html>
              `);

              server.close();

              resolve({
                accessToken: data.session.access_token,
                user: {
                  id: data.session.user.id,
                  email: data.session.user.email!,
                  githubUsername:
                    data.session.user.user_metadata?.user_name,
                },
              });
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(`
                <html>
                  <body style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h1>❌ Authentication Failed</h1>
                    <p>${err instanceof Error ? err.message : 'Unknown error'}</p>
                  </body>
                </html>
              `);
              server.close();
              reject(err);
            }
          }
        }
      });

      server.listen(callbackPort, async () => {
        console.log(`Waiting for authentication...`);

        // Initiate OAuth flow
        const { data, error } = await this.client.auth.signInWithOAuth({
          provider: 'github',
          options: {
            redirectTo: callbackUrl,
          },
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
