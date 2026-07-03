import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateClassTool = {
    name: 'update_class',
    description: "Met a jour une classe/cours (nom, description, publication, prix, niveau min). Champs optionnels : n'envoie que ceux que tu veux changer. Toggle is_published pour publier/depublier.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            class_id: { type: 'number' },
            name: { type: 'string', maxLength: 50 },
            description: { type: 'string', maxLength: 400 },
            access: { type: 'string', maxLength: 255, description: "'all' | 'paid' | autre valeur libre" },
            min_user_level: { type: 'number', minimum: 0 },
            is_published: { type: 'boolean' },
            price: { type: 'string', description: "Prix en euros (chaine, ex '19.90'). null pour gratuit." },
        },
        required: ['lab', 'class_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        class_id: z.number().int().positive(),
        name: z.string().max(50).optional(),
        description: z.string().max(400).optional(),
        access: z.string().max(255).optional(),
        min_user_level: z.number().int().min(0).nullable().optional(),
        is_published: z.boolean().optional(),
        price: z.string().max(255).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, class_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/classes/${class_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
