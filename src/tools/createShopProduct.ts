import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createShopProductTool = {
    name: 'create_shop_product',
    description: "Cree un produit dans la boutique du Lab, vendu via Stripe ConnectXLab (seul mode de paiement). Files (bannieres, PDF) non geres par MCP — a uploader ensuite via le front. Prix en centimes (price_cents) — c'est le PRODUIT qui porte le prix de vente. offer_type=formation : l'achat debloque un cours du Lab — fournis alors course_id (via list_classes) ET price_cents (>= 50, obligatoire, le cours lui-meme n'a pas de prix de vente). offer_type=digital : quiz_id optionnel (list_quizzes) pour embarquer un quiz du Lab — un bouton (quiz_cta_label, quiz_cta_subtext) l'ouvre en plein ecran ; sur un produit gratuit, il remplace le checkout.",
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
            support_email: { type: 'string', format: 'email' },
            quiz_id: { type: 'number', minimum: 1, description: 'offer_type=digital uniquement : id du quiz a embarquer (list_quizzes)' },
            quiz_cta_label: { type: 'string', maxLength: 150, description: 'texte du bouton qui ouvre le quiz' },
            quiz_cta_subtext: { type: 'string', maxLength: 500, description: 'petit texte rassurant sous le bouton' },
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
        support_email: z.string().email().nullable().optional(),
        quiz_id: z.number().int().positive().nullable().optional(),
        quiz_cta_label: z.string().max(150).nullable().optional(),
        quiz_cta_subtext: z.string().max(500).nullable().optional(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/shops`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
