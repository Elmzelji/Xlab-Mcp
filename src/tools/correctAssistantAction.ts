/**
 * Tool `correct_assistant_action` — corrige une reponse deja envoyee par Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const correctAssistantActionTool = {
    name: 'correct_assistant_action',
    description: "Corrige une reponse que Lou a deja envoyee seule (modes assisted / autopilot) : remplace le contenu publie et enregistre la correction pour que Lou apprenne.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            uuid: { type: 'string', description: 'uuid de la proposition (list_assistant_actions)' },
            body: { type: 'string', maxLength: 5000 },
        },
        required: ['lab', 'uuid', 'body'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        uuid: z.string(),
        body: z.string().max(5000),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, uuid, ...body } = this.zodSchema.parse(args);
        const p = { lab, uuid };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/actions/${encodeURIComponent(p.uuid)}/correct`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
