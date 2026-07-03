import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteEventTool = {
    name: 'delete_event',
    description: "Supprime un evenement du Lab. IMPORTANT : demander confirmation user avant d'invoquer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            event_id: { type: 'number', description: "Id (list_events data[].id)" },
        },
        required: ['lab', 'event_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), event_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/events/${parsed.event_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
