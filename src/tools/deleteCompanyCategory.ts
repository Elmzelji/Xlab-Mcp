/**
 * Tool `delete_company_category` — supprime une categorie Marketplace.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteCompanyCategoryTool = {
    name: 'delete_company_category',
    description: "Supprime une categorie du Marketplace (par id, cf list_company_categories). Les societes de cette categorie perdent la reference. IMPORTANT : demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            category_id: { type: 'number', description: 'Id de la categorie (list_company_categories)' },
        },
        required: ['lab', 'category_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), category_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/company-categories/${parsed.category_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
