/**
 * Tool `list_funnel_offers` — liste les produits d'un Lab utilisables comme
 * order bump / upsell / downsell dans un tunnel de vente.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listFunnelOffersTool = {
    name: 'list_funnel_offers',
    description: "Liste les produits vendables du Lab utilisables comme order bump / upsell / downsell (agents IA payants, produits boutique Stripe, canaux payants, newsletters et podcasts premium). Renvoie type, id, titre, prix, kind (one_shot / recurring_monthly). Utilise-le pour recuperer offer_type + offer_id avant set_funnel_item.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/funnels/offers`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
