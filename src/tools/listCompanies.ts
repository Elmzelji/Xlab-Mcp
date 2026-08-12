/**
 * Tool `list_companies` — liste les societes du Marketplace d'un Lab (annuaire
 * de mentors / partenaires). Distinct de la Boutique (list_shops).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listCompaniesTool = {
    name: 'list_companies',
    description: "Liste les societes du Marketplace d'un Lab (annuaire de mentors/partenaires) — distinct de la Boutique. Renvoie uuid, nom, description courte, site, CTA, categorie, position. Filtre optionnel par category_id (list_company_categories).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            category_id: { type: 'number', description: 'Optionnel — filtre par categorie Marketplace' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        category_id: z.number().int().positive().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const query = parsed.category_id !== undefined ? `?category_id=${parsed.category_id}` : '';
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/companies${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
