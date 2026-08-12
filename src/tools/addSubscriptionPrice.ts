/**
 * Tool `add_subscription_price` — ajoute un prix d'abonnement mensuel a un Lab
 * (et le rend courant). Le Lab doit etre prive.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const addSubscriptionPriceTool = {
    name: 'add_subscription_price',
    description: "Ajoute un tier de prix d'abonnement mensuel a un Lab et le rend courant. amount en euros (0 = repasse gratuit). Le Lab doit etre prive ; un amount > 0 exige que l'owner ait configure Stripe Connect (sinon erreur). IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            amount: { type: 'number', minimum: 0, description: "Prix mensuel en euros (ex 29.90)" },
        },
        required: ['lab', 'amount'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        amount: z.number().min(0),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/prices`, { amount: p.amount });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
