/**
 * Tool `update_smart_join_settings` — active / désactive le plug-in Smart Join.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateSmartJoinSettingsTool = {
    name: 'update_smart_join_settings',
    description: "Active ou desactive le plug-in Smart Join (pop-up de questions a l'inscription). is_active = true active le questionnaire de qualification.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            is_active: { type: 'boolean' },
        },
        required: ['lab', 'is_active'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), is_active: z.boolean() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/smart-join`, { is_active: p.is_active });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
