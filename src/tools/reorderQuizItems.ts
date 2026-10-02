/**
 * Tool `reorder_quiz_items` — reordonne les questions / pages.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const reorderQuizItemsTool = {
    name: 'reorder_quiz_items',
    description: "Reordonne les questions et pages du quiz : order = liste complete des item_id dans le nouvel ordre.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            order: { type: 'array', items: { type: 'number' }, minItems: 1 },
        },
        required: ['lab', 'quiz_id', 'order'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        order: z.array(z.number().int().positive()).min(1),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/items/reorder`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
