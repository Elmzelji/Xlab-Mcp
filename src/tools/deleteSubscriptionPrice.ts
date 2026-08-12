/**
 * Tool `delete_subscription_price` — supprime un tier de prix non courant.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteSubscriptionPriceTool = {
    name: 'delete_subscription_price',
    description: "Supprime un tier de prix d'abonnement NON courant (price_id, cf get_subscription_settings). Le prix courant ne peut pas etre supprime — definis un autre prix courant d'abord. IMPORTANT : demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            price_id: { type: 'number' },
        },
        required: ['lab', 'price_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), price_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/prices/${p.price_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
