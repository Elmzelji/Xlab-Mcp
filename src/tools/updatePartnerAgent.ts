/**
 * Tool `update_partner_agent` — modifie la page de vente d'un agent partenaire.
 * Scope : partner_agents.write. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';
import { partnerAgentProperties, partnerAgentZod } from './partnerAgentFields.js';

export const updatePartnerAgentTool = {
    name: 'update_partner_agent',
    description: "Modifie un agent partenaire du Lab officiel : n'envoyer que les champs a changer, les autres gardent leur valeur (textes, image, lien d'affiliation, texte du bouton, prix affiche, type de page). Pour publier ou masquer : set_partner_agent_published.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            agent_id: { type: 'number', description: 'id de l agent partenaire (list_partner_agents)' },
            ...partnerAgentProperties,
        },
        required: ['lab', 'agent_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        agent_id: z.number().int().min(1),
        title: partnerAgentZod.title.optional(),
        short_description: partnerAgentZod.short_description.optional(),
        description: partnerAgentZod.description.optional(),
        call_to_action_text: partnerAgentZod.call_to_action_text.optional(),
        shop_image: partnerAgentZod.shop_image.optional(),
        icon: partnerAgentZod.icon.optional(),
        affiliate_url: partnerAgentZod.affiliate_url.optional(),
        pricing_label: partnerAgentZod.pricing_label.optional(),
        landing_template: partnerAgentZod.landing_template.optional(),
        landing_external_url: partnerAgentZod.landing_external_url.optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, agent_id, ...body } = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/partner-agents/${agent_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
