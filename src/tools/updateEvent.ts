import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateEventTool = {
    name: 'update_event',
    description: "Met a jour un evenement du calendrier (titre, description, date, duree, lien, reminder). Champs optionnels.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            event_id: { type: 'number' },
            title: { type: 'string', maxLength: 50 },
            description: { type: 'string' },
            event_date: { type: 'string', description: 'ISO 8601 date' },
            timezone: { type: 'string' },
            duration: { type: 'string' },
            link: { type: 'string' },
            reminder_enabled: { type: 'boolean' },
        },
        required: ['lab', 'event_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        event_id: z.number().int().positive(),
        title: z.string().max(50).optional(),
        description: z.string().optional(),
        event_date: z.string().optional(),
        timezone: z.string().optional(),
        duration: z.string().optional(),
        link: z.string().nullable().optional(),
        reminder_enabled: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, event_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/events/${event_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
