import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createPodcastEpisodeTool = {
    name: 'create_podcast_episode',
    description: "Cree un episode (draft) dans un show. Audio a uploader ensuite via le front. Numero d'episode assigne automatiquement.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            show_id: { type: 'number' },
            title: { type: 'string', maxLength: 255 },
            description: { type: 'string' },
            access: { type: 'string', enum: ['free', 'premium'] },
            season: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'show_id', 'title'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        show_id: z.number().int().positive(),
        title: z.string().max(255),
        description: z.string().nullable().optional(),
        access: z.enum(['free', 'premium']).optional(),
        season: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, show_id, ...body } = p;
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/podcast/shows/${show_id}/episodes`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
