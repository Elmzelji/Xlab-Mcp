/**
 * Tool `create_partner_agent` — cree un agent partenaire et sa page de vente.
 * Scope : partner_agents.write. Super admin, Lab officiel uniquement.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';
import { partnerAgentProperties, partnerAgentZod } from './partnerAgentFields.js';

export const createPartnerAgentTool = {
    name: 'create_partner_agent',
    description: "Cree un agent partenaire dans le Lab officiel XLab : carte marketplace + page de vente dont les boutons menent au lien d'affiliation (suivi des vues et clics). Jamais propose en tunnel de vente, sans abonnement XLab. Publie par defaut (published=false pour le garder masque). Action visible publiquement : la faire confirmer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab officiel XLab' },
            ...partnerAgentProperties,
            published: { type: 'boolean', description: 'Visible sur la marketplace (defaut true)' },
        },
        required: ['lab', 'title', 'short_description', 'call_to_action_text', 'shop_image', 'affiliate_url'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: partnerAgentZod.title,
        short_description: partnerAgentZod.short_description,
        description: partnerAgentZod.description.optional(),
        call_to_action_text: partnerAgentZod.call_to_action_text,
        shop_image: partnerAgentZod.shop_image,
        icon: partnerAgentZod.icon.optional(),
        affiliate_url: partnerAgentZod.affiliate_url,
        pricing_label: partnerAgentZod.pricing_label.optional(),
        landing_template: partnerAgentZod.landing_template.optional(),
        landing_external_url: partnerAgentZod.landing_external_url.optional(),
        published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/partner-agents`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
