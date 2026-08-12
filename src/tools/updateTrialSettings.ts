/**
 * Tool `update_trial_settings` — configure la période d'essai gratuite d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateTrialSettingsTool = {
    name: 'update_trial_settings',
    description: "Configure la periode d'essai gratuite d'un Lab payant : enabled = active/desactive, days = nombre de jours offerts avant le premier prelevement.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            enabled: { type: 'boolean' },
            days: { type: 'number', minimum: 0, description: "Nombre de jours d'essai" },
        },
        required: ['lab', 'enabled', 'days'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enabled: z.boolean(),
        days: z.number().int().min(0),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/trial`, { enabled: p.enabled, days: p.days });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
