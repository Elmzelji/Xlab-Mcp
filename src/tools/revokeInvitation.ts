import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const revokeInvitationTool = {
    name: 'revoke_invitation',
    description: "Revoque une invitation en attente. L'id est celui renvoye par list_invitations.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            invitation_id: { type: 'number' },
        },
        required: ['lab', 'invitation_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), invitation_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/invitations/${parsed.invitation_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
