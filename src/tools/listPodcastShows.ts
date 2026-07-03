import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPodcastShowsTool = {
    name: 'list_podcast_shows',
    description: "Liste les shows podcast d'un Lab (Podcast Studio, modele multi-shows).",
    inputSchema: { type: 'object' as const, properties: { lab: { type: 'string' } }, required: ['lab'], additionalProperties: false },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/podcast/shows`); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
