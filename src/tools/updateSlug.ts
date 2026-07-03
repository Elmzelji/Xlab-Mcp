import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateSlugTool = {
    name: 'update_slug',
    description: "Change l'URL (slug) publique du Lab. Cooldown 30j entre 2 changements. IMPORTANT : les anciennes URLs partagees ne fonctionneront plus.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            new_slug: { type: 'string', pattern: '^[a-zA-Z0-9_-]+$', description: 'Nouveau slug (alphanumeric + tirets/underscores)' },
        },
        required: ['lab', 'new_slug'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        new_slug: z.string().max(255).regex(/^[a-zA-Z0-9_-]+$/),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/slug`, { new_slug: p.new_slug }); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
