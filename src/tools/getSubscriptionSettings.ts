/**
 * Tool `get_subscription_settings` — prix d'abonnement, gratuit/payant et essai
 * d'un Lab (onglet Abonnements, dispo quand le Lab est prive + payant).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getSubscriptionSettingsTool = {
    name: 'get_subscription_settings',
    description: "Lit les reglages d'abonnement d'un Lab : gratuit ou payant, prive/public, prix courant, la liste des tiers de prix (avec nb de membres + lequel est courant) et la periode d'essai (activee ? nb de jours).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
