import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const sendInvitationTool = {
    name: 'send_invitation',
    description: "Envoie une invitation par email a rejoindre le Lab. Accepte un seul email ou une liste. Ignore les emails deja invites. type (admin | moderator) = invitation dans l'equipe, role donne a l'arrivee ; access_offered (Lab payant) = entre sans payer, sinon il s'abonne et recoit son role apres le paiement.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            email: { type: 'string', format: 'email' },
            emails: { type: 'array', items: { type: 'string', format: 'email' } },
            type: { type: 'string', enum: ['admin', 'moderator'], description: "Invitation dans l'equipe : role a l'arrivee." },
            access_offered: { type: 'boolean', description: "Lab payant : acces offert (entre sans payer)." },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        email: z.string().email().optional(),
        emails: z.array(z.string().email()).optional(),
        type: z.enum(['admin', 'moderator']).optional(),
        access_offered: z.boolean().optional(),
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
