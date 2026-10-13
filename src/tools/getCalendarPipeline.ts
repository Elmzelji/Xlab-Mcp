/**
 * Tool `get_calendar_pipeline` — pipeline des leads (prospects) du Calendrier IA.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getCalendarPipelineTool = {
    name: 'get_calendar_pipeline',
    description: "Liste le pipeline des leads (prospects) du Calendrier IA : personnes ayant demarre / complete le formulaire ou reserve un creneau, avec leur scoring (hot/warm/cold) et statut. Un Lab peut avoir plusieurs calendriers : event_id (via list_calendars) cible l'un d'eux, sinon le premier du Lab.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, event_id: { type: 'number', minimum: 1, description: 'Calendrier vise (list_calendars). Defaut : le premier du Lab.' } },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), event_id: z.number().int().positive().optional() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/pipeline`, { params: p.event_id ? { event_id: p.event_id } : undefined });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
