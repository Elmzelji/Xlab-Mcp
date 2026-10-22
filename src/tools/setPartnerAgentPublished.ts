/**
 * Tool `set_partner_agent_published` — publie ou masque un agent partenaire.
 * Scope : partner_agents.write. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setPartnerAgentPublishedTool = {
    name: 'set_partner_agent_published',
    description: "Publie (published=true) ou masque (false) un agent partenaire sur la marketplace. Action visible publiquement : la faire confirmer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            agent_id: { type: 'number', description: 'id de l agent partenaire (list_partner_agents)' },
            published: { type: 'boolean' },
        },
        required: ['lab', 'agent_id', 'published'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        agent_id: z.number().int().min(1),
        published: z.boolean(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/partner-agents/${p.agent_id}/published`, { published: p.published });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
