import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const publishPodcastEpisodeTool = {
    name: 'publish_podcast_episode',
    description: "Publie un episode podcast (draft -> published + published_at=now). Rendu accessible aux membres/abonnes.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            show_id: { type: 'number' },
            episode_id: { type: 'number' },
        },
        required: ['lab', 'show_id', 'episode_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        show_id: z.number().int().positive(),
        episode_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.patch(`/mcp/labs/${encodeURIComponent(p.lab)}/podcast/shows/${p.show_id}/episodes/${p.episode_id}/publish`); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
