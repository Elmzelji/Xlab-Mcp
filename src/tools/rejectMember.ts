/**
 * Tool `reject_member` — refuse une demande d'adhesion pending.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const rejectMemberTool = {
    name: 'reject_member',
    description: "Refuse une demande d'adhesion en attente (pending -> rejected). L'id est celui de list_members data[].id.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            member_id: { type: 'number', description: 'Id du membre' },
        },
        required: ['lab', 'member_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), member_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/reject`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
