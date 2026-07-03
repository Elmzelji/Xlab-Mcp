import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listNewsletterEditionsTool = {
    name: 'list_newsletter_editions',
    description: "Liste les editions de la newsletter du Lab (drafts + scheduled + sent).",
    inputSchema: { type: 'object' as const, properties: { lab: { type: 'string' }, limit: { type: 'number', minimum: 1, maximum: 50 } }, required: ['lab'], additionalProperties: false },
    zodSchema: z.object({ lab: z.string(), limit: z.number().int().min(1).max(50).optional() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/editions`, { params: { limit: p.limit } }); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
