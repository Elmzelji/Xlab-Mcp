import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const pinPostTool = {
    name: 'pin_post',
    description: "Epingle ou desepingle un post du Lab. Passer pinned=false pour desepingler.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            post_id: { type: 'number' },
            pinned: { type: 'boolean', default: true, description: 'true pour epingler, false pour retirer' },
        },
        required: ['lab', 'post_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        post_id: z.number().int().positive(),
        pinned: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/posts/${parsed.post_id}/pin`,
                { pinned: parsed.pinned ?? true },
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
