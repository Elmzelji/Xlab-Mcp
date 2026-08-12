/**
 * Tool `get_newsletter_settings` — config complète de la newsletter du Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getNewsletterSettingsTool = {
    name: 'get_newsletter_settings',
    description: "Lit la config complete de la newsletter du Lab (titre, slug, tagline, auteur, apparence, email de bienvenue, mode d'envoi, page de vente...).",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/settings`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
