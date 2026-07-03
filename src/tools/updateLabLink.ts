import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLabLinkTool = {
    name: 'update_lab_link',
    description: "Met a jour un lien sidebar (label ou url). Champs optionnels.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            link_id: { type: 'number' },
            label: { type: 'string', maxLength: 30 },
            url: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'link_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        link_id: z.number().int().positive(),
        label: z.string().max(30).optional(),
        url: z.string().max(255).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, link_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/links/${link_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
