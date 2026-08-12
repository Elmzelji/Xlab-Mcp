/**
 * Tool `update_company` — modifie une societe du Marketplace (par uuid).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCompanyTool = {
    name: 'update_company',
    description: "Modifie une societe du Marketplace (identifiee par son uuid, cf list_companies). Champs optionnels : n'envoie que ce qui change. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            uuid: { type: 'string', description: 'uuid de la societe (list_companies)' },
            name: { type: 'string', maxLength: 255 },
            website: { type: 'string' },
            description: { type: 'string' },
            short_description: { type: 'string' },
            cta_link: { type: 'string' },
            text_cta: { type: 'string', maxLength: 255 },
            color: { type: 'string' },
            company_category_id: { type: 'number', description: 'Nouvelle categorie (list_company_categories)' },
        },
        required: ['lab', 'uuid'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        uuid: z.string(),
        name: z.string().max(255).optional(),
        website: z.string().url().optional(),
        description: z.string().optional(),
        short_description: z.string().optional(),
        cta_link: z.string().url().optional(),
        text_cta: z.string().max(255).nullable().optional(),
        color: z.string().max(20).optional(),
        company_category_id: z.number().int().positive().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, uuid, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/companies/${encodeURIComponent(uuid)}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
