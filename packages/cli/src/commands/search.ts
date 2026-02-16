/**
 * Search command
 */

import { loadProject } from '../utils/project.js';
import { error, formatEntryList, section } from '../utils/output.js';

interface SearchOptions {
  branch?: string;
  type?: string;
  limit?: number;
}

export async function searchCommand(
  query: string,
  options: SearchOptions
): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    const results = await engine.searchEntries(projectId, query, {
      branch: options.branch,
      type: options.type,
    });

    // Apply limit if specified
    const limited = options.limit ? results.slice(0, options.limit) : results;

    console.log(section(`Search Results for "${query}"`));
    console.log();
    console.log(formatEntryList(limited));
    console.log();
    console.log(`Found ${results.length} result(s)`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}
