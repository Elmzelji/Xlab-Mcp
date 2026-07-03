/**
 * Tool `get_earnings` — snapshot revenus d'un Lab (source : members_payouts).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const getEarningsTool = {
    name: 'get_earnings',
    description: "Snapshot revenus d'un Lab payant. Renvoie MTD (mois en cours), mois precedent, YTD, all-time, ainsi que le nombre d'abonnes actifs. Devise EUR.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/earnings`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
