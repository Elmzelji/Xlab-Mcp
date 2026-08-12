/**
 * Tool `add_calendar_question` — ajoute une question de qualification au calendrier.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const addCalendarQuestionTool = {
    name: 'add_calendar_question',
    description: "Ajoute une question de qualification au Calendrier IA. question_type = text (reponse libre) ou qcm (choix multiple — options requises, min 2). icon et required optionnels.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            label: { type: 'string', maxLength: 500 },
            question_type: { type: 'string', enum: ['text', 'qcm'] },
            icon: { type: 'string', maxLength: 40 },
            required: { type: 'boolean' },
            options: { type: 'array', items: { type: 'string', maxLength: 200 }, description: 'Requis si question_type=qcm (min 2)' },
        },
        required: ['lab', 'label', 'question_type'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        label: z.string().min(1).max(500),
        question_type: z.enum(['text', 'qcm']),
        icon: z.string().max(40).nullable().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string().max(200)).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/calendar/questions`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
