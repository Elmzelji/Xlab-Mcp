/**
 * Tool `list_lab_affiliates` — liste les affiliés du Lab (niveau Lab) + KPIs.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listLabAffiliatesTool = {
    name: 'list_lab_affiliates',
    description: "Liste les membres qui promeuvent le Lab (affiliation lab-level) avec KPIs : nb de filleuls, commission payee / en attente, pourcentage effectif, custom_percent, revoque ?. Pagine.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            page: { type: 'number', minimum: 1 },
            per_page: { type: 'number', minimum: 1, maximum: 100 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        page: z.number().int().min(1).optional(),
        per_page: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const qs = new URLSearchParams();
        if (p.page !== undefined) qs.set('page', String(p.page));
        if (p.per_page !== undefined) qs.set('per_page', String(p.per_page));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/lab/affiliates${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
