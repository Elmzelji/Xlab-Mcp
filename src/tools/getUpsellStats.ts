/**
 * Tool `get_upsell_stats` — performances de l'offre (upsell) d'une formation ou d'une programmation.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getUpsellStatsTool = {
    name: 'get_upsell_stats',
    description: "Stats de l'offre (upsell) d'une formation ou d'une programmation sur N jours : affichages, clics, ventes, conversion (ventes/affichages), chiffre d'affaires (centimes) et detail par video ou par seance, trie par ventes.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            scope: { type: 'string', enum: ['course', 'program'] },
            id: { type: 'number', description: 'Id de la formation ou de la programmation' },
            days: { type: 'number', minimum: 1, maximum: 365, description: 'Fenetre en jours (defaut 30)' },
        },
        required: ['lab', 'scope', 'id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        scope: z.enum(['course', 'program']),
        id: z.number().int().positive(),
        days: z.number().int().min(1).max(365).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const query = p.days !== undefined ? `?days=${p.days}` : '';
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/upsell-offers/${p.scope}/${p.id}/stats${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
