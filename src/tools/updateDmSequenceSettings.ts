/**
 * Tool `update_dm_sequence_settings` — modifie les reglages Sequences DM.
 * Scope : dm_sequences.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateDmSequenceSettingsTool = {
    name: 'update_dm_sequence_settings',
    description: "Modifie les reglages Sequences DM (seuls les champs fournis changent). revision est facultative (la revision courante est utilisee par defaut). Desactiver le plug-in met en pause toutes les inscriptions en cours.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            enabled: { type: 'boolean' },
            timezone: { type: 'string', maxLength: 64, description: 'ex Europe/Paris' },
            window_start: { type: 'string', maxLength: 5, description: 'HH:MM' },
            window_end: { type: 'string', maxLength: 5, description: 'HH:MM, apres window_start' },
            member_daily_cap: { type: 'number', minimum: 1, maximum: 20 },
            revision: { type: 'number', minimum: 1 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enabled: z.boolean().optional(),
        timezone: z.string().max(64).nullable().optional(),
        window_start: z.string().max(5).nullable().optional(),
        window_end: z.string().max(5).nullable().optional(),
        member_daily_cap: z.number().int().min(1).max(20).optional(),
        revision: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/settings`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
