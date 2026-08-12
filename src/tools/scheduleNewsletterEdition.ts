/**
 * Tool `schedule_newsletter_edition` — programme l'envoi d'une édition.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const scheduleNewsletterEditionTool = {
    name: 'schedule_newsletter_edition',
    description: "Programme l'envoi d'une edition de newsletter a une date/heure future. scheduled_at est interprete dans le fuseau configure de la newsletter (ex '2026-09-01T11:00:00'). Une edition deja envoyee ne peut pas etre programmee. edition_id vient de list_newsletter_editions.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            edition_id: { type: 'number' },
            scheduled_at: { type: 'string', description: "Date/heure d'envoi (ISO local, ex 2026-09-01T11:00:00), dans le futur" },
        },
        required: ['lab', 'edition_id', 'scheduled_at'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        edition_id: z.number().int().positive(),
        scheduled_at: z.string().min(1),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/editions/${p.edition_id}/schedule`, { scheduled_at: p.scheduled_at });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
