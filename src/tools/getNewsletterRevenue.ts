/**
 * Tool `get_newsletter_revenue` — revenus de la newsletter premium.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getNewsletterRevenueTool = {
    name: 'get_newsletter_revenue',
    description: "Revenus generes par les abonnements premium de la newsletter du Lab.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/revenue`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
