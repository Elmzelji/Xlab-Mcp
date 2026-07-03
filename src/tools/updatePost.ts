import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updatePostTool = {
    name: 'update_post',
    description: "Modifie un post existant (titre / corps / categorie). Champs optionnels : n'envoie que ce que tu veux changer. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            post_id: { type: 'number' },
            title: { type: 'string', maxLength: 255 },
            body: { type: 'string' },
            category_id: { type: 'number' },
        },
        required: ['lab', 'post_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        post_id: z.number().int().positive(),
        title: z.string().max(255).optional(),
        body: z.string().optional(),
        category_id: z.number().int().positive().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, post_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/posts/${post_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
