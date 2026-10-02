/**
 * Tool `create_quiz_answer` — ajoute une reponse a une question.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createQuizAnswerTool = {
    name: 'create_quiz_answer',
    description: "Ajoute une reponse a une question (max 8). points (0 a 4) sont credites au profil profile_id : le profil qui cumule le plus de points devient le resultat du prospect. Un profil doit etre atteignable par au moins une reponse notee pour pouvoir publier.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            item_id: { type: 'number', minimum: 1, description: 'id de la question / page (get_quiz)' },
            label: { type: 'string', maxLength: 300 },
            points: { type: 'number', minimum: 0, maximum: 4 },
            profile_id: { type: 'number', minimum: 1, description: 'profil credite par cette reponse' },
        },
        required: ['lab', 'quiz_id', 'item_id', 'label'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        item_id: z.number().int().positive(),
        label: z.string().max(300),
        points: z.number().int().min(0).max(4).optional(),
        profile_id: z.number().int().min(1).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, item_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id, item_id };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/items/${p.item_id}/answers`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
