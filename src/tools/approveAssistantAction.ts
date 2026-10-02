/**
 * Tool `approve_assistant_action` — valide et execute une proposition de Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const approveAssistantActionTool = {
    name: 'approve_assistant_action',
    description: "Valide ET execute une proposition de Lou (envoie le DM / la reponse, publie le post). body / title / category_id optionnels pour retoucher avant envoi. Action visible par les membres : la faire confirmer par l'owner.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            uuid: { type: 'string', description: 'uuid de la proposition (list_assistant_actions)' },
            body: { type: 'string', maxLength: 5000 },
            title: { type: 'string', maxLength: 255 },
            category_id: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'uuid'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        uuid: z.string(),
        body: z.string().max(5000).nullable().optional(),
        title: z.string().max(255).nullable().optional(),
        category_id: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, uuid, ...body } = this.zodSchema.parse(args);
        const p = { lab, uuid };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/actions/${encodeURIComponent(p.uuid)}/approve`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
