/**
 * Tool `get_product_affiliation_config` — lit la config d'affiliation d'un
 * produit (boutique ou agent IA).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const PRODUCT_TYPES = ['shop_product', 'agent_ai'] as const;

export const getProductAffiliationConfigTool = {
    name: 'get_product_affiliation_config',
    description: "Lit la config d'affiliation d'un produit (boutique ou agent IA custom) : activee ?, pourcentage, visibilite (qui peut s'affilier), part plateforme. product_type = shop_product | agent_ai, product_id = id du produit.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            product_type: { type: 'string', enum: [...PRODUCT_TYPES] },
            product_id: { type: 'number' },
        },
        required: ['lab', 'product_type', 'product_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        product_type: z.enum(PRODUCT_TYPES),
        product_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/products/${p.product_type}/${p.product_id}/config`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
