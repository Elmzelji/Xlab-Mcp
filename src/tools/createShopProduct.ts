import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createShopProductTool = {
    name: 'create_shop_product',
    description: "Cree un produit dans la boutique du Lab. Files (bannieres, PDF) non geres par MCP — a uploader ensuite via le front. Prix en centimes (price_cents) — c'est le PRODUIT qui porte le prix de vente. offer_type=formation : l'achat debloque un cours du Lab — fournis alors course_id (via list_classes) ET price_cents (>= 50, obligatoire, le cours lui-meme n'a pas de prix de vente) ; le paiement passe forcement en Stripe.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', maxLength: 255 },
            short_description: { type: 'string' },
            description: { type: 'string' },
            price_cents: { type: 'number', minimum: 0, description: 'Prix en centimes (ex 2990 = 29.90 EUR)' },
            offer_type: { type: 'string', enum: ['digital', 'calendar', 'formation'], description: "digital = telechargeable ; calendar = Calendrier IA ; formation = debloque un cours a l'achat (course_id requis)." },
            course_id: { type: 'number', description: "Requis si offer_type=formation — id d'un cours du Lab (list_classes). Doit appartenir a ce Lab." },
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
        offer_type: z.enum(['digital', 'calendar', 'formation']).optional(),
        course_id: z.number().int().positive().optional(),
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
