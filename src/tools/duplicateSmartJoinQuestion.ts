/**
 * Tool `duplicate_smart_join_question` — duplique une question Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const duplicateSmartJoinQuestionTool = {
    name: 'duplicate_smart_join_question',
    description: "Duplique une question de qualification Smart Join (sous reserve de ne pas depasser le maximum de 3). question_id vient de get_smart_join.",
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
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join/questions/${p.question_id}/duplicate`, {});
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
