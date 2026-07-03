import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPodcastEpisodesTool = {
    name: 'list_podcast_episodes',
    description: "Liste les episodes d'un show podcast (drafts + publies). show_id vient de list_podcast_shows.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            show_id: { type: 'number' },
            limit: { type: 'number', minimum: 1, maximum: 100 },
        },
        required: ['lab', 'show_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        show_id: z.number().int().positive(),
        limit: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/podcast/shows/${p.show_id}/episodes`, { params: { limit: p.limit } }); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
