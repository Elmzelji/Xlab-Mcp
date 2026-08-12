/**
 * Tool `clear_smart_join_responses` — efface toutes les réponses Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const clearSmartJoinResponsesTool = {
    name: 'clear_smart_join_responses',
    description: "Efface TOUTES les reponses des prospects au questionnaire Smart Join du Lab. IMPORTANT : action destructive et irreversible, demander confirmation explicite.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' } },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join/responses`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
