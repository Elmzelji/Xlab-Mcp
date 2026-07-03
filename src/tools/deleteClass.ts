import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteClassTool = {
    name: 'delete_class',
    description: "Supprime une classe/cours du Lab. IMPORTANT : action destructive, demander confirmation avant d'invoquer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            class_id: { type: 'number', description: "Id de la classe (list_classes data[].id)" },
        },
        required: ['lab', 'class_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), class_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/classes/${parsed.class_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
