/**
 * Tool `update_link_in_bio_block` — modifie un bloc existant. Tous les champs
 * sont optionnels : seuls ceux fournis sont modifies (l'API complete le reste
 * avec les valeurs actuelles du bloc).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLinkInBioBlockTool = {
    name: 'update_link_in_bio_block',
    description:
        "Modifie un bloc existant (identifie par block_id, entier renvoye par get_link_in_bio ou create_link_in_bio_block). Seuls les champs fournis changent : title, subtitle, url (bloc externe), image_url, quiz_id (bloc quiz), lab_group_id (bloc Lab), is_active (afficher/masquer sans supprimer). Le type (kind) d'un bloc ne change pas.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            block_id: { type: 'number', minimum: 1 },
            title: { type: 'string', maxLength: 200 },
            subtitle: { type: 'string', maxLength: 300 },
            url: { type: 'string' },
            image_url: { type: 'string' },
            quiz_id: { type: 'number', minimum: 1 },
            lab_group_id: { type: 'number', minimum: 1 },
            is_active: { type: 'boolean' },
        },
        required: ['lab', 'block_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        block_id: z.number().int().positive(),
        title: z.string().max(200).optional(),
        subtitle: z.string().max(300).optional(),
        url: z.string().optional(),
        image_url: z.string().optional(),
        quiz_id: z.number().int().positive().optional(),
        lab_group_id: z.number().int().positive().optional(),
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
