/**
 * Tool `get_link_in_bio` — recupere la page Link in Bio du Lab (settings +
 * blocs). Renvoie null dans `page` si aucune page n'a encore ete creee.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getLinkInBioTool = {
    name: 'get_link_in_bio',
    description:
        "Recupere la page Link in Bio d'un Lab : slug, published, display_name, bio, theme, layout (avatar/banner/portrait), desktop_layout (split/centered), avatar/banner/portrait URLs, socials, et la liste ordonnee des blocs (kind = external/product/lab).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/link-in-bio`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
