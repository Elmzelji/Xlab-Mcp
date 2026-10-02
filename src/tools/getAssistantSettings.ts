/**
 * Tool `get_assistant_settings` — reglages de Lou.
 * Scope : assistant.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getAssistantSettingsTool = {
    name: 'get_assistant_settings',
    description: "Reglages de Lou, l'assistant IA du Lab (ton, langue, capacites autorisees et leur mode), entitled (abonnement XLab Agent actif), pending_count (propositions en attente) et categories du Lab (pour les posts).",
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/settings`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
