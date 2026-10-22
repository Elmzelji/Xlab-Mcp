/**
 * Tool `check_partner_agent_links` — verifie que des liens repondent.
 * Scope : partner_agents.read. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const checkPartnerAgentLinksTool = {
    name: 'check_partner_agent_links',
    description: "Verifie que le lien d'affiliation et/ou le site de l'editeur repondent avant de les enregistrer. Simple avertissement : certains sites bloquent les verifications.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            affiliate: { type: 'string', description: "Lien d'affiliation (https://)" },
            landing: { type: 'string', description: "Site de l'editeur (https://)" },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        affiliate: z.string().max(2000).optional(),
        landing: z.string().max(2000).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, affiliate, landing } = this.zodSchema.parse(args);
        const urls: Record<string, string> = {};
        if (affiliate) urls.affiliate = affiliate;
        if (landing) urls.landing = landing;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/partner-agents/check-links`, { urls });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
