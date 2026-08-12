/**
 * Tool `update_newsletter_edition` — édite un draft de newsletter.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateNewsletterEditionTool = {
    name: 'update_newsletter_edition',
    description: "Modifie une edition de newsletter (title, subject, body_html, access, audience). Une edition deja envoyee ne peut plus etre modifiee. edition_id vient de list_newsletter_editions. IMPORTANT : action ecriture.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            edition_id: { type: 'number' },
            title: { type: 'string', maxLength: 255 },
            subject: { type: 'string', maxLength: 255 },
            body_html: { type: 'string', description: 'Contenu HTML de l\'edition' },
            access: { type: 'string', enum: ['free', 'premium'] },
            audience: { type: 'string', enum: ['all', 'premium', 'free', 'lab_members'] },
        },
        required: ['lab', 'edition_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        edition_id: z.number().int().positive(),
        title: z.string().max(255).optional(),
        subject: z.string().max(255).optional(),
        body_html: z.string().nullable().optional(),
        access: z.enum(['free', 'premium']).optional(),
        audience: z.enum(['all', 'premium', 'free', 'lab_members']).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, edition_id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/newsletter/editions/${edition_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
