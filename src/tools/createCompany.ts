/**
 * Tool `create_company` — cree une societe dans le Marketplace d'un Lab.
 * Logo / banniere = fichiers, a uploader ensuite via le front.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createCompanyTool = {
    name: 'create_company',
    description: "Cree une societe dans le Marketplace du Lab (annuaire de mentors/partenaires). Logo et banniere non geres par MCP — a uploader ensuite via le front. Necessite une categorie valide (list_company_categories).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', maxLength: 255 },
            website: { type: 'string', description: 'URL du site (https://...)' },
            description: { type: 'string' },
            short_description: { type: 'string' },
            cta_link: { type: 'string', description: 'URL du bouton CTA (https://...)' },
            text_cta: { type: 'string', maxLength: 255, description: 'Libelle du bouton CTA (optionnel)' },
            color: { type: 'string', description: 'Couleur de fond hex (optionnel, defaut #5A6BE3)' },
            company_category_id: { type: 'number', description: "Id d'une categorie Marketplace (list_company_categories)" },
        },
        required: ['lab', 'name', 'website', 'description', 'short_description', 'cta_link', 'company_category_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().min(1).max(255),
        website: z.string().url(),
        description: z.string().min(1),
        short_description: z.string().min(1),
        cta_link: z.string().url(),
        text_cta: z.string().max(255).optional(),
        color: z.string().max(20).optional(),
        company_category_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/companies`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
