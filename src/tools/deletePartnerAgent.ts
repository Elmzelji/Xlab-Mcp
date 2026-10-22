/**
 * Tool `delete_partner_agent` — supprime un agent partenaire et ses statistiques.
 * Scope : partner_agents.write. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deletePartnerAgentTool = {
    name: 'delete_partner_agent',
    description: "Supprime definitivement un agent partenaire (carte, page de vente, vues et clics). Irreversible : la faire confirmer. Pour le retirer temporairement : set_partner_agent_published false.",
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
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/partner-agents/${p.agent_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
