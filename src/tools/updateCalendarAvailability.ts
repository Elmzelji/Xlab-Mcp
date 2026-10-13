/**
 * Tool `update_calendar_availability` — disponibilités hebdomadaires du calendrier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarAvailabilityTool = {
    name: 'update_calendar_availability',
    description: "Definit les disponibilites hebdomadaires du Calendrier IA. days est un tableau (max 7) d'un objet par jour : day_of_week (0=dimanche..6=samedi), is_available, start_time et end_time au format HH:MM (end > start). Un Lab peut avoir plusieurs calendriers : event_id (via list_calendars) cible l'un d'eux, sinon le premier du Lab.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            event_id: { type: 'number', minimum: 1, description: 'Calendrier vise (list_calendars). Defaut : le premier du Lab.' },
            days: {
                type: 'array',
                maxItems: 7,
                items: {
                    type: 'object',
                    properties: {
                        day_of_week: { type: 'number', minimum: 0, maximum: 6 },
                        is_available: { type: 'boolean' },
                        start_time: { type: 'string', description: 'HH:MM' },
                        end_time: { type: 'string', description: 'HH:MM' },
                    },
                    required: ['day_of_week', 'is_available', 'start_time', 'end_time'],
                    additionalProperties: false,
                },
            },
        },
        required: ['lab', 'days'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        event_id: z.number().int().positive().optional(),
        days: z.array(z.object({
            day_of_week: z.number().int().min(0).max(6),
            is_available: z.boolean(),
            start_time: z.string(),
            end_time: z.string(),
        })).max(7),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/availability`, { days: p.days, event_id: p.event_id });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
