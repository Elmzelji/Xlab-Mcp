/**
 * Tool `list_company_categories` — liste les categories du Marketplace d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listCompanyCategoriesTool = {
    name: 'list_company_categories',
    description: "Liste les categories du Marketplace d'un Lab (utilisees pour classer les societes). Renvoie id + nom. Recupere l'id ici avant create_company / list_companies.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/company-categories`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
