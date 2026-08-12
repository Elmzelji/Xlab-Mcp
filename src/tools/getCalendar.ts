/**
 * Tool `get_calendar` — config complète du plug-in Calendrier IA d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getCalendarTool = {
    name: 'get_calendar',
    description: "Lit la config complete du Calendrier IA (booking) d'un Lab : details du RDV, type de lieu, prix, duree, plage de dates, scoring IA, disponibilites, questions de qualification, regles de disqualification, relances.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
