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
    name: 'memocore',
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
  console.error('MemoCore MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
