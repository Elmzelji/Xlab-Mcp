/**
 * Tool `get_quiz_lead` — detail d'un prospect.
 * Scope : quiz.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getQuizLeadTool = {
    name: 'get_quiz_lead',
    description: "Detail d'un prospect capture par un quiz (reponses, score, profil).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            lead_id: { type: 'number', minimum: 1, description: 'id du prospect (list_quiz_leads)' },
        },
        required: ['lab', 'quiz_id', 'lead_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        lead_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/leads/${p.lead_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
