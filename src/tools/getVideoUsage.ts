import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getVideoUsageTool = {
    name: 'get_video_usage',
    description: "Videos hebergees du Lab (lecture seule) : heures regardees ce mois-ci, heures offertes (300 h/mois) et utilisees, heures restantes dans les packs, pourcentage, pause des lectures, stockage utilise / limite, historique des packs. L'achat d'un pack se fait dans l'app.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/video-usage`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};