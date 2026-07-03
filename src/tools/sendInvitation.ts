import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const sendInvitationTool = {
    name: 'send_invitation',
    description: "Envoie une invitation par email a rejoindre le Lab. Accepte un seul email ou une liste. Ignore les emails deja invites.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            email: { type: 'string', format: 'email' },
            emails: { type: 'array', items: { type: 'string', format: 'email' } },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        email: z.string().email().optional(),
        emails: z.array(z.string().email()).optional(),
    }).refine(d => d.email || (d.emails && d.emails.length > 0), {
        message: 'Fournir au moins un email (email ou emails[]).',
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/invitations`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
