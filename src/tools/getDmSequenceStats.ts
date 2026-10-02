/**
 * Tool `get_dm_sequence_stats` — statistiques d'une sequence DM.
 * Scope : dm_sequences.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getDmSequenceStatsTool = {
    name: 'get_dm_sequence_stats',
    description: "Statistiques d'une sequence DM (inscrits, envois, reponses, objectifs atteints) sur une periode optionnelle from / to (YYYY-MM-DD).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1, description: 'id de la sequence (list_dm_sequences)' },
            from: { type: 'string', description: 'YYYY-MM-DD' },
            to: { type: 'string', description: 'YYYY-MM-DD' },
        },
        required: ['lab', 'sequence_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().positive(),
        from: z.string().nullable().optional(),
        to: z.string().nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { from, to } = p;
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences/${p.sequence_id}/stats`, { params: { from, to } });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
