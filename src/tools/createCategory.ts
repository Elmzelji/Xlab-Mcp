import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createCategoryTool = {
    name: 'create_category',
    description: "Cree une categorie pour classer les posts du Lab. is_private cache la categorie aux non-abonnes payants.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', maxLength: 30 },
            description: { type: 'string', maxLength: 255 },
            is_private: { type: 'boolean' },
            min_user_level: { type: 'number', minimum: 0 },
        },
        required: ['lab', 'name', 'description'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().max(30),
        description: z.string().max(255),
        is_private: z.boolean().optional(),
        min_user_level: z.number().int().min(0).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/categories`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
