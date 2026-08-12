/**
 * Tool `stop_newsletter` — arrête la newsletter (annule les abos premium).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const stopNewsletterTool = {
    name: 'stop_newsletter',
    description: "Arrete la newsletter du Lab : les abonnements premium sont annules en fin de cycle. Reversible via reactivate_newsletter. IMPORTANT : action sensible, demander confirmation.",
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
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/stop`, {});
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
