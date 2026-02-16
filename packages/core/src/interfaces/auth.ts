/**
 * Authentication provider interface
 */

import type { AuthSession, UserProfile } from '../types.js';

export interface IAuthProvider {
  /**
   * Initialize authentication provider
   */
  initialize(): Promise<void>;

  /**
   * Login with browser OAuth flow
   */
  login(): Promise<AuthSession>;

  /**
   * Logout and clear session
   */
  logout(): Promise<void>;

  /**
   * Get current session
   */
  getSession(): Promise<AuthSession | null>;

  /**
   * Refresh access token
   */
  refreshSession(refreshToken: string): Promise<AuthSession>;

  /**
   * Get user profile
   */
  getUserProfile(userId: string): Promise<UserProfile | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;
}
