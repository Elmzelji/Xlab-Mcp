/**
 * Tool `update_calendar_question` — modifie une question du calendrier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarQuestionTool = {
    name: 'update_calendar_question',
    description: "Modifie une question de qualification du Calendrier IA. question_id vient de get_calendar. question_type = text ou qcm (options requises si qcm).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            question_id: { type: 'number' },
            label: { type: 'string', maxLength: 500 },
            question_type: { type: 'string', enum: ['text', 'qcm'] },
            icon: { type: 'string', maxLength: 40 },
            required: { type: 'boolean' },
            options: { type: 'array', items: { type: 'string', maxLength: 200 } },
        },
        required: ['lab', 'question_id', 'label', 'question_type'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        question_id: z.number().int().positive(),
        label: z.string().min(1).max(500),
        question_type: z.enum(['text', 'qcm']),
        icon: z.string().max(40).nullable().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string().max(200)).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, question_id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/calendar/questions/${question_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
