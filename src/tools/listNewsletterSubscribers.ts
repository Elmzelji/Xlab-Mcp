import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listNewsletterSubscribersTool = {
    name: 'list_newsletter_subscribers',
    description: "Liste les abonnes de la newsletter du Lab. Filtrable par access (free / premium).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            plan: { type: 'string', enum: ['free', 'monthly', 'yearly', 'lab_member'] },
            limit: { type: 'number', minimum: 1, maximum: 200 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        plan: z.enum(['free', 'monthly', 'yearly', 'lab_member']).optional(),
        limit: z.number().int().min(1).max(200).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/subscribers`, { params: { plan: p.plan, limit: p.limit } }); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
