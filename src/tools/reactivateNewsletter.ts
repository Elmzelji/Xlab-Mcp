/**
 * Tool `reactivate_newsletter` — relance une newsletter arrêtée.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const reactivateNewsletterTool = {
    name: 'reactivate_newsletter',
    description: "Relance une newsletter precedemment arretee : la reactive et de-resilie les abonnements premium.",
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
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/reactivate`, {});
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
