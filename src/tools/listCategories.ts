/**
 * Tool `list_categories` — categories d'un Lab. A appeler AVANT create_post
 * pour obtenir un category_id valide.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listCategoriesTool = {
    name: 'list_categories',
    description: "Liste les categories d'un Lab. A appeler AVANT create_post pour savoir quel category_id utiliser.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/categories`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
