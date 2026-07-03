import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createShopProductTool = {
    name: 'create_shop_product',
    description: "Cree un produit dans la boutique du Lab. Files (bannieres, PDF) non geres par MCP — a uploader ensuite via le front. Prix en centimes (price_cents).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', maxLength: 255 },
            short_description: { type: 'string' },
            description: { type: 'string' },
            price_cents: { type: 'number', minimum: 0, description: 'Prix en centimes (ex 2990 = 29.90 EUR)' },
            offer_type: { type: 'string', enum: ['digital', 'physical', 'calendar', 'service'] },
            payment_mode: { type: 'string', enum: ['external', 'stripe'] },
            payment_link_text: { type: 'string', maxLength: 255 },
            support_email: { type: 'string', format: 'email' },
            is_published: { type: 'boolean' },
        },
        required: ['lab', 'title', 'short_description', 'description'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().max(255),
        short_description: z.string(),
        description: z.string(),
        price_cents: z.number().int().min(0).nullable().optional(),
        offer_type: z.enum(['digital', 'physical', 'calendar', 'service']).optional(),
        payment_mode: z.enum(['external', 'stripe']).optional(),
        payment_link_text: z.string().max(255).nullable().optional(),
        support_email: z.string().email().nullable().optional(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/shops`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
