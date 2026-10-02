/**
 * Tool `set_dm_sequence_status` — publie / met en pause / archive une sequence DM.
 * Scope : dm_sequences.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setDmSequenceStatusTool = {
    name: 'set_dm_sequence_status',
    description: "Change l'etat d'une sequence : publish (met le brouillon en ligne : les membres concernes commencent a recevoir les DM), pause, archive (definitif). Demander confirmation a l'owner avant publish.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1, description: 'id de la sequence (list_dm_sequences)' },
            action: { type: 'string', enum: ['publish', 'pause', 'archive'] },
        },
        required: ['lab', 'sequence_id', 'action'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().positive(),
        action: z.enum(['publish', 'pause', 'archive']),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, sequence_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, sequence_id };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences/${p.sequence_id}/status`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
