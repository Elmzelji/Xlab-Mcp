import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateShopProductTool = {
    name: 'update_shop_product',
    description: "Modifie un produit boutique (titre, prix, description, publication, type d'offre, quiz embarque). Champs optionnels. Prix en centimes. Paiement toujours via Stripe ConnectXLab. Passe offer_type=formation + course_id (list_classes) pour que l'achat debloque un cours ; tout autre offer_type detache le cours lie. offer_type=digital : quiz_id (list_quizzes, null pour retirer), quiz_cta_label, quiz_cta_subtext ; tout autre type detache le quiz.",
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
            support_email: { type: 'string', format: 'email' },
            quiz_id: { type: ['number', 'null'], description: 'offer_type=digital : id du quiz a embarquer (list_quizzes), null pour le retirer' },
            quiz_cta_label: { type: 'string', maxLength: 150 },
            quiz_cta_subtext: { type: 'string', maxLength: 500 },
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
        support_email: z.string().email().nullable().optional(),
        quiz_id: z.number().int().positive().nullable().optional(),
        quiz_cta_label: z.string().max(150).nullable().optional(),
        quiz_cta_subtext: z.string().max(500).nullable().optional(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, shop_id, ...body } = p;
        try { const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/shops/${shop_id}`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
