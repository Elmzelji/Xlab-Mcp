/**
 * Tool `get_calendar_pipeline` — pipeline des leads (prospects) du Calendrier IA.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getCalendarPipelineTool = {
    name: 'get_calendar_pipeline',
    description: "Liste le pipeline des leads (prospects) du Calendrier IA : personnes ayant demarre / complete le formulaire ou reserve un creneau, avec leur scoring (hot/warm/cold) et statut.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' } },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/pipeline`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
