/**
 * Tool `get_assistant_summary` — resume de l'activite de Lou.
 * Scope : assistant.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getAssistantSummaryTool = {
    name: 'get_assistant_summary',
    description: "Resume de l'activite de Lou sur une periode (from / to, YYYY-MM-DD) : propositions, validations, envois automatiques, ventes generees.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            from: { type: 'string', description: 'YYYY-MM-DD' },
            to: { type: 'string', description: 'YYYY-MM-DD' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        from: z.string().nullable().optional(),
        to: z.string().nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { from, to } = p;
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/summary`, { params: { from, to } });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
