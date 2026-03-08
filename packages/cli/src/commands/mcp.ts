/**
 * MCP command — starts the Contxt MCP server over stdio.
 * Called by editors (Cursor, Claude Code, Windsurf) via the .mcp.json config:
 *   { "command": "contxt", "args": ["mcp"] }
 */

import { startMcpServer } from '../../../mcp/src/server.js';

export async function mcpCommand(): Promise<void> {
  await startMcpServer().catch((err: unknown) => {
    console.error('Fatal error starting MCP server:', err);
    process.exit(1);
  });
}
