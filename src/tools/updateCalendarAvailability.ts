/**
 * Tool `update_calendar_availability` — disponibilités hebdomadaires du calendrier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarAvailabilityTool = {
    name: 'update_calendar_availability',
    description: "Definit les disponibilites hebdomadaires du Calendrier IA. days est un tableau (max 7) d'un objet par jour : day_of_week (0=dimanche..6=samedi), is_available, start_time et end_time au format HH:MM (end > start).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
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
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/availability`, { days: p.days });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
