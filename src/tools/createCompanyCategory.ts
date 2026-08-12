/**
 * Tool `create_company_category` — cree une categorie Marketplace dans un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createCompanyCategoryTool = {
    name: 'create_company_category',
    description: "Cree une categorie dans le Marketplace du Lab (pour classer les societes).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'name'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), name: z.string().min(1).max(255) }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(parsed.lab)}/company-categories`, { name: parsed.name });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
