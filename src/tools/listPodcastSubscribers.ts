import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPodcastSubscribersTool = {
    name: 'list_podcast_subscribers',
    description: "Liste les abonnes premium podcast d'un Lab (1 abo debloque tous les shows).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            limit: { type: 'number', minimum: 1, maximum: 200 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), limit: z.number().int().min(1).max(200).optional() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/podcast/subscribers`, { params: { limit: p.limit } }); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
