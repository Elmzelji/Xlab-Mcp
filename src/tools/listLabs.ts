/**
 * Tool `list_labs` — liste les Labs pilotables par le token courant.
 * Correspond a GET /api/v1/mcp/labs cote Laravel.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listLabsTool = {
    name: 'list_labs',
    description: 'Liste les Labs (communautes) accessibles avec ce token MCP. Renvoie id, url, nom, description, nombre de membres et prix mensuel.',
    inputSchema: {
        type: 'object' as const,
        properties: {},
        additionalProperties: false,
    },
    zodSchema: z.object({}),
    async handler(_args: Record<string, unknown>) {
        try {
            const { data } = await http.get('/mcp/labs');
            return {
                content: [
                    { type: 'text' as const, text: JSON.stringify(data.data ?? [], null, 2) },
                ],
            };
        } catch (err) {
            return {
                isError: true,
                content: [{ type: 'text' as const, text: formatApiError(err) }],
            };
        }
    },
};
