/**
 * Tool `list_quiz_templates` — modeles de quiz par niche.
 * Scope : quiz.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listQuizTemplatesTool = {
    name: 'list_quiz_templates',
    description: "Liste les modeles de quiz par niche (key, name, available). Seuls les modeles available=true sont utilisables dans create_quiz.template.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/templates`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
