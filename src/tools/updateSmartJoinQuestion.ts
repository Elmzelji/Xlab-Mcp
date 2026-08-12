/**
 * Tool `update_smart_join_question` — modifie une question Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const TYPES = ['email', 'short_text', 'long_text', 'phone', 'number', 'single_choice', 'multiple_choice'] as const;

export const updateSmartJoinQuestionTool = {
    name: 'update_smart_join_question',
    description: "Modifie une question de qualification Smart Join. question_id vient de get_smart_join. Pour single_choice / multiple_choice, fournis options.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            question_id: { type: 'number' },
            label: { type: 'string', maxLength: 500 },
            type: { type: 'string', enum: [...TYPES] },
            options: { type: 'array', items: { type: 'string' } },
        },
        required: ['lab', 'question_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        question_id: z.number().int().positive(),
        label: z.string().max(500).optional(),
        type: z.enum(TYPES).optional(),
        options: z.array(z.string()).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, question_id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/smart-join/questions/${question_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
