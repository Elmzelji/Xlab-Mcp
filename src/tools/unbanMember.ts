import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const unbanMemberTool = {
    name: 'unban_member',
    description: "Restaure un membre banni : status 'blocked' -> 'approved'. Idempotent.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            member_id: { type: 'number' },
        },
        required: ['lab', 'member_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), member_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/unban`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
