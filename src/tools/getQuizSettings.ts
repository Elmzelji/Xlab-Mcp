/**
 * Tool `get_quiz_settings` — etat du plug-in Quiz du Lab.
 * Scope : quiz.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getQuizSettingsTool = {
    name: 'get_quiz_settings',
    description: "Etat du plug-in Quiz pour le Lab (enabled). Un quiz n'est joignable publiquement que si le plug-in est active ET le quiz publie.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/settings`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
