import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const setWelcomeDmTool = {
    name: 'set_welcome_dm',
    description: "Configure le DM de bienvenue envoye automatiquement aux nouveaux membres. Champs optionnels : n'envoie que ce que tu veux changer.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            enabled: { type: 'boolean' },
            title: { type: 'string', maxLength: 500 },
            text: { type: 'string' },
            cta_text: { type: 'string', maxLength: 255 },
            cta_url: { type: 'string', maxLength: 255 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enabled: z.boolean().optional(),
        title: z.string().max(500).nullable().optional(),
        text: z.string().nullable().optional(),
        cta_text: z.string().max(255).nullable().optional(),
        cta_url: z.string().max(255).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/plugins/welcome-dm`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
