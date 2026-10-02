/**
 * Tool `set_quiz_published` — publie / depublie un quiz.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setQuizPublishedTool = {
    name: 'set_quiz_published',
    description: "Publie (published=true) ou repasse en brouillon (published=false) un quiz. Publication refusee si : moins de 5 questions, moins de 2 profils, ou un profil qu'aucune reponse notee ne permet d'atteindre. Le plug-in Quiz doit aussi etre active pour que le quiz soit public.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            published: { type: 'boolean' },
        },
        required: ['lab', 'quiz_id', 'published'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        published: z.boolean(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/${p.published ? 'publish' : 'unpublish'}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
