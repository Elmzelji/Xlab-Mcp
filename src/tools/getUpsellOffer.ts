/**
 * Tool `get_upsell_offer` — offre (upsell) sous les videos d'une formation ou
 * sous les seances d'une programmation : reglages, produits proposables, stats 30 j.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getUpsellOfferTool = {
    name: 'get_upsell_offer',
    description: "Offre (upsell) sous les videos d'une formation (scope course, id = cours de list_classes) ou sous les seances d'une programmation (scope program) : reglages, produits proposables (products, bonus_products) et stats 30 j.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            scope: { type: 'string', enum: ['course', 'program'], description: 'course = formation (Classe), program = programmation' },
            id: { type: 'number', description: 'Id de la formation ou de la programmation' },
        },
        required: ['lab', 'scope', 'id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        scope: z.enum(['course', 'program']),
        id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/upsell-offers/${p.scope}/${p.id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
