/**
 * Tool `toggle_link_in_bio_publish` — publie / depublie la page. Une page
 * depubliee reste editable mais n'est plus accessible via son slug public.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const toggleLinkInBioPublishTool = {
    name: 'toggle_link_in_bio_publish',
    description:
        "Publie ou depublie la page Link in Bio. Le back bascule automatiquement l'etat (pas besoin de passer publish=true/false). Retourne l'etat resultant.",
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
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(parsed.lab)}/link-in-bio/publish`, {});
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
