/**
 * Tool `reorder_smart_join_questions` — réordonne les questions Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const reorderSmartJoinQuestionsTool = {
    name: 'reorder_smart_join_questions',
    description: "Reordonne les questions Smart Join. order est la liste des question_id dans l'ordre souhaite (tous doivent appartenir au Lab).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            order: { type: 'array', items: { type: 'number' }, minItems: 1 },
        },
        required: ['lab', 'order'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        order: z.array(z.number().int().positive()).min(1),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join/questions/reorder`, { order: p.order });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
