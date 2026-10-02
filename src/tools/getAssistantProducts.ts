/**
 * Tool `get_assistant_products` — produits que Lou peut recommander.
 * Scope : assistant.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getAssistantProductsTool = {
    name: 'get_assistant_products',
    description: "Liste les produits de la boutique que Lou peut recommander aux membres : group_shop_id, title, price, enabled, pitch_notes (arguments), ideal_for (a qui le proposer).",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/products`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
