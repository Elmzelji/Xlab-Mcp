/**
 * Tool `create_link_in_bio_block` — ajoute un bloc a la page :
 *  - kind=external  : lien URL libre (title + action_url obligatoires)
 *  - kind=product   : reference une offre du Lab (sellable_type + sellable_id)
 *  - kind=lab       : reference un autre Lab (sellable_type=lab + sellable_id)
 *
 * Position ajoutee automatiquement en fin de liste.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SELLABLE_TYPES = ['agent_ai', 'group_shop', 'newsletter', 'podcast_show', 'lab_channel'] as const;

export const createLinkInBioBlockTool = {
    name: 'create_link_in_bio_block',
    description:
        "Ajoute un bloc a la page Link in Bio. Trois types :\n" +
        "- kind=external : lien URL libre (title + action_url requis)\n" +
        "- kind=product : reference une offre du Lab (sellable_type + sellable_id requis, sellable_type dans agent_ai/group_shop/newsletter/podcast_show/lab_channel)\n" +
        "- kind=lab : reference un autre Lab de l'owner (sellable_id requis)\n" +
        "Champs optionnels : subtitle, image_url. Position en fin de liste (utiliser reorder pour changer).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            kind: { type: 'string', enum: ['external', 'product', 'lab'] },
            title: { type: 'string', maxLength: 60 },
            subtitle: { type: 'string', maxLength: 120 },
            action_url: { type: 'string' },
            image_url: { type: 'string' },
            sellable_type: { type: 'string', enum: [...SELLABLE_TYPES] },
            sellable_id: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'kind'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        kind: z.enum(['external', 'product', 'lab']),
        title: z.string().max(60).optional(),
        subtitle: z.string().max(120).optional(),
        action_url: z.string().optional(),
        image_url: z.string().optional(),
        sellable_type: z.enum(SELLABLE_TYPES).optional(),
        sellable_id: z.number().int().positive().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/link-in-bio/blocks`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
