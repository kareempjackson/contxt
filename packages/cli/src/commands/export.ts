/**
 * Export/Import commands
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import inquirer from 'inquirer';
import { loadProject } from '../utils/project.js';
import { success, error, info } from '../utils/output.js';

interface ExportOptions {
  output?: string;
  branch?: string;
  force?: boolean;
}

interface ImportOptions {
  file: string;
  merge?: boolean;
}

export async function exportCommand(options: ExportOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    // Get all entries
    const entries = await engine.getAllEntries({
      projectId,
      branch: options.branch,
      isArchived: false,
    });

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projectId,
      branch: options.branch || 'main',
      entries: entries.map((e) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        content: e.content,
        metadata: e.metadata,
        branch: e.branch,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
    };

    const json = JSON.stringify(exportData, null, 2);

    if (options.output) {
      if (existsSync(options.output) && !options.force) {
        const { confirmed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'confirmed',
          message: `${options.output} already exists. Overwrite?`,
          default: false,
        }]);
        if (!confirmed) {
          info('Export cancelled.');
          await db.close();
          return;
        }
      }
      writeFileSync(options.output, json, 'utf-8');
      success(`Exported ${entries.length} entries to ${options.output}`);
    } else {
      // Output to stdout
      console.log(json);
    }

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}

export async function importCommand(options: ImportOptions): Promise<void> {
  try {
    const { engine, projectId, db } = await loadProject();

    // Read import file
    let data: any;
    try {
      const json = readFileSync(options.file, 'utf-8');
      data = JSON.parse(json);
    } catch (err) {
      error(`Failed to read import file: ${(err as Error).message}`);
      process.exit(1);
    }

    if (!data.entries || !Array.isArray(data.entries)) {
      error('Invalid import file format');
      process.exit(1);
    }

    info(`Importing ${data.entries.length} entries...`);

    let imported = 0;
    for (const entry of data.entries) {
      try {
        // Create new entry with imported data
        await db.createEntry({
          projectId,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          metadata: entry.metadata,
          branch: entry.branch,
        });
        imported++;
      } catch (err) {
        console.error(`Failed to import entry "${entry.title}": ${(err as Error).message}`);
      }
    }

    success(`Imported ${imported} of ${data.entries.length} entries`);

    await db.close();
  } catch (err) {
    error((err as Error).message);
    process.exit(1);
  }
}
