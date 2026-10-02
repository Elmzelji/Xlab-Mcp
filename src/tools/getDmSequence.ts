/**
 * Tool `get_dm_sequence` — detail d'une sequence DM.
 * Scope : dm_sequences.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getDmSequenceTool = {
    name: 'get_dm_sequence',
    description: "Detail d'une sequence DM : version en ligne (live_version) et brouillon (draft) avec trigger, goal, config, steps et revision.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1, description: 'id de la sequence (list_dm_sequences)' },
        },
        required: ['lab', 'sequence_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences/${p.sequence_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
