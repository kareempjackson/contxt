/**
 * post-checkout hook — switch Contxt branch when git branch changes
 */

import { execSync } from 'child_process';
import { getProjectDb } from '../utils/project.js';

export async function runPostCheckout(): Promise<void> {
  try {
    // post-checkout args: $1=prev_head, $2=new_head, $3=branch_flag (1=branch, 0=file)
    const isBranchCheckout = process.argv[4] === '1';
    if (!isBranchCheckout) return; // Only care about branch switches

    const db = await getProjectDb();
    const project = await db.getProjectByPath(process.cwd());
    if (!project) return;

    // Get current branch name
    const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf-8',
      timeout: 1000,
    }).trim();

    // Check if Contxt has this branch
    const branches = await db.listBranches(project.id);
    const contxtBranch = branches.find((b) => b.name === gitBranch);

    if (contxtBranch) {
      // Switch Contxt to match the git branch
      await db.switchBranch(project.id, gitBranch);
      const entryCount = await db.countEntries({ projectId: project.id, branch: gitBranch });
      process.stdout.write(`contxt: switched to branch ${gitBranch} (${entryCount} entries)\n`);
    } else {
      // No matching Contxt branch — stay on current, report main
      const currentBranch = await db.getActiveBranch(project.id);
      process.stdout.write(`contxt: no memory branch for ${gitBranch}, using ${currentBranch}\n`);
    }

    await db.close();
  } catch {
    // Silent on error
  }
}
