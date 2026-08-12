/**
 * Tool `update_newsletter_settings` — met à jour les réglages clés de la
 * newsletter (sous-ensemble curé ; l'éditeur de landing page complet reste
 * sur le front).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateNewsletterSettingsTool = {
    name: 'update_newsletter_settings',
    description: "Met a jour les reglages cles de la newsletter (titre, tagline, auteur, apparence, CTA, email de bienvenue, mode d'envoi). N'envoie que ce que tu veux changer. L'editeur de landing page complet (perks / temoignages / FAQ / sections) reste sur le front.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', maxLength: 191 },
            tagline: { type: 'string', maxLength: 2000 },
            author_name: { type: 'string', maxLength: 191 },
            author_bio: { type: 'string', maxLength: 2000 },
            accent_color: { type: 'string', maxLength: 16 },
            background: { type: 'string', enum: ['white', 'cream', 'dark'] },
            cta_primary_text: { type: 'string', maxLength: 191 },
            cta_secondary_text: { type: 'string', maxLength: 191 },
            show_secondary_cta: { type: 'boolean' },
            footer_text: { type: 'string', maxLength: 2000 },
            unsubscribe_label: { type: 'string', maxLength: 100 },
            welcome_email_subject: { type: 'string', maxLength: 255 },
            welcome_email_html: { type: 'string', maxLength: 50000 },
            welcome_email_enabled: { type: 'boolean' },
            send_mode: { type: 'string', enum: ['standard', 'custom_domain'] },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().max(191).optional(),
        tagline: z.string().max(2000).nullable().optional(),
        author_name: z.string().max(191).nullable().optional(),
        author_bio: z.string().max(2000).nullable().optional(),
        accent_color: z.string().max(16).optional(),
        background: z.enum(['white', 'cream', 'dark']).optional(),
        cta_primary_text: z.string().max(191).optional(),
        cta_secondary_text: z.string().max(191).optional(),
        show_secondary_cta: z.boolean().optional(),
        footer_text: z.string().max(2000).nullable().optional(),
        unsubscribe_label: z.string().max(100).nullable().optional(),
        welcome_email_subject: z.string().max(255).nullable().optional(),
        welcome_email_html: z.string().max(50000).nullable().optional(),
        welcome_email_enabled: z.boolean().optional(),
        send_mode: z.enum(['standard', 'custom_domain']).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/newsletter/settings`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
