/**
 * Tool `update_lab_affiliation_config` — configure le programme d'affiliation
 * au niveau du Lab entier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLabAffiliationConfigTool = {
    name: 'update_lab_affiliation_config',
    description: "Configure le programme d'affiliation du Lab entier. affiliation_status = '1' actif / '0' inactif. affiliation_percent = commission %. Les 3 scopes activent l'affiliation sur : paiements one-shot, abonnement au Lab, abonnements internes. affiliation_badge_status = affiche le badge affilie.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            affiliation_status: { type: 'string', enum: ['0', '1'] },
            affiliation_percent: { type: 'number', minimum: 0, maximum: 100 },
            affiliation_scope_paid_one_shot: { type: 'boolean' },
            affiliation_scope_lab_subscription: { type: 'boolean' },
            affiliation_scope_internal_subscription: { type: 'boolean' },
            affiliation_badge_status: { type: 'string', enum: ['0', '1'] },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        affiliation_status: z.enum(['0', '1']).optional(),
        affiliation_percent: z.number().min(0).max(100).optional(),
        affiliation_scope_paid_one_shot: z.boolean().optional(),
        affiliation_scope_lab_subscription: z.boolean().optional(),
        affiliation_scope_internal_subscription: z.boolean().optional(),
        affiliation_badge_status: z.enum(['0', '1']).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/affiliation/lab/config`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
