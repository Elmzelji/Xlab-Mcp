import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listCommentsTool = {
    name: 'list_comments',
    description: "Liste les commentaires d'un post (chronologique, plus vieux d'abord).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            post_id: { type: 'number' },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 30 },
        },
        required: ['lab', 'post_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        post_id: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/posts/${parsed.post_id}/comments`,
                { params: { limit: parsed.limit } },
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
