import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const searchMembersTool = {
    name: 'search_members',
    description: "Recherche des membres du Lab par firstname/lastname/email (min 2 caracteres). Utile quand tu veux trouver un membre precis dans un Lab qui en a beaucoup.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            q: { type: 'string', description: 'Terme de recherche (min 2 car)' },
            limit: { type: 'number', minimum: 1, maximum: 50, default: 20 },
        },
        required: ['lab', 'q'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        q: z.string().min(2),
        limit: z.number().int().min(1).max(50).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/search`, {
                params: { q: parsed.q, limit: parsed.limit },
            });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
