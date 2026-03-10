#!/usr/bin/env node

/**
 * Contxt CLI Entry Point
 */

import { Command } from 'commander';
import { initCommand } from '../commands/init.js';
import { decisionCommand } from '../commands/decision.js';
import { patternCommand } from '../commands/pattern.js';
import { contextCommand } from '../commands/context.js';
import { statusCommand } from '../commands/status.js';
import { docCommand } from '../commands/doc.js';
import { sessionCommand } from '../commands/session.js';
import { searchCommand } from '../commands/search.js';
import { exportCommand, importCommand } from '../commands/export.js';
import { authCommand } from '../commands/auth.js';
import { syncCommand } from '../commands/sync.js';
import { branchCommand } from '../commands/branch.js';
import { historyCommand } from '../commands/history.js';
import { loadCommand } from '../commands/load.js';
import { scanCommand } from '../commands/scan.js';
import { reviewCommand } from '../commands/review.js';
import { rulesCommand } from '../commands/rules.js';
import { captureCommand } from '../commands/capture.js';
import { hookCommand } from '../commands/hook.js';
import { watchCommand } from '../commands/watch.js';
import { billingCommand } from '../commands/billing.js';
import { mcpCommand } from '../commands/mcp.js';
import { listCommand, deleteCommand } from '../commands/entries.js';
import { addCommand } from '../commands/add.js';

declare const __CLI_VERSION__: string;

const program = new Command();

program
  .name('contxt')
  .description('GitHub for AI Context - Persistent memory for AI coding agents')
  .version(typeof __CLI_VERSION__ !== 'undefined' ? __CLI_VERSION__ : '0.2.0');

// Project commands
program
  .command('init')
  .description('Initialize a Contxt project in the current directory')
  .option('-n, --name <name>', 'Project name')
  .action(initCommand);

program
  .command('status')
  .description('Show project status and memory summary')
  .action(statusCommand);

program
  .command('list')
  .description('List all entries')
  .option('--type <type>', 'Filter by type: decision, pattern, doc, session, context')
  .option('-b, --branch <branch>', 'Filter by branch')
  .option('--full', 'Show full titles without truncation')
  .action(listCommand);

program
  .command('delete <id>')
  .description('Delete an entry by ID (or short ID prefix)')
  .option('--force', 'Skip confirmation prompt')
  .action(deleteCommand);

program
  .command('add <text>')
  .description('Capture a decision, pattern, or context — type is auto-inferred')
  .option('-t, --type <type>', 'Override type (decision, pattern, context, document)')
  .option('--tags <tags...>', 'Tags to apply')
  .action(addCommand);

// Decision commands
const decision = program
  .command('decision')
  .description('Manage architectural decisions');

decision
  .command('add')
  .description('Add a new decision')
  .requiredOption('-t, --title <title>', 'Decision title')
  .option('-r, --rationale <rationale>', 'Decision rationale')
  .option('-a, --alternatives <alternatives...>', 'Alternative approaches considered')
  .option('-c, --consequences <consequences...>', 'Consequences of this decision')
  .option('--tags <tags...>', 'Tags for categorization')
  .action(decisionCommand.add);

decision
  .command('list')
  .description('List all decisions')
  .option('-b, --branch <branch>', 'Filter by branch')
  .action(decisionCommand.list);

decision
  .command('show <id>')
  .description('Show a specific decision')
  .action(decisionCommand.show);

// Pattern commands
const pattern = program
  .command('pattern')
  .description('Manage code patterns and conventions');

pattern
  .command('add')
  .description('Add a new pattern')
  .requiredOption('-t, --title <title>', 'Pattern title')
  .requiredOption('-c, --content <content>', 'Pattern content/code')
  .option('--category <category>', 'Pattern category')
  .option('--tags <tags...>', 'Tags for categorization')
  .action(patternCommand.add);

pattern
  .command('list')
  .description('List all patterns')
  .option('-b, --branch <branch>', 'Filter by branch')
  .action(patternCommand.list);

pattern
  .command('show <id>')
  .description('Show a specific pattern')
  .action(patternCommand.show);

// Context commands
const context = program
  .command('context')
  .description('Manage project working context');

context
  .command('set')
  .description('Set current working context')
  .option('-f, --feature <feature>', 'Current feature being worked on')
  .option('-b, --blockers <blockers...>', 'Current blockers')
  .option('-n, --next <steps...>', 'Next steps')
  .option('--files <files...>', 'Active files')
  .action(contextCommand.set);

