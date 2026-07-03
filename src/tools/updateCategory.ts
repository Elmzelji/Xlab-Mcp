import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCategoryTool = {
    name: 'update_category',
    description: "Met a jour une categorie (nom, description, privee, niveau min). Champs optionnels.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            category_id: { type: 'number' },
            name: { type: 'string', maxLength: 30 },
            description: { type: 'string', maxLength: 255 },
            is_private: { type: 'boolean' },
            min_user_level: { type: 'number', minimum: 0 },
        },
        required: ['lab', 'category_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        category_id: z.number().int().positive(),
        name: z.string().max(30).optional(),
        description: z.string().max(255).optional(),
        is_private: z.boolean().optional(),
        min_user_level: z.number().int().min(0).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, category_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/categories/${category_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
