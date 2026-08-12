/**
 * Tool `delete_newsletter_subscriber` — retire un abonné de la newsletter.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteNewsletterSubscriberTool = {
    name: 'delete_newsletter_subscriber',
    description: "Retire un abonne de la newsletter du Lab. subscriber_id vient de list_newsletter_subscribers. IMPORTANT : action destructive, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            subscriber_id: { type: 'number' },
        },
        required: ['lab', 'subscriber_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), subscriber_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/subscribers/${p.subscriber_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
