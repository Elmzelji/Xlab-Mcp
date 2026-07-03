import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createNewsletterEditionTool = {
    name: 'create_newsletter_edition',
    description: "Cree un draft d'edition newsletter (title + subject + body HTML). L'envoi se fait via send_newsletter_edition.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', maxLength: 255 },
            subject: { type: 'string', maxLength: 255, description: "Objet email" },
            body_html: { type: 'string', description: "Corps HTML" },
            access: { type: 'string', enum: ['free', 'premium'] },
            audience: { type: 'string', enum: ['all', 'premium', 'free', 'lab_members'] },
        },
        required: ['lab', 'title', 'subject', 'body_html'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().max(255),
        subject: z.string().max(255),
        body_html: z.string(),
        access: z.enum(['free', 'premium']).optional(),
        audience: z.enum(['all', 'premium', 'free', 'lab_members']).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try { const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/newsletter/editions`, body); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
