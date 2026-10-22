/**
 * Tool `get_partner_agent_stats` — vues et clics d'un agent partenaire, jour par jour.
 * Scope : partner_agents.read. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getPartnerAgentStatsTool = {
    name: 'get_partner_agent_stats',
    description: "Vues de la page de vente et clics vers le lien d'affiliation d'un agent partenaire, jour par jour. period : today, 7d, 30d (defaut) ou custom avec from / to (YYYY-MM-DD, 366 jours max).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            agent_id: { type: 'number', description: 'id de l agent partenaire (list_partner_agents)' },
            period: { type: 'string', enum: ['today', '7d', '30d', 'custom'] },
            from: { type: 'string', description: 'YYYY-MM-DD (period=custom)' },
            to: { type: 'string', description: 'YYYY-MM-DD (period=custom)' },
        },
        required: ['lab', 'agent_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        agent_id: z.number().int().min(1),
        period: z.enum(['today', '7d', '30d', 'custom']).optional(),
        from: z.string().optional(),
        to: z.string().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, agent_id, ...params } = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(lab)}/partner-agents/${agent_id}/stats`, { params });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
