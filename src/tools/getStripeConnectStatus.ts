/**
 * Tool `get_stripe_connect_status` — introspecte le compte Stripe Connect de
 * l'owner du Lab. Utile pour verifier si l'owner peut vendre (charges_enabled)
 * ou s'il doit finir sa configuration.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getStripeConnectStatusTool = {
    name: 'get_stripe_connect_status',
    description:
        "Etat du compte Stripe Connect de l'owner du Lab (encaissement des ventes). Renvoie can_sell (bool), charges_enabled, has_account, requirements_due[]. Passer refresh=true force un rafraichissement depuis Stripe (utile juste apres onboarding). Le super admin plateforme retourne is_platform_owner=true (encaissement direct, pas de Connect).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            refresh: { type: 'boolean', description: 'Force un round-trip Stripe pour synchroniser (defaut false)' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), refresh: z.boolean().optional() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const qs = parsed.refresh ? '?refresh=1' : '';
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/payments/stripe-status${qs}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
