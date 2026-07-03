/**
 * Tool `approve_member` — approuve un membre pending.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const approveMemberTool = {
    name: 'approve_member',
    description: "Approuve un membre en attente (pending -> approved). L'id est celui de list_members data[].id. Idempotent.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            member_id: { type: 'number', description: "Id du membre (list_members data[].id)" },
        },
        required: ['lab', 'member_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), member_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/approve`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
