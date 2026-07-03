import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listClassesTool = {
    name: 'list_classes',
    description: "Liste les classes/cours d'un Lab.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string', description: 'Id ou url du Lab' } },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/classes`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
