/**
 * Tool `get_funnel` — recupere le tunnel de vente attache a un produit.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SELLABLE_TYPES = ['agent_ai', 'group_shop', 'course', 'newsletter', 'podcast_show', 'lab_channel'] as const;

export const getFunnelTool = {
    name: 'get_funnel',
    description: "Recupere le tunnel de vente (order bump / upsell / downsell) attache a un produit vendable, avec ses items. Renvoie null si aucun funnel. sellable_type = type du produit principal, sellable_id = son id.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            sellable_type: { type: 'string', enum: [...SELLABLE_TYPES], description: 'Type du produit principal' },
            sellable_id: { type: 'number', description: 'Id du produit principal' },
        },
        required: ['lab', 'sellable_type', 'sellable_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sellable_type: z.enum(SELLABLE_TYPES),
        sellable_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/funnels/${p.sellable_type}/${p.sellable_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