context
  .command('show')
  .description('Show current context')
  .action(contextCommand.show);

context
  .command('clear')
  .description('Clear current context')
  .action(contextCommand.clear);

// Document commands
const doc = program
  .command('doc')
  .description('Manage documentation and reference materials');

doc
  .command('add')
  .description('Add a new document')
  .requiredOption('-t, --title <title>', 'Document title')
  .option('-c, --content <content>', 'Document content')
  .option('-f, --file <file>', 'Read content from file')
  .option('-u, --url <url>', 'Source URL')
  .option('--tags <tags...>', 'Tags for categorization')
  .action(docCommand.add);

doc
  .command('list')
  .description('List all documents')
  .option('-b, --branch <branch>', 'Filter by branch')
  .action(docCommand.list);

doc
  .command('show <id>')
  .description('Show a specific document')
  .action(docCommand.show);

// Session commands
const session = program
  .command('session')
  .description('Manage development sessions');

session
  .command('start')
  .description('Start a new development session')
  .requiredOption('-f, --feature <feature>', 'Feature being worked on')
  .option('-d, --description <description>', 'Session description')
  .action(sessionCommand.start);

session
  .command('end')
  .description('End the current session')
  .option('-s, --summary <summary>', 'Session summary')
  .action(sessionCommand.end);

session
  .command('list')
  .description('List all sessions')
  .option('-b, --branch <branch>', 'Filter by branch')
  .action(sessionCommand.list);

session
  .command('current')
  .description('Show current active session')
  .action(sessionCommand.current);

// Search command
program
  .command('search <query>')
  .description('Search memory entries')
  .option('-b, --branch <branch>', 'Filter by branch')
  .option('-t, --type <type>', 'Filter by type (decision, pattern, context, document, session)')
  .option('-l, --limit <limit>', 'Limit number of results', parseInt)
  .action(searchCommand);

// Export command
program
  .command('export')
  .description('Export memory entries to JSON')
  .option('-o, --output <file>', 'Output file (defaults to stdout)')
  .option('-b, --branch <branch>', 'Export specific branch')
  .action(exportCommand);

// Import command
program
  .command('import')
  .description('Import memory entries from JSON')
  .requiredOption('-f, --file <file>', 'Input file to import')
  .option('-m, --merge', 'Merge with existing entries (default: replace)')
  .action(importCommand);

// Auth commands
const auth = program
  .command('auth')
  .description('Manage authentication');

auth
  .command('login')
  .description('Authenticate with GitHub or email')
  .option('-e, --email <email>', 'Login with magic link (email)')
  .action(authCommand.login);

auth
  .command('logout')
  .description('Logout from Contxt')
  .action(authCommand.logout);

auth
  .command('status')
  .description('Check authentication status')
  .action(authCommand.status);

// Sync commands
program
  .command('push')
  .description('Push local changes to cloud')
  .option('-f, --force', 'Force push (override conflicts)')
  .option('-d, --dry-run', 'Show what would be pushed without actually pushing')
  .action(syncCommand.push);

program
  .command('pull')
  .description('Pull remote changes to local')
  .option('-f, --force', 'Force pull (override conflicts)')
  .option('-d, --dry-run', 'Show what would be pulled without actually pulling')
  .action(syncCommand.pull);

program
  .command('sync')
  .description('Full bidirectional sync (pull + push)')
  .option('-f, --force', 'Force sync (override conflicts)')
  .option('-d, --dry-run', 'Show what would be synced without actually syncing')
  .action(syncCommand.sync);

// Branch commands
const branch = program
  .command('branch')
  .description('Manage branches');

branch
  .command('create <name>')
  .description('Create a new branch')
  .option('-f, --from <branch>', 'Create from specific branch')
  .action(branchCommand.create);

branch
  .command('list')
  .description('List all branches')
  .action(branchCommand.list);

branch
  .command('switch <name>')
  .description('Switch to a different branch')
  .action(branchCommand.switch);

branch
  .command('delete <name>')
  .description('Delete a branch')
  .action(branchCommand.delete);

branch
  .command('merge <source>')
  .description('Merge a branch into current branch')
  .action(branchCommand.merge);

// History commands
const history = program
  .command('history')
  .description('View and restore version history');

history
  .command('show <entry-id>')
  .description('Show version history for an entry')
  .action(historyCommand.show);

history
  .command('restore <entry-id>')
  .description('Restore an entry to a previous version')
  .requiredOption('-v, --version <version>', 'Version number to restore', parseInt)
  .action(historyCommand.restore);

