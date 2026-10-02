/**
 * Tool `list_dm_enrollments` — membres inscrits dans les sequences DM.
 * Scope : dm_sequences.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listDmEnrollmentsTool = {
    name: 'list_dm_enrollments',
    description: "Liste paginee des membres inscrits dans une sequence (state : scheduled, running, paused_reply, paused_owner, paused_admin, completed_goal, completed_steps, cancelled, expired, failed).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1 },
            state: { type: 'string', enum: ['scheduled', 'running', 'paused_reply', 'paused_owner', 'paused_admin', 'completed_goal', 'completed_steps', 'cancelled', 'expired', 'failed'] },
            per_page: { type: 'number', minimum: 1, maximum: 50 },
            page: { type: 'number', minimum: 1, description: 'page (pagination)' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().min(1).optional(),
        state: z.enum(['scheduled', 'running', 'paused_reply', 'paused_owner', 'paused_admin', 'completed_goal', 'completed_steps', 'cancelled', 'expired', 'failed']).optional(),
        per_page: z.number().int().min(1).max(50).optional(),
        page: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { sequence_id, state, per_page, page } = p;
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/enrollments`, { params: { sequence_id, state, per_page, page } });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
