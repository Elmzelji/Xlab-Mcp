/**
 * Tool `get_newsletter_edition` — contenu complet d'une édition (dont body_html).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getNewsletterEditionTool = {
    name: 'get_newsletter_edition',
    description: "Recupere le contenu complet d'une edition de newsletter (titre, objet, body_html, access, audience, statut, stats). edition_id vient de list_newsletter_editions.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/editions/${p.edition_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
