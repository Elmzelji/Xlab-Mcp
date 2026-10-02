/**
 * Tool `get_link_in_bio_catalog` — catalogue des ids utilisables dans les blocs Link in Bio.
 * Scope : link_in_bio.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getLinkInBioCatalogTool = {
    name: 'get_link_in_bio_catalog',
    description: "Liste les ids utilisables dans les blocs Link in Bio : products (type + id pour kind=product), labs (id pour kind=lab = autres Labs de l'owner), quizzes (id + published pour kind=quiz) et quiz_plugin_enabled. Un bloc quiz n'apparait sur la page publique que si le quiz est publie ET le plug-in Quiz active.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/link-in-bio/catalog`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
