/**
 * Tool `get_lab_affiliation_config` — lit la config du programme d'affiliation
 * au niveau du Lab entier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getLabAffiliationConfigTool = {
    name: 'get_lab_affiliation_config',
    description: "Lit la config du programme d'affiliation au niveau du Lab entier : statut (actif ?), pourcentage, scopes (paiements one-shot / abonnement lab / abonnement interne), visibilite du badge, part plateforme.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/lab/config`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
