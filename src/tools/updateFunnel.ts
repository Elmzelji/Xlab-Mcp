/**
 * Tool `update_funnel` — modifie le nom / l'activation d'un tunnel de vente.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateFunnelTool = {
    name: 'update_funnel',
    description: "Modifie un tunnel de vente (nom, activation). funnel_id vient de get_funnel / create_funnel. Passe is_active=false pour desactiver le tunnel sans le supprimer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            funnel_id: { type: 'number' },
            name: { type: 'string', maxLength: 120 },
            is_active: { type: 'boolean' },
        },
        required: ['lab', 'funnel_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        funnel_id: z.number().int().positive(),
        name: z.string().max(120).nullable().optional(),
        is_active: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, funnel_id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/funnels/${funnel_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
