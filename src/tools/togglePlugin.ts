import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const togglePluginTool = {
    name: 'toggle_plugin',
    description: "Active ou desactive un plug-in par son meta_type. Valeurs typiques : 'facebook' (Meta Pixel), 'google' (Google Ads).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            meta_type: { type: 'string', description: 'facebook | google | ...' },
            enabled: { type: 'boolean' },
        },
        required: ['lab', 'meta_type', 'enabled'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), meta_type: z.string(), enabled: z.boolean() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(
                `/mcp/labs/${encodeURIComponent(parsed.lab)}/plugins/${encodeURIComponent(parsed.meta_type)}/toggle`,
                { enabled: parsed.enabled }
            );
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
