import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const sendNewsletterEditionTool = {
    name: 'send_newsletter_edition',
    description: "Marque une edition draft comme envoyee. NOTE : cet appel MCP flag l'edition en 'sent' — l'envoi email reel se fait via l'endpoint xlab standard. Demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, edition_id: { type: 'number' } },
        required: ['lab', 'edition_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), edition_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/editions/${p.edition_id}/send`); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
