import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deletePostTool = {
    name: 'delete_post',
    description: "Supprime un post (soft-delete). IMPORTANT : action destructive, demander confirmation avant d'invoquer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            post_id: { type: 'number' },
        },
        required: ['lab', 'post_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), post_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/posts/${parsed.post_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
