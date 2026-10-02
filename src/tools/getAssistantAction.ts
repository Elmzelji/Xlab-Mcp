/**
 * Tool `get_assistant_action` — detail d'une proposition de Lou.
 * Scope : assistant.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getAssistantActionTool = {
    name: 'get_assistant_action',
    description: "Detail d'une proposition de Lou : contenu propose (payload), contexte, membre concerne, statut.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            uuid: { type: 'string', description: 'uuid de la proposition (list_assistant_actions)' },
        },
        required: ['lab', 'uuid'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        uuid: z.string(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/actions/${encodeURIComponent(p.uuid)}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
