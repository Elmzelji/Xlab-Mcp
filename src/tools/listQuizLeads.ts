/**
 * Tool `list_quiz_leads` — prospects captures par un quiz.
 * Scope : quiz.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listQuizLeadsTool = {
    name: 'list_quiz_leads',
    description: "Liste paginee des prospects captures par un quiz (coordonnees, score, profil obtenu). Filtres : profile_id, source, tourist (visiteur hors cible), date_from / date_to (YYYY-MM-DD).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            profile_id: { type: 'number', minimum: 1 },
            source: { type: 'string', maxLength: 60 },
            tourist: { type: 'boolean' },
            date_from: { type: 'string', description: 'YYYY-MM-DD' },
            date_to: { type: 'string', description: 'YYYY-MM-DD' },
            per_page: { type: 'number', minimum: 1, maximum: 100 },
            page: { type: 'number', minimum: 1, description: 'page (pagination)' },
        },
        required: ['lab', 'quiz_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        profile_id: z.number().int().min(1).optional(),
        source: z.string().max(60).nullable().optional(),
        tourist: z.boolean().optional(),
        date_from: z.string().nullable().optional(),
        date_to: z.string().nullable().optional(),
        per_page: z.number().int().min(1).max(100).optional(),
        page: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { profile_id, source, tourist, date_from, date_to, per_page, page } = p;
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/leads`, { params: { profile_id, source, tourist, date_from, date_to, per_page, page } });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
