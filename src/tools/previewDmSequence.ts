/**
 * Tool `preview_dm_sequence` — previsualise les messages d'une sequence.
 * Scope : dm_sequences.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const previewDmSequenceTool = {
    name: 'preview_dm_sequence',
    description: "Rend les messages avec un membre fictif (n'envoie rien) et signale les erreurs de template. steps = [{body_template}].",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1, description: 'id de la sequence (list_dm_sequences)' },
            steps: { type: 'array', minItems: 1, items: { type: 'object', properties: { body_template: { type: 'string' } }, required: ['body_template'] } },
            link_url: { type: 'string', maxLength: 500 },
            first_name: { type: 'string', maxLength: 50 },
        },
        required: ['lab', 'sequence_id', 'steps'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().positive(),
        steps: z.array(z.object({ body_template: z.string() })).min(1),
        link_url: z.string().max(500).nullable().optional(),
        first_name: z.string().max(50).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, sequence_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, sequence_id };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences/${p.sequence_id}/preview`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
