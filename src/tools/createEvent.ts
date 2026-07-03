import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createEventTool = {
    name: 'create_event',
    description: "Cree un evenement dans un Lab. event_date au format ISO 8601 (ex: 2026-08-15T18:00:00Z). timezone au format IANA (ex: Europe/Paris).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            title: { type: 'string', description: 'Titre (max 50 car)' },
            description: { type: 'string' },
            event_date: { type: 'string', description: 'Date/heure ISO 8601' },
            timezone: { type: 'string', description: 'IANA (ex: Europe/Paris)' },
            duration: { type: 'string', description: 'ex: "1 hour", "90 min"' },
            reminder_enabled: { type: 'boolean', default: false },
        },
        required: ['lab', 'title', 'description', 'event_date', 'timezone', 'duration'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().max(50),
        description: z.string(),
        event_date: z.string(),
        timezone: z.string(),
        duration: z.string(),
        reminder_enabled: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(parsed.lab)}/events`, parsed);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
