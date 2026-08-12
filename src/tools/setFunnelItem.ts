/**
 * Tool `set_funnel_item` — cree / remplace un item de tunnel (order bump,
 * upsell ou downsell). 1 seul item par kind : re-appeler remplace l'existant.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SELLABLE_TYPES = ['agent_ai', 'group_shop', 'course', 'newsletter', 'podcast_show', 'lab_channel'] as const;

export const setFunnelItemTool = {
    name: 'set_funnel_item',
    description: "Cree ou remplace un item de tunnel : order_bump (case a cocher au checkout), upsell (offre apres achat) ou downsell (offre de repli si upsell refuse). 1 seul item par kind. offer_type + offer_id = le produit propose (list_funnel_offers). Pour un order_bump, l'offre doit avoir le meme type de paiement (one-shot / abonnement) que le produit principal. price_cents override le prix (sinon prix courant du produit). Les champs riches (kicker, subtitle, video_url, original_price_cents (prix barre), timer_minutes, bullets, faq, testimonial) servent surtout aux pages upsell/downsell.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            funnel_id: { type: 'number' },
            kind: { type: 'string', enum: ['order_bump', 'upsell', 'downsell'] },
            offer_type: { type: 'string', enum: [...SELLABLE_TYPES], description: 'Type du produit propose (list_funnel_offers)' },
            offer_id: { type: 'number', description: 'Id du produit propose' },
            title: { type: 'string', maxLength: 200 },
            description: { type: 'string', maxLength: 2000 },
            image_url: { type: 'string', maxLength: 500 },
            accept_cta: { type: 'string', maxLength: 100, description: "Libelle du bouton d'acceptation" },
            decline_cta: { type: 'string', maxLength: 100, description: 'Libelle du bouton de refus' },
            design_variant: { type: 'string', maxLength: 40, description: 'Variante visuelle (order bump) : simple / bordered / card / highlighted' },
            accent_color: { type: 'string', maxLength: 20, description: 'Couleur hex' },
            price_cents: { type: 'number', minimum: 0, description: 'Prix override en centimes (sinon prix courant du produit propose)' },
            currency: { type: 'string', description: 'Code devise 3 lettres (defaut eur)' },
            // Pages upsell / downsell riches.
            kicker: { type: 'string', maxLength: 120 },
            subtitle: { type: 'string', maxLength: 2000 },
            confirmation_message: { type: 'string', maxLength: 500 },
            video_url: { type: 'string', maxLength: 500 },
            original_price_cents: { type: 'number', minimum: 0, description: 'Prix barre (marketing) en centimes' },
            timer_minutes: { type: 'number', minimum: 0, maximum: 1440, description: 'Compte a rebours en minutes' },
            bullets: {
                type: 'array', maxItems: 6,
                items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' } }, additionalProperties: false },
            },
            bullets_title: { type: 'string', maxLength: 200 },
            faq: {
                type: 'array', maxItems: 6,
                items: { type: 'object', properties: { question: { type: 'string' }, answer: { type: 'string' } }, additionalProperties: false },
            },
            testimonial_quote: { type: 'string', maxLength: 1000 },
            testimonial_author: { type: 'string', maxLength: 200 },
        },
        required: ['lab', 'funnel_id', 'kind', 'offer_type', 'offer_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        funnel_id: z.number().int().positive(),
        kind: z.enum(['order_bump', 'upsell', 'downsell']),
        offer_type: z.enum(SELLABLE_TYPES),
        offer_id: z.number().int().positive(),
        title: z.string().max(200).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
        image_url: z.string().max(500).nullable().optional(),
        accept_cta: z.string().max(100).nullable().optional(),
        decline_cta: z.string().max(100).nullable().optional(),
        design_variant: z.string().max(40).nullable().optional(),
        accent_color: z.string().max(20).nullable().optional(),
        price_cents: z.number().int().min(0).nullable().optional(),
        currency: z.string().length(3).nullable().optional(),
        kicker: z.string().max(120).nullable().optional(),
        subtitle: z.string().max(2000).nullable().optional(),
        confirmation_message: z.string().max(500).nullable().optional(),
        video_url: z.string().max(500).nullable().optional(),
        original_price_cents: z.number().int().min(0).nullable().optional(),
        timer_minutes: z.number().int().min(0).max(1440).nullable().optional(),
        bullets: z.array(z.object({
            title: z.string().max(200).nullable().optional(),
            description: z.string().max(600).nullable().optional(),
        })).max(6).nullable().optional(),
        bullets_title: z.string().max(200).nullable().optional(),
        faq: z.array(z.object({
            question: z.string().max(200).nullable().optional(),
            answer: z.string().max(800).nullable().optional(),
        })).max(6).nullable().optional(),
        testimonial_quote: z.string().max(1000).nullable().optional(),
        testimonial_author: z.string().max(200).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, funnel_id, ...body } = p;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/funnels/${funnel_id}/items`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
