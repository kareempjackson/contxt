/**
 * Billing Commands - Manage subscription and usage
 */

import chalk from 'chalk';
import { existsSync, readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import open from 'open';
import { PLANS, getPlan, type PlanId } from '@mycontxt/core/plans';
import { SQLiteDatabase } from '@mycontxt/adapters/sqlite';
import { SupabaseDatabase } from '@mycontxt/adapters/supabase';
import { StripeBilling } from '@mycontxt/adapters/stripe/billing';
import { getDbPath } from '../utils/project.js';
import { getSupabaseConfig } from '../config.js';
import { error as outputError, header } from '../utils/output.js';

const AUTH_FILE = join(homedir(), '.contxt', 'auth.json');

interface AuthData {
  accessToken: string;
  userId: string;
  email: string;
}

/**
 * Get auth data or exit
 */
function getAuthData(): AuthData {
  if (!existsSync(AUTH_FILE)) {
    outputError('Not authenticated. Run `contxt auth login` first.');
    process.exit(1);
  }

  try {
    const content = readFileSync(AUTH_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    outputError('Failed to read auth data. Run `contxt auth login`.');
    process.exit(1);
  }
}

/**
 * Get usage counts from local database
 */
async function getUsageCounts(db: any): Promise<{
  projects: number;
  entries: number;
}> {
  const projectRow = db.db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
  const entryRow = db.db.prepare('SELECT COUNT(*) as count FROM memory_entries WHERE is_archived = 0').get() as any;

  return {
    projects: projectRow.count,
    entries: entryRow.count,
  };
}

/**
 * Format usage percentage
 */
function formatPercentage(used: number, limit: number | null): string {
  if (limit === null) return '-';
  const pct = (used / limit) * 100;
  return `${pct.toFixed(1)}%`;
}

/**
 * Get subscription status from Supabase
 */
async function getSubscriptionStatus(userId: string, accessToken: string): Promise<{
  planId: PlanId;
  status?: string;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
} | null> {
  try {
    const config = getSupabaseConfig();
    const supabase = new SupabaseDatabase({
      url: config.url,
      anonKey: config.anonKey,
      accessToken,
    });
    await supabase.initialize();

    // Query subscriptions table first (source of truth for paid plans)
    const { data: sub } = await supabase.client
      .from('subscriptions')
      .select('plan_id, status, current_period_end, cancel_at_period_end')
      .eq('user_id', userId)
      .single();

    let planId: PlanId = 'free';
    if (sub?.status === 'active' && sub?.plan_id && sub.plan_id !== 'free') {
      planId = sub.plan_id as PlanId;
    } else {
      const profile = await supabase.getUserProfile(userId);
      planId = (profile?.plan_id as PlanId) || 'free';
    }

    return {
      planId,
      status: sub?.status ?? undefined,
      currentPeriodEnd: sub?.current_period_end ? new Date(sub.current_period_end) : undefined,
      cancelAtPeriodEnd: sub?.cancel_at_period_end ?? undefined,
    };
  } catch {
    return { planId: 'free' };
  }
}

export const billingCommand = {
  /**
   * Show current plan and usage status
   */
  async status() {
    try {
      const auth = getAuthData();
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      const subscription = await getSubscriptionStatus(auth.userId, auth.accessToken);
      if (!subscription) {
        outputError('Failed to fetch subscription status.');
        process.exit(1);
      }

      const plan = getPlan(subscription.planId);
      const usage = await getUsageCounts(db);

      console.log(chalk.bold('\n╭─────────────────────────────────────────╮'));
      console.log(chalk.bold(`│  Plan: ${plan.name}${plan.pricing.monthly ? ` ($${plan.pricing.monthly}/mo)` : ''}`.padEnd(42) + '│'));

      if (subscription.status) {
        const statusText = subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1);
        console.log(chalk.bold(`│  Status: ${statusText}`.padEnd(42) + '│'));
      }

      if (subscription.currentPeriodEnd) {
        const renewText = subscription.cancelAtPeriodEnd ? 'Ends' : 'Renews';
        console.log(chalk.bold(`│  ${renewText}: ${subscription.currentPeriodEnd.toLocaleDateString()}`.padEnd(42) + '│'));
      }

      console.log(chalk.bold('│                                         │'));
      console.log(chalk.bold('│  Usage                                  │'));

      const projectLimit = plan.limits.maxProjects === null ? '∞' : plan.limits.maxProjects.toString();
      const projectPct = formatPercentage(usage.projects, plan.limits.maxProjects);
      console.log(chalk.bold(`│  Projects:  ${usage.projects} / ${projectLimit}`.padEnd(32) + `(${projectPct})`.padStart(10) + '│'));

      const entryLimit = plan.limits.maxTotalEntries === null ? '∞' : plan.limits.maxTotalEntries.toLocaleString();
      const entryPct = formatPercentage(usage.entries, plan.limits.maxTotalEntries);
      console.log(chalk.bold(`│  Entries:   ${usage.entries} / ${entryLimit}`.padEnd(32) + `(${entryPct})`.padStart(10) + '│'));

      console.log(chalk.bold('│                                         │'));
      console.log(chalk.bold('│  Features                               │'));
      console.log(chalk.bold(`│  ${plan.limits.semanticSearchEnabled ? '✓' : '✗'} Semantic search`.padEnd(42) + '│'));
      console.log(chalk.bold(`│  ${plan.limits.smartSuggestEnabled ? '✓' : '✗'} Smart suggest`.padEnd(42) + '│'));
      console.log(chalk.bold(`│  ${plan.limits.branchingEnabled ? '✓' : '✗'} Branching & time travel`.padEnd(42) + '│'));
      console.log(chalk.bold(`│  ${plan.limits.teamSharingEnabled ? '✓' : '✗'} Team sharing`.padEnd(42) + '│'));
      console.log(chalk.bold(`│  ${plan.limits.apiAccessEnabled ? '✓' : '✗'} API access`.padEnd(42) + '│'));
      console.log(chalk.bold('╰─────────────────────────────────────────╯\n'));

      if (subscription.planId === 'free') {
        console.log(chalk.cyan('  Upgrade to Pro → contxt billing upgrade\n'));
      } else {
        console.log(chalk.dim('  Manage subscription → contxt billing manage\n'));
      }

      await db.close();
    } catch (err) {
      outputError(`Status check failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Upgrade plan via Stripe Checkout
   */
  async upgrade() {
    try {
      const auth = getAuthData();

      if (!process.env.STRIPE_SECRET_KEY) {
        outputError('Stripe not configured. Contact support.');
        process.exit(1);
      }

      header('Upgrade to Contxt Pro');
      console.log('');

      // Show plan comparison
      const proPlan = PLANS.pro;
      console.log(chalk.bold('Pro Plan - $29/month'));
      console.log('  ✓ Unlimited projects');
      console.log('  ✓ 50,000 total entries');
      console.log('  ✓ Semantic search (AI-powered)');
      console.log('  ✓ Smart context suggestions');
      console.log('  ✓ Branching & time travel');
      console.log('  ✓ Priority support');
      console.log('');

      // Create Stripe billing instance
      const billing = new StripeBilling(process.env.STRIPE_SECRET_KEY);

      // Get or create customer
      const customerId = await billing.getOrCreateCustomer(auth.userId, auth.email);

      // Create checkout session
      const checkoutUrl = await billing.createCheckoutUrl({
        customerId,
        priceId: proPlan.stripePriceIds.monthly!,
        successUrl: 'https://mycontxt.ai/billing/success',
        cancelUrl: 'https://mycontxt.ai/billing/cancel',
      });

      console.log(chalk.cyan('Opening Stripe Checkout in your browser...\n'));
      await open(checkoutUrl);

      console.log('Complete checkout in your browser.');
      console.log('Your plan will update automatically.\n');
      console.log(chalk.dim('Check status: contxt billing status\n'));
    } catch (err) {
      outputError(`Upgrade failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Open Stripe Customer Portal
   */
  async manage() {
    try {
      const auth = getAuthData();

      if (!process.env.STRIPE_SECRET_KEY) {
        outputError('Stripe not configured. Contact support.');
        process.exit(1);
      }

      const billing = new StripeBilling(process.env.STRIPE_SECRET_KEY);

      // Get customer ID from Supabase
      const config = getSupabaseConfig();
      const supabase = new SupabaseDatabase({
        url: config.url,
        anonKey: config.anonKey,
        accessToken: auth.accessToken,
      });
      await supabase.initialize();

      // Look up existing stripe_customer_id from subscriptions table
      const config2 = getSupabaseConfig();
      const supabase2 = new SupabaseDatabase({
        url: config2.url,
        anonKey: config2.anonKey,
        accessToken: auth.accessToken,
      });
      await supabase2.initialize();
      const { data: subRow } = await supabase2.client
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', auth.userId)
        .single();

      const customerId = subRow?.stripe_customer_id
        ? subRow.stripe_customer_id
        : await billing.getOrCreateCustomer(auth.userId, auth.email);

      // Create portal session
      const portalUrl = await billing.createPortalUrl(
        customerId,
        'https://mycontxt.ai/billing/return'
      );

      console.log(chalk.cyan('\nOpening Stripe Customer Portal in your browser...\n'));
      await open(portalUrl);

      console.log('Manage your subscription in the browser.');
      console.log('  • Update payment method');
      console.log('  • View invoices');
      console.log('  • Cancel subscription\n');
    } catch (err) {
      outputError(`Portal access failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },

  /**
   * Show detailed usage breakdown
   */
  async usage() {
    try {
      const auth = getAuthData();
      const dbPath = getDbPath();
      const db = new SQLiteDatabase(dbPath);
      await db.initialize();

      const subscription = await getSubscriptionStatus(auth.userId, auth.accessToken);
      if (!subscription) {
        outputError('Failed to fetch subscription status.');
        process.exit(1);
      }

      const plan = getPlan(subscription.planId);
      const usage = await getUsageCounts(db);

      // Get detailed breakdown by type
      const decisionRow = db.db.prepare("SELECT COUNT(*) as count FROM memory_entries WHERE type = 'decision' AND is_archived = 0").get() as any;
      const patternRow = db.db.prepare("SELECT COUNT(*) as count FROM memory_entries WHERE type = 'pattern' AND is_archived = 0").get() as any;
      const contextRow = db.db.prepare("SELECT COUNT(*) as count FROM memory_entries WHERE type = 'context' AND is_archived = 0").get() as any;
      const sessionRow = db.db.prepare("SELECT COUNT(*) as count FROM memory_entries WHERE type = 'session' AND is_archived = 0").get() as any;

      header(`Usage Report — ${plan.name} Plan`);
      console.log('');

      // Usage table
      console.log('  ┌──────────────────────┬─────────┬─────────┬────────┐');
      console.log('  │ Resource             │ Used    │ Limit   │ %      │');
      console.log('  ├──────────────────────┼─────────┼─────────┼────────┤');

      const formatRow = (label: string, used: number, limit: number | null) => {
        const usedStr = used.toString().padStart(7);
        const limitStr = limit === null ? '∞'.padStart(7) : limit.toLocaleString().padStart(7);
        const pctStr = formatPercentage(used, limit).padStart(6);
        return `  │ ${label.padEnd(20)} │ ${usedStr} │ ${limitStr} │ ${pctStr} │`;
      };

      console.log(formatRow('Projects', usage.projects, plan.limits.maxProjects));
      console.log(formatRow('Total entries', usage.entries, plan.limits.maxTotalEntries));
      console.log(formatRow('Decisions', decisionRow.count, null));
      console.log(formatRow('Patterns', patternRow.count, null));
      console.log(formatRow('Context', contextRow.count, null));
      console.log(formatRow('Sessions', sessionRow.count, null));
      console.log('  └──────────────────────┴─────────┴─────────┴────────┘');
      console.log('');

      // Warnings
      const projectPct = plan.limits.maxProjects !== null ? (usage.projects / plan.limits.maxProjects) * 100 : 0;
      const entryPct = plan.limits.maxTotalEntries !== null ? (usage.entries / plan.limits.maxTotalEntries) * 100 : 0;

      if (projectPct >= 80 && projectPct < 100) {
        console.log(chalk.yellow(`  ⚠ You're at ${projectPct.toFixed(0)}% of your project limit.\n`));
      }
      if (entryPct >= 80 && entryPct < 100) {
        console.log(chalk.yellow(`  ⚠ You're at ${entryPct.toFixed(0)}% of your entry limit.\n`));
      }
      if (projectPct >= 100 || entryPct >= 100) {
        console.log(chalk.red('  ✖ You\'ve reached your plan limit.\n'));
        console.log(chalk.cyan('  Upgrade to continue → contxt billing upgrade\n'));
      }

      await db.close();
    } catch (err) {
      outputError(`Usage check failed: ${err instanceof Error ? err.message : err}`);
      process.exit(1);
    }
  },
};
