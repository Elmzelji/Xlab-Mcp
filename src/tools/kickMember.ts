/**
 * Tool `kick_member` — retire un membre du Lab (soft-delete).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const kickMemberTool = {
    name: 'kick_member',
    description: "Retire un membre du Lab (soft-delete). L'owner ne peut pas se kicker lui-meme. IMPORTANT : action destructive, demande confirmation user avant d'invoquer.",
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
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
