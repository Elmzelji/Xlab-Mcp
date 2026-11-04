/**
 * Tool `get_link_in_bio` — recupere la page Link in Bio du Lab (settings +
 * blocs). Renvoie null dans `page` si aucune page n'a encore ete creee.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getLinkInBioTool = {
    name: 'get_link_in_bio',
    description:
        "Recupere la page Link in Bio d'un Lab : slug, published, display_name, bio, theme, layout (avatar/banner/portrait), desktop_layout (split/centered), avatar/banner/portrait URLs, socials, et la liste ordonnee des blocs (kind = external/product/lab). `pages` liste les pages du Lab (le Lab officiel peut en avoir plusieurs).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            page: { type: 'number', minimum: 1, description: 'Lab officiel : id de la page visee (liste dans get_link_in_bio). Defaut : la premiere.' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), page: z.number().int().positive().optional() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/link-in-bio`, { params: parsed.page ? { page: parsed.page } : {} });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
