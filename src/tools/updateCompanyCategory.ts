/**
 * Tool `update_company_category` — renomme une categorie Marketplace.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCompanyCategoryTool = {
    name: 'update_company_category',
    description: "Renomme une categorie du Marketplace (identifiee par son id, cf list_company_categories).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            category_id: { type: 'number', description: 'Id de la categorie (list_company_categories)' },
            name: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'category_id', 'name'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        category_id: z.number().int().positive(),
        name: z.string().min(1).max(255),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/company-categories/${parsed.category_id}`, { name: parsed.name });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
