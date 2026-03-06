#!/usr/bin/env node
/**
 * Push email templates to Supabase production via Management API
 *
 * Usage:
 *   SUPABASE_PROJECT_REF=your_ref SUPABASE_ACCESS_TOKEN=your_pat node scripts/push-email-templates.mjs
 *
 * SUPABASE_PROJECT_REF  — found in: Supabase dashboard → Settings → General → Reference ID
 * SUPABASE_ACCESS_TOKEN — found in: supabase.com/dashboard → Account → Access Tokens (create one)
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Config ──────────────────────────────────────────────────────────────────

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!PROJECT_REF || !ACCESS_TOKEN) {
  console.error(`
Missing required environment variables.

  SUPABASE_PROJECT_REF   — Supabase dashboard → Settings → General → Reference ID
  SUPABASE_ACCESS_TOKEN  — supabase.com/dashboard → Account → Access Tokens

Run as:
  SUPABASE_PROJECT_REF=xxxx SUPABASE_ACCESS_TOKEN=sbp_xxx node scripts/push-email-templates.mjs
`);
  process.exit(1);
}

// ── Read templates ───────────────────────────────────────────────────────────

function read(filename) {
  return readFileSync(resolve(ROOT, 'supabase/templates', filename), 'utf-8');
}

const templates = {
  confirmation: {
    subject: 'Confirm your contxt account',
    content: read('confirm.html'),
  },
  recovery: {
    subject: 'Reset your contxt password',
    content: read('recovery.html'),
  },
  magic_link: {
    subject: 'Your contxt sign-in link',
    content: read('magic_link.html'),
  },
  email_change: {
    subject: 'Confirm your new email — contxt',
    content: read('email_change.html'),
  },
  invite: {
    subject: "You've been invited to contxt",
    content: read('invite.html'),
  },
};

// ── Build payload ────────────────────────────────────────────────────────────

const payload = {
  mailer_subjects_confirmation:    templates.confirmation.subject,
  mailer_templates_confirmation_content: templates.confirmation.content,

  mailer_subjects_recovery:        templates.recovery.subject,
  mailer_templates_recovery_content: templates.recovery.content,

  mailer_subjects_magic_link:      templates.magic_link.subject,
  mailer_templates_magic_link_content: templates.magic_link.content,

  mailer_subjects_email_change:    templates.email_change.subject,
  mailer_templates_email_change_content: templates.email_change.content,

  mailer_subjects_invite:          templates.invite.subject,
  mailer_templates_invite_content: templates.invite.content,
};

// ── Push ─────────────────────────────────────────────────────────────────────

const url = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

console.log(`Pushing email templates to project ${PROJECT_REF}...\n`);

const res = await fetch(url, {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  const body = await res.text();
  console.error(`✖  Failed (${res.status}): ${body}`);
  process.exit(1);
}

console.log('✓  confirmation   — Confirm your contxt account');
console.log('✓  recovery       — Reset your contxt password');
console.log('✓  magic_link     — Your contxt sign-in link');
console.log('✓  email_change   — Confirm your new email — contxt');
console.log('✓  invite         — You\'ve been invited to contxt');
console.log('\nAll templates pushed successfully.');
