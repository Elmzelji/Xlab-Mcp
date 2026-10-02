/**
 * Tool `update_quiz_settings` — active / desactive le plug-in Quiz.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateQuizSettingsTool = {
    name: 'update_quiz_settings',
    description: "Active ou desactive le plug-in Quiz du Lab. Desactive, plus aucun quiz n'est accessible publiquement (meme publie).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            enabled: { type: 'boolean' },
        },
        required: ['lab', 'enabled'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enabled: z.boolean(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/settings`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
