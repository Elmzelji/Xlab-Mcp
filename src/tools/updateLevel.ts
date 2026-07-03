import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateLevelTool = {
    name: 'update_level',
    description: "Renomme un niveau XP ou modifie le seuil de points requis pour l'atteindre. Champs optionnels.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            level_id: { type: 'number' },
            name: { type: 'string', maxLength: 255 },
            points_threshold: { type: 'number', minimum: 0 },
        },
        required: ['lab', 'level_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        level_id: z.number().int().positive(),
        name: z.string().max(255).optional(),
        points_threshold: z.number().int().min(0).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, level_id, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/levels/${level_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
