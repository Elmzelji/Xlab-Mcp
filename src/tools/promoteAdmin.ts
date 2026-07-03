import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const promoteAdminTool = {
    name: 'promote_admin',
    description: "Promeut un membre en admin (type 'basic' -> 'admin'). Un admin peut moderer, poster, gerer les autres membres. Idempotent. Un super-admin ne peut pas etre modifie via MCP.",
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
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/promote`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
