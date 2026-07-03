import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteLabLinkTool = {
    name: 'delete_lab_link',
    description: "Supprime un lien sidebar du Lab.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            link_id: { type: 'number' },
        },
        required: ['lab', 'link_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), link_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/links/${parsed.link_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
