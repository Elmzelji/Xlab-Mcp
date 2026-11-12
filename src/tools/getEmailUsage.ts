import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getEmailUsageTool = {
    name: 'get_email_usage',
    description: "Quotas d'e-mails du Lab ce mois-ci (lecture seule), par usage (newsletter, posts, events) : offerts et restants, envoyes, packs actives ou non pour l'usage, total disponible, pourcentage, envois bloques ; plus les packs d'e-mails communs aux trois usages (restants, historique). 1 destinataire = 1 e-mail. L'achat d'un pack se fait dans l'app.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/email-usage`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};