/**
 * Tool `delete_smart_join_question` — supprime une question Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteSmartJoinQuestionTool = {
    name: 'delete_smart_join_question',
    description: "Supprime une question de qualification Smart Join. question_id vient de get_smart_join. IMPORTANT : demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            question_id: { type: 'number' },
        },
        required: ['lab', 'question_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), question_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join/questions/${p.question_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
