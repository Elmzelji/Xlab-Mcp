/**
 * Tool `manage_lab_affiliate` — revoque / restaure un affilié du Lab, ou fixe
 * son pourcentage custom. (Pas d'approbation au niveau Lab : le programme est
 * on/off.)
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const manageLabAffiliateTool = {
    name: 'manage_lab_affiliate',
    description: "Gere un affilie du Lab (lab-level). action : revoke (coupe l'affiliation), restore (annule la revocation), set_percent (fixe un pourcentage custom — fournir custom_percent, ou null pour repasser au % du Lab). user_id = id de l'affilie (list_lab_affiliates). IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            user_id: { type: 'number' },
            action: { type: 'string', enum: ['revoke', 'restore', 'set_percent'] },
            custom_percent: { type: ['number', 'null'], minimum: 0, maximum: 100, description: 'Requis si action=set_percent (null = % du Lab).' },
        },
        required: ['lab', 'user_id', 'action'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        user_id: z.number().int().positive(),
        action: z.enum(['revoke', 'restore', 'set_percent']),
        custom_percent: z.number().min(0).max(100).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const body: Record<string, unknown> = { action: p.action };
        if (p.action === 'set_percent') body.custom_percent = p.custom_percent ?? null;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/lab/affiliates/${p.user_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
