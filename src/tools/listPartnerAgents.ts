/**
 * Tool `list_partner_agents` — agents partenaires du Lab officiel XLab.
 * Scope : partner_agents.read. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPartnerAgentsTool = {
    name: 'list_partner_agents',
    description: "Liste les agents partenaires (agents IA d'autres editeurs vendus via un lien d'affiliation) du Lab officiel XLab : titre, image, lien d'affiliation, prix affiche, publication, vues et clics sur 30 jours. Reserve au super admin, uniquement dans le Lab officiel.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/partner-agents`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
