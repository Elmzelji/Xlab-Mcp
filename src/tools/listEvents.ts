import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listEventsTool = {
    name: 'list_events',
    description: "Liste les evenements d'un Lab. upcoming_only=true pour ne renvoyer que les evenements futurs.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            upcoming_only: { type: 'boolean', default: false },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        upcoming_only: z.boolean().optional(),
        limit: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/events`, {
                params: { upcoming_only: parsed.upcoming_only ? '1' : undefined, limit: parsed.limit },
            });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
