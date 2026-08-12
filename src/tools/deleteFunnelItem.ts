/**
 * Tool `delete_funnel_item` — supprime un item d'un tunnel (bump/upsell/downsell).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteFunnelItemTool = {
    name: 'delete_funnel_item',
    description: "Supprime un item de tunnel (order bump / upsell / downsell). item_id vient de get_funnel. IMPORTANT : demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            funnel_id: { type: 'number' },
            item_id: { type: 'number' },
        },
        required: ['lab', 'funnel_id', 'item_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        funnel_id: z.number().int().positive(),
        item_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/funnels/${p.funnel_id}/items/${p.item_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
