/**
 * Tool `update_assistant_products` — configure les produits recommandes par Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateAssistantProductsTool = {
    name: 'update_assistant_products',
    description: "Configure les produits que Lou peut recommander : products = [{group_shop_id, enabled, pitch_notes?, ideal_for?}] (ids de get_assistant_products).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            products: { type: 'array', maxItems: 100, items: { type: 'object', properties: { group_shop_id: { type: 'number' }, enabled: { type: 'boolean' }, pitch_notes: { type: 'string' }, ideal_for: { type: 'string' } }, required: ['group_shop_id', 'enabled'] } },
        },
        required: ['lab', 'products'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        products: z.array(z.object({ group_shop_id: z.number().int().positive(), enabled: z.boolean(), pitch_notes: z.string().max(1000).nullable().optional(), ideal_for: z.string().max(500).nullable().optional() })).max(100),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/products`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
