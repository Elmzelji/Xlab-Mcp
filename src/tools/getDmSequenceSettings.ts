/**
 * Tool `get_dm_sequence_settings` — reglages du plug-in Sequences DM.
 * Scope : dm_sequences.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getDmSequenceSettingsTool = {
    name: 'get_dm_sequence_settings',
    description: "Reglages du plug-in Sequences DM : enabled, timezone, fenetre d'envoi (window_start / window_end HH:MM), member_daily_cap (DM max par membre et par jour), revision. auto_dm_active indique si l'ancien \"Auto DM\" de bienvenue est actif en parallele.",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/settings`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
