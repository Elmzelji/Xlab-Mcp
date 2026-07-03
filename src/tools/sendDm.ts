/**
 * Tool `send_dm` — envoie un message direct a un membre du Lab.
 * L'id membre est celui retourne par list_members (`data[].id`, pas user_id).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const sendDmTool = {
    name: 'send_dm',
    description: "Envoie un message direct a un membre du Lab. L'id du membre est celui retourne par list_members (colonne `id`, PAS user_id).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            member_id: { type: 'number', description: 'Id de la ligne membre (list_members data[].id)' },
            message: { type: 'string', description: 'Contenu du message (max 5000 char)' },
        },
        required: ['lab', 'member_id', 'message'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        member_id: z.number().int().positive(),
        message: z.string().min(1).max(5000),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/dm`,
                { message: parsed.message },
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
