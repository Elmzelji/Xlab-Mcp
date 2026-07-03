import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setMetaPixelTool = {
    name: 'set_meta_pixel',
    description: "Configure le pixel Meta (Facebook/Instagram) sur le Lab : id du pixel + access token optionnel.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            meta_id: { type: 'string', description: 'Id du pixel Meta' },
            token: { type: 'string', description: 'Access token Meta (optionnel)' },
            enabled: { type: 'boolean' },
        },
        required: ['lab', 'meta_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        meta_id: z.string().max(255),
        token: z.string().nullable().optional(),
        enabled: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/plugins/meta-pixel`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