// Load command
program
  .command('load')
  .description('Generate context payload for AI prompts')
  .option('-t, --task <description>', 'Task-based context (smart relevance ranking)')
  .option('-f, --files <files...>', 'File-based context (filter by file mentions)')
  .option('-a, --all', 'All context (everything, sorted by recency)')
  .option('--max-tokens <tokens>', 'Maximum tokens for context', parseInt)
  .option('--type <type>', 'Filter by entry type (decision, pattern, etc.)')
  .option('-s, --summary', 'Show context summary instead of full context')
  .action(loadCommand);

// Scan command
program
  .command('scan')
  .description('Scan codebase for tagged comments (@decision, @pattern, @context)')
  .option('--path <path>', 'Specific directory to scan')
  .option('--dry-run', 'Show what would be captured without saving')
  .option('--auto-confirm', 'Skip draft queue, save directly as active')
  .action(scanCommand);

// Review command
program
  .command('review')
  .description('Review and confirm draft entries')
  .option('--source <source>', 'Filter by source (scan, hooks, mcp, import)')
  .option('--confirm-all', 'Confirm all pending drafts')
  .option('--discard-all', 'Discard all pending drafts')
  .option('--count', 'Show draft count only')
  .action(reviewCommand);

// Rules commands
const rules = program
  .command('rules')
  .description('Manage .contxt/rules.md file')
  .addHelpCommand(false)
  .action(function (this: any) { this.help(); });

rules
  .command('sync')
  .description('Sync rules.md into memory store')
  .option('--dry-run', 'Show what would be synced without saving')
  .option('-f, --force', 'Force sync even if conflicts exist')
  .action(rulesCommand.sync);

rules
  .command('generate')
  .description('Generate rules.md from memory store')
  .option('--dry-run', 'Show what would be generated without writing')
  .option('-f, --force', 'Overwrite existing rules.md')
  .action(rulesCommand.generate);

rules
  .command('diff')
  .description('Show differences between rules.md and memory')
  .action(rulesCommand.diff);

// Capture command
program
  .command('capture')
  .description('Extract context from existing project files')
  .option('--source <source>', 'Source to capture from (readme, cursor, claude, adr, commits, package, all)')
  .option('--dry-run', 'Show what would be captured without saving')
  .option('--auto-confirm', 'Skip draft queue, save directly as active')
  .option('--limit <limit>', 'Limit number of commits to scan (default: 50)', parseInt)
  .action(captureCommand);

// Hook commands
const hook = program
  .command('hook')
  .description('Manage git hooks for automatic context capture');

hook
  .command('install')
  .description('Install git hooks')
  .option('--hooks <hooks>', 'Comma-separated hooks to install (post-commit, pre-push, post-checkout, prepare-commit-msg)')
  .action(hookCommand.install);

hook
  .command('uninstall')
  .description('Uninstall git hooks')
  .option('--hooks <hooks>', 'Comma-separated hooks to remove')
  .action(hookCommand.uninstall);

hook
  .command('status')
  .description('Show installed hook status')
  .action(hookCommand.status);

hook
  .command('run <hook-name>')
  .description('Run a specific hook (called internally by git)')
  .action(hookCommand.run);

// Watch commands
program
  .command('watch')
  .description('Start background file watcher for passive context capture')
  .option('--daemon', 'Run as background process')
  .option('--polling', 'Use polling instead of native FS events (for Linux/containers/Docker)')
  .action(watchCommand.start);

program
  .command('watch:stop')
  .description('Stop the background watch daemon')
  .action(watchCommand.stop);

program
  .command('watch:status')
  .description('Show watch daemon status')
  .action(watchCommand.status);

// Billing commands
const billing = program
  .command('billing')
  .description('Manage subscription and billing');

billing
  .command('status')
  .description('Show current plan and usage')
  .action(billingCommand.status);

billing
  .command('manage')
  .description('Open Stripe customer portal to update payment or cancel')
  .action(billingCommand.manage);

billing
  .command('upgrade')
  .description('Upgrade to Contxt Pro')
  .action(billingCommand.upgrade);

billing
  .command('usage')
  .description('Show detailed usage breakdown by entry type')
  .action(billingCommand.usage);

// MCP server command (called by editors via .mcp.json config)
program
  .command('mcp')
  .description('Start the MCP server (used by Cursor, Claude Code, Windsurf)')
  .action(mcpCommand);

// Parse arguments
program.parse();
