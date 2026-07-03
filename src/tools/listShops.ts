/**
 * Tool `list_shops` — liste les produits/offres de la boutique d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listShopsTool = {
    name: 'list_shops',
    description: "Liste les produits/offres de la boutique d'un Lab. Renvoie id, shop_url, titre, description courte, offer_type (digital/calendar/etc), prix, publie/visible.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/shops`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
