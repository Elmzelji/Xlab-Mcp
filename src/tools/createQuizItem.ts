/**
 * Tool `create_quiz_item` — ajoute une question ou une page intermediaire.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createQuizItemTool = {
    name: 'create_quiz_item',
    description: "Ajoute en fin de quiz une question (kind=question, QCM : ajouter ensuite ses reponses avec create_quiz_answer, max 8) ou une page intermediaire (kind=interstitial : texte + bouton, sans reponse).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            kind: { type: 'string', enum: ['question', 'interstitial'] },
            title: { type: 'string', maxLength: 500 },
            body: { type: 'string' },
            image_path: { type: 'string', maxLength: 255 },
            button_label: { type: 'string', maxLength: 120, description: 'texte du bouton (page intermediaire)' },
            key: { type: 'string', maxLength: 60, description: 'identifiant technique optionnel (alpha_dash)' },
        },
        required: ['lab', 'quiz_id', 'kind', 'title'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        kind: z.enum(['question', 'interstitial']),
        title: z.string().max(500),
        body: z.string().nullable().optional(),
        image_path: z.string().max(255).nullable().optional(),
        button_label: z.string().max(120).nullable().optional(),
        key: z.string().max(60).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/items`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
