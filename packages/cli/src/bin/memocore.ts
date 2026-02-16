#!/usr/bin/env node

/**
 * MemoCore CLI Entry Point
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

const program = new Command();

program
  .name('memocore')
  .description('GitHub for AI Context - Persistent memory for AI coding agents')
  .version('0.1.0');

// Project commands
program
  .command('init')
  .description('Initialize a MemoCore project in the current directory')
  .option('-n, --name <name>', 'Project name')
  .action(initCommand);

program
  .command('status')
  .description('Show project status and memory summary')
  .action(statusCommand);

// Decision commands
const decision = program
  .command('decision')
  .description('Manage architectural decisions');

decision
  .command('add')
  .description('Add a new decision')
  .requiredOption('-t, --title <title>', 'Decision title')
  .requiredOption('-r, --rationale <rationale>', 'Decision rationale')
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
  .description('Logout from MemoCore')
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

// Parse arguments
program.parse();
