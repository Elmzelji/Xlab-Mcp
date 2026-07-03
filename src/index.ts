#!/usr/bin/env node
/**
 * Serveur MCP ConnectXLab — expose les tools qui appellent l'API Laravel
 * xlab-back. Se branche a Claude Desktop / Cursor / n'importe quel client
 * MCP via stdio.
 *
 * Config attendue (env) :
 *   XLAB_MCP_TOKEN  (requis)  ton token cote ConnectXLab, prefixe xlab_mcp_
 *   XLAB_API_URL    (defaut https://v1.connectxlab.io/api/v1)
 *   XLAB_TIMEOUT_MS (defaut 15000)
 *
 * Distribution :
 *   npx -y @connectxlab/mcp-server  (via config Claude Desktop, env transmis)
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { listLabsTool } from './tools/listLabs.js';
import { listMembersTool } from './tools/listMembers.js';
import { listPostsTool } from './tools/listPosts.js';
import { listCategoriesTool } from './tools/listCategories.js';
import { createPostTool } from './tools/createPost.js';
import { sendDmTool } from './tools/sendDm.js';
import { getEarningsTool } from './tools/getEarnings.js';
import { approveMemberTool } from './tools/approveMember.js';
import { rejectMemberTool } from './tools/rejectMember.js';
import { kickMemberTool } from './tools/kickMember.js';
import { listShopsTool } from './tools/listShops.js';
import { getShopSalesTool } from './tools/getShopSales.js';
import { listClassesTool } from './tools/listClasses.js';
import { createClassTool } from './tools/createClass.js';
import { deleteClassTool } from './tools/deleteClass.js';
import { listEventsTool } from './tools/listEvents.js';
import { createEventTool } from './tools/createEvent.js';
import { deleteEventTool } from './tools/deleteEvent.js';
import { pinPostTool } from './tools/pinPost.js';
import { listCommentsTool } from './tools/listComments.js';
import { addCommentTool } from './tools/addComment.js';

const tools = [
    listLabsTool,
    listMembersTool,
    listPostsTool,
    listCategoriesTool,
    createPostTool,
    sendDmTool,
    getEarningsTool,
    approveMemberTool,
    rejectMemberTool,
    kickMemberTool,
    listShopsTool,
    getShopSalesTool,
    listClassesTool,
    createClassTool,
    deleteClassTool,
    listEventsTool,
    createEventTool,
    deleteEventTool,
    pinPostTool,
    listCommentsTool,
    addCommentTool,
];

const server = new Server(
    { name: 'connectxlab', version: '0.1.0' },
    { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: tools.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
    })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const tool = tools.find(t => t.name === name);
    if (!tool) {
        return {
            isError: true,
            content: [{ type: 'text' as const, text: `Tool inconnu : ${name}` }],
        };
    }
    return await tool.handler(args ?? {});
});

const transport = new StdioServerTransport();
await server.connect(transport);

// Log stderr pour debug (Claude Desktop l'affiche dans les logs).
console.error(`[connectxlab-mcp] ready — ${tools.length} tools : ${tools.map(t => t.name).join(', ')}`);
