/**
 * Tool `update_upsell_offer` — regle l'offre (upsell) d'une formation ou d'une
 * programmation. Mise a jour partielle : les champs absents ne changent pas.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateUpsellOfferTool = {
    name: 'update_upsell_offer',
    description: "Modifie l'offre (upsell) sous les videos d'une formation (scope course) ou sous les seances d'une programmation (scope program). Champs absents inchanges. Produit : un id de products (get_upsell_offer). Course : placement_mode all|selected + module_ids. Program : all|weekdays + weekdays (0=lundi) + only_after_completion.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            scope: { type: 'string', enum: ['course', 'program'] },
            id: { type: 'number', description: 'Id de la formation ou de la programmation' },
            is_enabled: { type: 'boolean', description: 'Affiche la carte aux membres' },
            group_shop_id: { type: 'number', description: 'Produit propose (paye par Stripe)' },
            placement_mode: { type: 'string', enum: ['all', 'selected', 'weekdays'], description: 'selected = formation, weekdays = programmation' },
            module_ids: { type: 'array', items: { type: 'number' }, description: 'Videos choisies (formation)' },
            weekdays: { type: 'array', items: { type: 'number', minimum: 0, maximum: 6 }, description: 'Jours choisis, 0 = lundi (programmation)' },
            only_after_completion: { type: 'boolean', description: 'Programmation : carte seulement une fois la seance validee' },
            kicker: { type: 'string', maxLength: 30, description: 'Accroche' },
            title: { type: 'string', maxLength: 45, description: 'Titre (obligatoire si active)' },
            promise: { type: 'string', maxLength: 110, description: 'Promesse' },
            highlights: { type: 'array', items: { type: 'string', maxLength: 28 }, maxItems: 3, description: 'Points forts' },
            cta_label: { type: 'string', maxLength: 28, description: 'Texte du bouton' },
            show_cover: { type: 'boolean' },
            bonus_enabled: { type: 'boolean', description: 'Bonus limite dans le temps' },
            bonus_label: { type: 'string', maxLength: 40 },
            bonus_shop_id: { type: ['number', 'null'], description: 'Produit bonus livre a l\'achat (bonus_products), null = livre par l\'owner' },
            countdown_hours: { type: ['number', 'null'], enum: [24, 48, 72, 168, null], description: 'Duree du chrono, null = sans chrono' },
        },
        required: ['lab', 'scope', 'id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        scope: z.enum(['course', 'program']),
        id: z.number().int().positive(),
        is_enabled: z.boolean().optional(),
        group_shop_id: z.number().int().positive().optional(),
        placement_mode: z.enum(['all', 'selected', 'weekdays']).optional(),
        module_ids: z.array(z.number().int().positive()).optional(),
        weekdays: z.array(z.number().int().min(0).max(6)).optional(),
        only_after_completion: z.boolean().optional(),
        kicker: z.string().max(30).nullable().optional(),
        title: z.string().max(45).nullable().optional(),
        promise: z.string().max(110).nullable().optional(),
        highlights: z.array(z.string().max(28)).max(3).optional(),
        cta_label: z.string().max(28).nullable().optional(),
        show_cover: z.boolean().optional(),
        bonus_enabled: z.boolean().optional(),
        bonus_label: z.string().max(40).nullable().optional(),
        bonus_shop_id: z.number().int().positive().nullable().optional(),
        countdown_hours: z.union([z.literal(24), z.literal(48), z.literal(72), z.literal(168)]).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, scope, id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/upsell-offers/${scope}/${id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
