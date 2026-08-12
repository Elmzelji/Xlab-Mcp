/**
 * Tool `create_funnel` — cree (ou met a jour) le tunnel de vente d'un produit.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SELLABLE_TYPES = ['agent_ai', 'group_shop', 'course', 'newsletter', 'podcast_show', 'lab_channel'] as const;

export const createFunnelTool = {
    name: 'create_funnel',
    description: "Cree (ou recupere) le tunnel de vente d'un produit vendable. 1 seul funnel par produit. Passe is_active pour l'activer. Ajoute ensuite des order bump / upsell / downsell via set_funnel_item.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            sellable_type: { type: 'string', enum: [...SELLABLE_TYPES], description: 'Type du produit principal' },
            sellable_id: { type: 'number', description: 'Id du produit principal' },
            name: { type: 'string', maxLength: 120, description: 'Nom du tunnel (interne)' },
            is_active: { type: 'boolean', description: 'Active le tunnel' },
        },
        required: ['lab', 'sellable_type', 'sellable_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sellable_type: z.enum(SELLABLE_TYPES),
        sellable_id: z.number().int().positive(),
        name: z.string().max(120).nullable().optional(),
        is_active: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/funnels`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
