/**
 * Tool `create_quiz` — cree un quiz (brouillon).
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createQuizTool = {
    name: 'create_quiz',
    description: "Cree un quiz en brouillon. slug unique dans le Lab (lettres, chiffres, - et _). template optionnel (key d'un modele available de list_quiz_templates) : pre-remplit questions, reponses et profils. Ensuite : create_quiz_item / create_quiz_answer / create_quiz_profile puis set_quiz_published.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            slug: { type: 'string', maxLength: 80, description: 'identifiant URL (alpha_dash)' },
            title: { type: 'string', maxLength: 255 },
            template: { type: 'string', description: 'key d\'un modele (list_quiz_templates)' },
        },
        required: ['lab', 'slug', 'title'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        slug: z.string().max(80),
        title: z.string().max(255),
        template: z.string().nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
