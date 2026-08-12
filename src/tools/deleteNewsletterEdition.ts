/**
 * Tool `delete_newsletter_edition` — supprime une édition de newsletter.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteNewsletterEditionTool = {
    name: 'delete_newsletter_edition',
    description: "Supprime une edition de newsletter. edition_id vient de list_newsletter_editions. IMPORTANT : action destructive, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            edition_id: { type: 'number' },
        },
        required: ['lab', 'edition_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), edition_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/editions/${p.edition_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
