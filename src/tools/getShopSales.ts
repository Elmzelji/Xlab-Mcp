/**
 * Tool `get_shop_sales` — historique de ventes d'un produit boutique.
 * shop_url s'obtient via list_shops.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getShopSalesTool = {
    name: 'get_shop_sales',
    description: "Historique de ventes d'un produit boutique. shop_url s'obtient via list_shops. Renvoie chaque vente (acheteur, gross, net owner, frais) + total net.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            shop_url: { type: 'string', description: 'shop_url du produit (list_shops)' },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
        },
        required: ['lab', 'shop_url'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        shop_url: z.string(),
        limit: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/shops/${encodeURIComponent(parsed.shop_url)}/sales`,
                { params: { limit: parsed.limit } },
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
