import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const addCommentTool = {
    name: 'add_comment',
    description: "Ajoute un commentaire a un post au nom de l'owner (le token).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            post_id: { type: 'number' },
            body: { type: 'string', description: 'Contenu du commentaire (max 5000 car)' },
        },
        required: ['lab', 'post_id', 'body'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        post_id: z.number().int().positive(),
        body: z.string().min(1).max(5000),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/posts/${parsed.post_id}/comments`,
                { body: parsed.body },
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
