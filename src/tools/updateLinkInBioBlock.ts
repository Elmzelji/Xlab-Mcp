/**
 * Tool `update_link_in_bio_block` — modifie un bloc existant. Tous les champs
 * sont optionnels : seuls ceux fournis sont modifies.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLinkInBioBlockTool = {
    name: 'update_link_in_bio_block',
    description:
        "Modifie un bloc existant (identifie par block_id, entier renvoye par get_link_in_bio ou create_link_in_bio_block). Champs modifiables : title, subtitle, action_url, image_url, is_active (afficher/masquer sans supprimer).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            block_id: { type: 'number', minimum: 1 },
            title: { type: 'string', maxLength: 60 },
            subtitle: { type: 'string', maxLength: 120 },
            action_url: { type: 'string' },
            image_url: { type: 'string' },
            is_active: { type: 'boolean' },
        },
        required: ['lab', 'block_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        block_id: z.number().int().positive(),
        title: z.string().max(60).optional(),
        subtitle: z.string().max(120).optional(),
        action_url: z.string().optional(),
        image_url: z.string().optional(),
        is_active: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, block_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/link-in-bio/blocks/${block_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
