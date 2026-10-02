/**
 * Tool `manage_dm_enrollment` — met en pause / reprend / annule l'inscription d'un membre.
 * Scope : dm_sequences.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const manageDmEnrollmentTool = {
    name: 'manage_dm_enrollment',
    description: "Agit sur l'inscription d'un membre a une sequence : pause, resume ou cancel (arret definitif pour ce membre).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            enrollment_id: { type: 'number', minimum: 1, description: 'id de l\'inscription (list_dm_enrollments)' },
            action: { type: 'string', enum: ['pause', 'resume', 'cancel'] },
        },
        required: ['lab', 'enrollment_id', 'action'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enrollment_id: z.number().int().positive(),
        action: z.enum(['pause', 'resume', 'cancel']),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, enrollment_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, enrollment_id };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/enrollments/${p.enrollment_id}/status`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
