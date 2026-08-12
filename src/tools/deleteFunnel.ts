/**
 * Tool `delete_funnel` — supprime le tunnel de vente d'un produit (et ses items).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteFunnelTool = {
    name: 'delete_funnel',
    description: "Supprime un tunnel de vente et tous ses items (order bump / upsell / downsell). funnel_id vient de get_funnel. IMPORTANT : action destructive, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            funnel_id: { type: 'number' },
        },
        required: ['lab', 'funnel_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), funnel_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/funnels/${p.funnel_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
