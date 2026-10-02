/**
 * Tool `update_quiz_item` — modifie une question / page.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateQuizItemTool = {
    name: 'update_quiz_item',
    description: "Modifie une question ou page intermediaire (seuls les champs fournis changent). Le type (kind) ne se change pas.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            item_id: { type: 'number', minimum: 1, description: 'id de la question / page (get_quiz)' },
            title: { type: 'string', maxLength: 500 },
            body: { type: 'string' },
            image_path: { type: 'string', maxLength: 255 },
            button_label: { type: 'string', maxLength: 120 },
            key: { type: 'string', maxLength: 60 },
        },
        required: ['lab', 'quiz_id', 'item_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        item_id: z.number().int().positive(),
        title: z.string().max(500).nullable().optional(),
        body: z.string().nullable().optional(),
        image_path: z.string().max(255).nullable().optional(),
        button_label: z.string().max(120).nullable().optional(),
        key: z.string().max(60).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, item_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id, item_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/items/${p.item_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
