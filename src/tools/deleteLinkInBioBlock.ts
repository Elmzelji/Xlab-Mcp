/**
 * Tool `delete_link_in_bio_block` — supprime definitivement un bloc de la
 * page. Pour masquer sans supprimer, utiliser plutot update_link_in_bio_block
 * avec is_active=false.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteLinkInBioBlockTool = {
    name: 'delete_link_in_bio_block',
    description:
        "Supprime definitivement un bloc de la page Link in Bio. Pour un masquage temporaire, prefere update_link_in_bio_block avec is_active=false.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            block_id: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'block_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), block_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/link-in-bio/blocks/${parsed.block_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
