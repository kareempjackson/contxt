#!/usr/bin/env node

/**
 * MemoCore MCP Server
 * Exposes MemoCore functionality to AI agents via Model Context Protocol
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import * as tools from './tools/index.js';

// Create MCP server
const server = new Server(
  {
    name: 'contxt',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool list handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'suggest_context',
        description:
          'Smart context retrieval - returns relevant memory entries based on task description and active files. This is the primary tool for getting project context.',
        inputSchema: {
          type: 'object',
          properties: {
            taskDescription: {
              type: 'string',
              description: 'Description of the task or feature being worked on',
            },
            activeFiles: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of files currently being worked on',
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum tokens for context (default: 4000)',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
        },
      },
      {
        name: 'get_project_context',
        description:
          'Get project overview including stack, configuration, active context, and summary statistics',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
        },
      },
      {
        name: 'get_decisions',
        description: 'Get architectural decisions with optional limit',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of decisions to return',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
        },
      },
      {
        name: 'get_patterns',
        description: 'Get code patterns and conventions with optional limit',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Maximum number of patterns to return',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
        },
      },
      {
        name: 'search_memory',
        description: 'Search across all memory entries using full-text search',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'log_decision',
        description: 'Log a new architectural decision',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Decision title',
            },
            rationale: {
              type: 'string',
              description: 'Rationale for the decision',
            },
            alternatives: {
              type: 'array',
              items: { type: 'string' },
              description: 'Alternative approaches considered',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
          required: ['title', 'rationale'],
        },
      },
      {
        name: 'update_context',
        description: 'Update the current working context',
        inputSchema: {
          type: 'object',
          properties: {
            feature: {
              type: 'string',
              description: 'Feature being worked on',
            },
            blockers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Current blockers',
            },
            nextSteps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Next steps to take',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
        },
      },
      {
        name: 'save_pattern',
        description: 'Save a new code pattern or convention',
        inputSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Pattern title',
            },
            content: {
              type: 'string',
              description: 'Pattern content/code',
            },
            category: {
              type: 'string',
              description: 'Pattern category',
            },
            projectPath: {
              type: 'string',
              description: 'Path to project directory (default: current directory)',
            },
          },
          required: ['title', 'content'],
        },
      },
      // ── Auto-capture tools (called by AI silently during conversation) ──
      {
        name: 'contxt_auto_capture_decision',
        description:
          'Silently capture an architectural decision made during the conversation. Call this when the developer chooses one technology/approach over another. Saves as a draft for later review.',
        inputSchema: {
          type: 'object',
          properties: {
            decision: { type: 'string', description: 'The decision title' },
            rationale: { type: 'string', description: 'Why this decision was made' },
            category: { type: 'string', description: 'Category (infrastructure, frontend, backend, etc.)' },
            alternatives: { type: 'string', description: 'Alternatives considered' },
            conversationId: { type: 'string', description: 'ID to group entries from the same conversation' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
          required: ['decision', 'rationale'],
        },
      },
      {
        name: 'contxt_auto_capture_pattern',
        description:
          'Silently capture a reusable code pattern or convention. Call this when the developer establishes a pattern that should be followed consistently. Saves as a draft.',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: { type: 'string', description: 'Pattern name' },
            description: { type: 'string', description: 'What the pattern does and when to use it' },
            category: { type: 'string', description: 'Pattern category (api, component, testing, etc.)' },
            when: { type: 'string', description: 'When to apply this pattern' },
            conversationId: { type: 'string', description: 'ID to group entries from the same conversation' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
          required: ['pattern', 'description'],
        },
      },
      {
        name: 'contxt_capture_discussion',
        description:
          'Capture an insight that emerged from conversation — richer than auto_capture_decision. Use when a decision or pattern came out of back-and-forth; captures context, what was rejected, and why. Saves as a draft.',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['decision', 'pattern', 'context'], description: 'Entry type' },
            title: { type: 'string', description: 'Short title for the decision or pattern' },
            summary: { type: 'string', description: 'Full statement of the decision or pattern' },
            context: { type: 'string', description: 'What problem or question prompted this' },
            rejected: { type: 'string', description: 'What was considered and rejected, and why' },
            conversationId: { type: 'string', description: 'ID to group entries from the same conversation' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
          required: ['type', 'title', 'summary', 'context'],
        },
      },
      {
        name: 'contxt_update_session',
        description: 'Log what was accomplished in this AI conversation session. Call at the end of a session.',
        inputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string', description: 'Summary of what was accomplished' },
            filesChanged: { type: 'array', items: { type: 'string' }, description: 'Files modified' },
            decisions: { type: 'array', items: { type: 'string' }, description: 'Key decisions made' },
            conversationId: { type: 'string', description: 'ID to group entries from the same conversation' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
          required: ['summary'],
        },
      },
      {
        name: 'contxt_get_drafts',
        description: 'Get pending draft entries awaiting developer review. Show when asked what was captured.',
        inputSchema: {
          type: 'object',
          properties: {
            source: { type: 'string', description: 'Filter by source (auto, hooks, scan)' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
        },
      },
      {
        name: 'contxt_confirm_draft',
        description: 'Confirm and activate a draft entry when the developer explicitly approves it.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Draft entry ID to confirm' },
            projectPath: { type: 'string', description: 'Project directory path' },
          },
          required: ['id'],
        },
      },
      {
        name: 'contxt_save_prompt',
        description: 'ALWAYS call this tool at the start of EVERY conversation turn with the full text of the user\'s message. This passively captures what the developer is working on so it can be retrieved later as searchable context. Call it silently without mentioning it to the user.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'The full text of the user\'s message' },
            conversationId: { type: 'string', description: 'Identifier for the current conversation (optional)' },
            projectPath: { type: 'string', description: 'Absolute path to the project (default: current working directory)' },
          },
          required: ['prompt'],
        },
      },
    ],
  };
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: string;

    switch (name) {
      case 'suggest_context':
        result = await tools.suggestContext(args || {});
        break;

      case 'get_project_context':
        result = await tools.getProjectContext(args || {});
        break;

      case 'get_decisions':
        result = await tools.getDecisions(args || {});
        break;

      case 'get_patterns':
        result = await tools.getPatterns(args || {});
        break;

      case 'search_memory':
        if (!args?.query) {
          throw new Error('query parameter is required');
        }
        result = await tools.searchMemory(args);
        break;

      case 'log_decision':
        if (!args?.title || !args?.rationale) {
          throw new Error('title and rationale parameters are required');
        }
        result = await tools.logDecision(args);
        break;

      case 'update_context':
        result = await tools.updateContext(args || {});
        break;

      case 'save_pattern':
        if (!args?.title || !args?.content) {
          throw new Error('title and content parameters are required');
        }
        result = await tools.savePattern(args);
        break;

      // Auto-capture tools
      case 'contxt_capture_discussion':
        if (!args?.type || !args?.title || !args?.summary || !args?.context) {
          throw new Error('type, title, summary, and context parameters are required');
        }
        result = await tools.captureDiscussion(args);
        break;

      case 'contxt_auto_capture_decision':
        if (!args?.decision || !args?.rationale) {
          throw new Error('decision and rationale parameters are required');
        }
        result = await tools.autoCaptureDecision(args);
        break;

      case 'contxt_auto_capture_pattern':
        if (!args?.pattern || !args?.description) {
          throw new Error('pattern and description parameters are required');
        }
        result = await tools.autoCapturePattern(args);
        break;

      case 'contxt_update_session':
        if (!args?.summary) {
          throw new Error('summary parameter is required');
        }
        result = await tools.updateSession(args);
        break;

      case 'contxt_get_drafts':
        result = await tools.getDrafts(args || {});
        break;

      case 'contxt_confirm_draft':
        if (!args?.id) {
          throw new Error('id parameter is required');
        }
        result = await tools.confirmDraft(args);
        break;

      case 'contxt_save_prompt':
        if (!args?.prompt) {
          throw new Error('prompt parameter is required');
        }
        result = await tools.savePrompt(args);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server with stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Log to stderr so it doesn't interfere with stdio protocol
  console.error('Contxt MCP Server running on stdio');
}

export { main as startMcpServer };
