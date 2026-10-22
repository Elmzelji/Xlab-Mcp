/**
 * Tool `get_partner_agent` — detail d'un agent partenaire (page de vente complete).
 * Scope : partner_agents.read. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getPartnerAgentTool = {
    name: 'get_partner_agent',
    description: "Detail d'un agent partenaire du Lab officiel : textes de la page de vente (description HTML comprise), image, lien d'affiliation, texte du bouton, prix affiche, publication et liens suivis (page de vente, affiliation).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            agent_id: { type: 'number', description: 'id de l agent partenaire (list_partner_agents)' },
        },
        required: ['lab', 'agent_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        agent_id: z.number().int().min(1),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/partner-agents/${p.agent_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
