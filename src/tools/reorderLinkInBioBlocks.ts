/**
 * Tool `reorder_link_in_bio_blocks` — reordonne les blocs. Passer la liste
 * complete des block_ids dans l'ordre voulu (top → bottom).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const reorderLinkInBioBlocksTool = {
    name: 'reorder_link_in_bio_blocks',
    description:
        "Reordonne les blocs de la page Link in Bio. Passer la liste complete des block_ids dans l'ordre souhaite (premier = top de la page). Le back rejette si la liste ne matche pas exactement les blocs existants.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            block_ids: {
                type: 'array',
                items: { type: 'number', minimum: 1 },
                minItems: 1,
            },
        },
        required: ['lab', 'block_ids'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        block_ids: z.array(z.number().int().positive()).min(1),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/link-in-bio/blocks/reorder`,
                { block_ids: parsed.block_ids }
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
