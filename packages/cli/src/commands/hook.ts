/**
 * Hook command — install, uninstall, and run git hooks
 */

import { readFileSync, writeFileSync, existsSync, chmodSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import { runPostCommit } from '../hooks/post-commit.js';
import { runPrePush } from '../hooks/pre-push.js';
import { runPostCheckout } from '../hooks/post-checkout.js';
import { runPrepareCommitMsg } from '../hooks/prepare-commit-msg.js';

const CONTXT_BLOCK_START = '# --- contxt hook start ---';
const CONTXT_BLOCK_END = '# --- contxt hook end ---';

const ALL_HOOKS = ['post-commit', 'pre-push', 'post-checkout', 'prepare-commit-msg'] as const;
type HookName = (typeof ALL_HOOKS)[number];

interface InstallOptions {
  hooks?: string;
}

interface HookStatus {
  name: HookName;
  installed: boolean;
  fileExists: boolean;
}

/**
 * Install git hooks
 */
export async function installCommand(options: InstallOptions = {}) {
  const gitHooksDir = join(process.cwd(), '.git', 'hooks');

  if (!existsSync(join(process.cwd(), '.git'))) {
    console.error(chalk.red('Not a git repository.'));
    process.exit(1);
  }

  mkdirSync(gitHooksDir, { recursive: true });

  const hooksToInstall: HookName[] = options.hooks
    ? (options.hooks.split(',').map((h) => h.trim()) as HookName[])
    : [...ALL_HOOKS];

  let installed = 0;
  let updated = 0;

  for (const hookName of hooksToInstall) {
    const hookPath = join(gitHooksDir, hookName);

    const contxtLine = `contxt hook run ${hookName} "$@"`;
    const contxtBlock = `${CONTXT_BLOCK_START}\n${contxtLine}\n${CONTXT_BLOCK_END}`;

    if (existsSync(hookPath)) {
      const content = readFileSync(hookPath, 'utf-8');
      if (content.includes(CONTXT_BLOCK_START)) {
        // Already installed — update the block
        const updated_content = content.replace(
          new RegExp(`${escapeRegex(CONTXT_BLOCK_START)}[\\s\\S]*?${escapeRegex(CONTXT_BLOCK_END)}`),
          contxtBlock
        );
        writeFileSync(hookPath, updated_content, 'utf-8');
        updated++;
      } else {
        // Append to existing hook
        const newContent = content.trimEnd() + '\n\n' + contxtBlock + '\n';
        writeFileSync(hookPath, newContent, 'utf-8');
        installed++;
      }
    } else {
      // Create new hook file
      const newContent = `#!/bin/sh\n\n${contxtBlock}\n`;
      writeFileSync(hookPath, newContent, 'utf-8');
      installed++;
    }

    // Ensure executable
    chmodSync(hookPath, '755');
    console.log(chalk.green('✓'), `${hookName}`);
  }

  console.log('');
  if (installed > 0) console.log(chalk.green(`Installed ${installed} hook${installed !== 1 ? 's' : ''}.`));
  if (updated > 0) console.log(chalk.yellow(`Updated ${updated} existing hook${updated !== 1 ? 's' : ''}.`));
  console.log('');
  console.log(chalk.gray('Hooks will capture context from your git workflow automatically.'));
}

/**
 * Uninstall git hooks
 */
export async function uninstallCommand(options: InstallOptions = {}) {
  const gitHooksDir = join(process.cwd(), '.git', 'hooks');

  if (!existsSync(join(process.cwd(), '.git'))) {
    console.error(chalk.red('Not a git repository.'));
    process.exit(1);
  }

  const hooksToRemove: HookName[] = options.hooks
    ? (options.hooks.split(',').map((h) => h.trim()) as HookName[])
    : [...ALL_HOOKS];

  let removed = 0;

  for (const hookName of hooksToRemove) {
    const hookPath = join(gitHooksDir, hookName);
    if (!existsSync(hookPath)) continue;

    const content = readFileSync(hookPath, 'utf-8');
    if (!content.includes(CONTXT_BLOCK_START)) continue;

    // Remove contxt block
    const cleaned = content
      .replace(
        new RegExp(`\\n*${escapeRegex(CONTXT_BLOCK_START)}[\\s\\S]*?${escapeRegex(CONTXT_BLOCK_END)}\\n*`),
        '\n'
      )
      .trim();

    if (cleaned === '#!/bin/sh' || cleaned === '') {
      // Hook was only contxt — remove the file (leave it empty is fine too)
      writeFileSync(hookPath, '#!/bin/sh\n', 'utf-8');
    } else {
      writeFileSync(hookPath, cleaned + '\n', 'utf-8');
    }

    removed++;
    console.log(chalk.gray('✗'), hookName);
  }

  if (removed > 0) {
    console.log('');
    console.log(chalk.green(`Removed ${removed} hook${removed !== 1 ? 's' : ''}.`));
  } else {
    console.log(chalk.gray('No Contxt hooks found to remove.'));
  }
}

/**
 * Show hook status
 */
export async function statusCommand() {
  const gitHooksDir = join(process.cwd(), '.git', 'hooks');

  if (!existsSync(join(process.cwd(), '.git'))) {
    console.error(chalk.red('Not a git repository.'));
    process.exit(1);
  }

  console.log('');
  console.log(chalk.bold('Git Hook Status'));
  console.log('');

  for (const hookName of ALL_HOOKS) {
    const hookPath = join(gitHooksDir, hookName);
    const fileExists = existsSync(hookPath);
    let isInstalled = false;

    if (fileExists) {
      const content = readFileSync(hookPath, 'utf-8');
      isInstalled = content.includes(CONTXT_BLOCK_START);
    }

    const statusIcon = isInstalled ? chalk.green('✓') : chalk.gray('○');
    const label = isInstalled ? chalk.green(hookName) : chalk.gray(hookName);
    const note = !fileExists ? chalk.gray(' (no hook file)') : isInstalled ? chalk.gray(' installed') : chalk.yellow(' not installed');

    console.log(`  ${statusIcon} ${label}${note}`);
  }

  console.log('');

  const installedCount = ALL_HOOKS.filter((h) => {
    const hookPath = join(gitHooksDir, h);
    return existsSync(hookPath) && readFileSync(hookPath, 'utf-8').includes(CONTXT_BLOCK_START);
  }).length;

  if (installedCount === 0) {
    console.log(chalk.cyan(`Run ${chalk.bold('contxt hook install')} to enable automatic context capture.`));
  }
}

/**
 * Run a specific hook (called by the git hook shell script)
 */
export async function runCommand(hookName: string) {
  switch (hookName) {
    case 'post-commit':
      await runPostCommit();
      break;
    case 'pre-push':
      await runPrePush();
      break;
    case 'post-checkout':
      await runPostCheckout();
      break;
    case 'prepare-commit-msg':
      await runPrepareCommitMsg();
      break;
    default:
      // Unknown hook — silent
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const hookCommand = {
  install: installCommand,
  uninstall: uninstallCommand,
  status: statusCommand,
  run: runCommand,
};
