/**
 * Tool `delete_calendar_question` — supprime une question du calendrier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteCalendarQuestionTool = {
    name: 'delete_calendar_question',
    description: "Supprime une question de qualification du Calendrier IA. question_id vient de get_calendar. IMPORTANT : demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            question_id: { type: 'number' },
        },
        required: ['lab', 'question_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), question_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/questions/${p.question_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
