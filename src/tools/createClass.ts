import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createClassTool = {
    name: 'create_class',
    description: "Cree une classe/cours dans un Lab. name max 50 car, description max 400 car.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', description: 'Titre de la classe (max 50 car)' },
            description: { type: 'string', description: 'Description (max 400 car)' },
            access: { type: 'string', description: "Type d'acces (ex: 'all', 'ONLY'). Defaut 'all'." },
            min_user_level: { type: 'number', description: 'Niveau membre requis (optionnel)' },
            is_published: { type: 'boolean', default: false },
        },
        required: ['lab', 'name', 'description'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().max(50),
        description: z.string().max(400),
        access: z.string().optional(),
        min_user_level: z.number().int().min(0).optional(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(parsed.lab)}/classes`, parsed);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
