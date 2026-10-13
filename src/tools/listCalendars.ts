/**
 * Tool `list_calendars` — calendriers du plug-in Calendrier IA d'un Lab
 * (un Lab peut en avoir plusieurs). L'id sert d'event_id aux autres outils
 * calendrier et de calendar_event_id aux blocs Link in Bio.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listCalendarsTool = {
    name: 'list_calendars',
    description: "Liste les calendriers (Calendrier IA) d'un Lab : id, nom, type (gratuit/payant), etat. L'id se passe en event_id aux outils calendrier (get_calendar, update_calendar...) et en calendar_event_id a un bloc Link in Bio de type calendar.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/calendars`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
