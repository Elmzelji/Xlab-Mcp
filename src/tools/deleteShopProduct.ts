import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteShopProductTool = {
    name: 'delete_shop_product',
    description: "Supprime un produit de la boutique. IMPORTANT : action destructive, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, shop_id: { type: 'number' } },
        required: ['lab', 'shop_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), shop_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/shops/${p.shop_id}`); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
