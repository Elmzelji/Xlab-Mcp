import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLabSettingsTool = {
    name: 'update_lab_settings',
    description: "Met a jour les settings d'un Lab. Tous les champs sont optionnels — n'envoie que ceux que tu veux changer. Attention : changer is_free ou monthly_price_eur impacte les futurs paiements. Demande confirmation user.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            name: { type: 'string', maxLength: 255 },
            description: { type: 'string' },
            full_description: { type: 'string' },
            is_free: { type: 'boolean' },
            monthly_price_eur: { type: 'number', minimum: 0 },
            trial_period_days: { type: 'number', minimum: 0 },
            trial_enabled: { type: 'boolean' },
            affiliation_enabled: { type: 'boolean' },
            affiliation_percent: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        name: z.string().max(255).optional(),
        description: z.string().optional(),
        full_description: z.string().optional(),
        is_free: z.boolean().optional(),
        monthly_price_eur: z.number().min(0).optional(),
        trial_period_days: z.number().int().min(0).optional(),
        trial_enabled: z.boolean().optional(),
        affiliation_enabled: z.boolean().optional(),
        affiliation_percent: z.number().int().min(0).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/settings`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
