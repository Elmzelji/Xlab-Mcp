/**
 * Tool `create_dm_sequence` — cree une sequence DM (brouillon).
 * Scope : dm_sequences.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createDmSequenceTool = {
    name: 'create_dm_sequence',
    description: "Cree une sequence DM en brouillon. template = welcome (declenchee a l'arrivee d'un nouveau membre) ou keyword (declenchee quand un membre commente un mot-cle sous une publication). Configurer ensuite avec update_dm_sequence puis publier avec set_dm_sequence_status.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            name: { type: 'string', maxLength: 120 },
            template: { type: 'string', enum: ['welcome', 'keyword'] },
        },
        required: ['lab', 'name', 'template'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().max(120),
        template: z.enum(['welcome', 'keyword']),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
