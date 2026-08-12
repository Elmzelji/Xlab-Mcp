/**
 * Tool `add_smart_join_question` — ajoute une question Smart Join (max 3).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const TYPES = ['email', 'short_text', 'long_text', 'phone', 'number', 'single_choice', 'multiple_choice'] as const;

export const addSmartJoinQuestionTool = {
    name: 'add_smart_join_question',
    description: "Ajoute une question de qualification Smart Join (max 3 par Lab). type = email | short_text | long_text | phone | number | single_choice | multiple_choice. Pour single_choice / multiple_choice, fournis options (liste de libelles).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            label: { type: 'string', maxLength: 500 },
            type: { type: 'string', enum: [...TYPES] },
            options: { type: 'array', items: { type: 'string' }, description: 'Requis pour single_choice / multiple_choice' },
        },
        required: ['lab', 'label', 'type'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        label: z.string().min(1).max(500),
        type: z.enum(TYPES),
        options: z.array(z.string()).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, ...body } = p;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/smart-join/questions`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
