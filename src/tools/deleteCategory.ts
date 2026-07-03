import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteCategoryTool = {
    name: 'delete_category',
    description: "Supprime une categorie du Lab. IMPORTANT : les posts existants perdent la reference. Demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            category_id: { type: 'number' },
        },
        required: ['lab', 'category_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), category_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/categories/${parsed.category_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
