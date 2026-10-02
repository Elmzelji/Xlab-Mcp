/**
 * Tool `update_quiz_answer` — modifie une reponse.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateQuizAnswerTool = {
    name: 'update_quiz_answer',
    description: "Modifie une reponse (label, points 0-4, profile_id). Seuls les champs fournis changent.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            item_id: { type: 'number', minimum: 1, description: 'id de la question / page (get_quiz)' },
            answer_id: { type: 'number', minimum: 1, description: 'id de la reponse (get_quiz)' },
            label: { type: 'string', maxLength: 300 },
            points: { type: 'number', minimum: 0, maximum: 4 },
            profile_id: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'quiz_id', 'item_id', 'answer_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        item_id: z.number().int().positive(),
        answer_id: z.number().int().positive(),
        label: z.string().max(300).nullable().optional(),
        points: z.number().int().min(0).max(4).optional(),
        profile_id: z.number().int().min(1).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, item_id, answer_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id, item_id, answer_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/items/${p.item_id}/answers/${p.answer_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
