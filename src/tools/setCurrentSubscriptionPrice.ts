/**
 * Tool `set_current_subscription_price` — choisit le prix courant d'un Lab
 * parmi ses tiers, ou repasse le Lab en gratuit.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setCurrentSubscriptionPriceTool = {
    name: 'set_current_subscription_price',
    description: "Definit le prix d'abonnement courant d'un Lab parmi ses tiers existants (price_id, cf get_subscription_settings). Omets price_id (ou passe null) pour desactiver tous les prix et repasser le Lab en gratuit. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            price_id: { type: ['number', 'null'], description: "Id du tier a rendre courant (get_subscription_settings). null = repasse gratuit." },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        price_id: z.number().int().positive().nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const body = { price_id: p.price_id ?? null };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/prices/set-current`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
