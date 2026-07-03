import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createLabLinkTool = {
    name: 'create_lab_link',
    description: "Cree un lien sidebar custom (label + url). Max 5 par Lab. Position ajoutee automatiquement a la fin.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            label: { type: 'string', maxLength: 30 },
            url: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'label', 'url'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), label: z.string().max(30), url: z.string().max(255) }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/links`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
