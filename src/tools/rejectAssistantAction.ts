/**
 * Tool `reject_assistant_action` — rejette une proposition de Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const rejectAssistantActionTool = {
    name: 'reject_assistant_action',
    description: "Rejette une proposition de Lou (rien n'est envoye).",
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
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/actions/${encodeURIComponent(p.uuid)}/reject`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
