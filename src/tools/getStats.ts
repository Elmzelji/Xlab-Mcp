import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getStatsTool = {
    name: 'get_stats',
    description: "Snapshot dashboard d'un Lab en un seul appel : membres (total/pending/approved/admins/joined 7j), contenu (posts/comments/classes/upcoming events), revenus (MTD/all-time). Tool prefere si l'user demande 'ou j'en suis avec mon Lab' ou 'comment ca va'.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' } },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/stats`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
