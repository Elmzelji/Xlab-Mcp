/**
 * Tool `update_calendar` — met à jour la config du Calendrier IA (sous-ensemble
 * curé ; les fenêtres horaires hot/warm par jour restent gérées via le front).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarTool = {
    name: 'update_calendar',
    description: "Met a jour la config du Calendrier IA. N'envoie que ce que tu veux changer. Les fenetres horaires hot/warm par jour (scoring) restent gerees via le front.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', maxLength: 200 },
            location_type: { type: 'string', enum: ['google_meet', 'zoom', 'phone', 'in_person'] },
            description: { type: 'string' },
            internal_note: { type: 'string' },
            notify_email: { type: 'string', format: 'email' },
            event_type: { type: 'string', enum: ['free', 'paid'] },
            price_cents: { type: 'number', minimum: 0 },
            duration_minutes: { type: 'number', enum: [30, 60] },
            date_range_days: { type: 'number', minimum: 1, maximum: 365 },
            date_range_enabled: { type: 'boolean' },
            auto_extend: { type: 'boolean' },
            timezone: { type: 'string', maxLength: 50 },
            ai_scoring_enabled: { type: 'boolean' },
            ideal_client_description: { type: 'string' },
            offer_name: { type: 'string', maxLength: 200 },
            offer_price_cents: { type: 'number', minimum: 0 },
            cold_offer_label: { type: 'string', maxLength: 200 },
            cold_offer_url: { type: 'string', maxLength: 500 },
            cold_offer_description: { type: 'string', maxLength: 500 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().max(200).optional(),
        location_type: z.enum(['google_meet', 'zoom', 'phone', 'in_person']).optional(),
        description: z.string().nullable().optional(),
        internal_note: z.string().nullable().optional(),
        notify_email: z.string().email().nullable().optional(),
        event_type: z.enum(['free', 'paid']).optional(),
        price_cents: z.number().int().min(0).nullable().optional(),
        duration_minutes: z.union([z.literal(30), z.literal(60)]).optional(),
        date_range_days: z.number().int().min(1).max(365).optional(),
        date_range_enabled: z.boolean().optional(),
        auto_extend: z.boolean().optional(),
        timezone: z.string().max(50).optional(),
        ai_scoring_enabled: z.boolean().optional(),
        ideal_client_description: z.string().nullable().optional(),
        offer_name: z.string().max(200).nullable().optional(),
        offer_price_cents: z.number().int().min(0).nullable().optional(),
        cold_offer_label: z.string().max(200).nullable().optional(),
        cold_offer_url: z.string().max(500).nullable().optional(),
        cold_offer_description: z.string().max(500).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/calendar`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
