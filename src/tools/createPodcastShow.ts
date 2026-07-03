import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createPodcastShowTool = {
    name: 'create_podcast_show',
    description: "Cree un nouveau show podcast dans le Lab (titre + description + auteur). Le slug est genere automatiquement.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string' },
            author_name: { type: 'string', maxLength: 191 },
        },
        required: ['lab', 'title'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().max(255),
        description: z.string().nullable().optional(),
        author_name: z.string().max(191).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/podcast/shows`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
