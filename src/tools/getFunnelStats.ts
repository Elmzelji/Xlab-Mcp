/**
 * Tool `get_funnel_stats` — stats de conversion d'un tunnel par kind.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getFunnelStatsTool = {
    name: 'get_funnel_stats',
    description: "Stats d'un tunnel de vente par kind (order_bump / upsell / downsell) sur les N derniers jours : vues (approx), acceptations, revenu genere. funnel_id vient de get_funnel.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            funnel_id: { type: 'number' },
            days: { type: 'number', minimum: 1, maximum: 365, description: 'Fenetre en jours (defaut 30)' },
        },
        required: ['lab', 'funnel_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        funnel_id: z.number().int().positive(),
        days: z.number().int().min(1).max(365).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const query = p.days !== undefined ? `?days=${p.days}` : '';
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/funnels/${p.funnel_id}/stats${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
