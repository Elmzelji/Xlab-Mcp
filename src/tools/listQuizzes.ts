/**
 * Tool `list_quizzes` — quiz du Lab.
 * Scope : quiz.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listQuizzesTool = {
    name: 'list_quizzes',
    description: "Liste les quiz du Lab : id, slug, title, status (draft/published), public_key (lien public /quiz/{public_key}), question_count, leads_count.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
