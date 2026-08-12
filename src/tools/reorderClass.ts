/**
 * Tool `reorder_class` — déplace un cours à une position d'affichage donnée.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const reorderClassTool = {
    name: 'reorder_class',
    description: "Deplace un cours a une position d'affichage donnee dans le Lab (0 = premier). class_id vient de list_classes.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            class_id: { type: 'number' },
            position: { type: 'number', minimum: 0, description: "Position cible (0 = premier)" },
        },
        required: ['lab', 'class_id', 'position'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        class_id: z.number().int().positive(),
        position: z.number().int().min(0),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/classes/${p.class_id}/reorder`, { position: p.position });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
