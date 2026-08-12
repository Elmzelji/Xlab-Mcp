/**
 * Tool `get_smart_join` — config Smart Join (questions de qualification) d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getSmartJoinTool = {
    name: 'get_smart_join',
    description: "Lit la config du plug-in Smart Join d'un Lab : actif ou non + les questions de qualification (max 3) posees aux prospects avant l'adhesion.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
