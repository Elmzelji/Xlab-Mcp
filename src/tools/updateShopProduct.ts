import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateShopProductTool = {
    name: 'update_shop_product',
    description: "Modifie un produit boutique (titre, prix, description, publication, type d'offre). Champs optionnels. Prix en centimes. Passe offer_type=formation + course_id (list_classes) pour que l'achat debloque un cours ; tout autre offer_type detache le cours lie.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            shop_id: { type: 'number' },
            title: { type: 'string', maxLength: 255 },
            short_description: { type: 'string' },
            description: { type: 'string' },
            price_cents: { type: 'number', minimum: 0 },
            offer_type: { type: 'string', enum: ['digital', 'calendar', 'formation'] },
            course_id: { type: 'number', description: "Id d'un cours du Lab (list_classes) — requis/utilise quand offer_type=formation." },
            payment_mode: { type: 'string', enum: ['external', 'stripe'] },
            payment_link_text: { type: 'string', maxLength: 255 },
            support_email: { type: 'string', format: 'email' },
            is_published: { type: 'boolean' },
        },
        required: ['lab', 'shop_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        shop_id: z.number().int().positive(),
        title: z.string().max(255).optional(),
        short_description: z.string().optional(),
        description: z.string().optional(),
        price_cents: z.number().int().min(0).nullable().optional(),
        offer_type: z.enum(['digital', 'calendar', 'formation']).optional(),
        course_id: z.number().int().positive().nullable().optional(),
        payment_mode: z.enum(['external', 'stripe']).optional(),
        payment_link_text: z.string().max(255).nullable().optional(),
        support_email: z.string().email().nullable().optional(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, shop_id, ...body } = p;
        try { const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/shops/${shop_id}`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
