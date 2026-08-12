/**
 * Tool `list_product_affiliates` — liste les affiliés d'un produit + KPIs.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const PRODUCT_TYPES = ['shop_product', 'agent_ai'] as const;

export const listProductAffiliatesTool = {
    name: 'list_product_affiliates',
    description: "Liste les affilies d'un produit (boutique ou agent IA) avec KPIs : nb de referrals, commission payee / en attente, pourcentage effectif, custom_percent, statut (approuve / revoque). Filtre optionnel status = pending | active | revoked. Pagine.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            product_type: { type: 'string', enum: [...PRODUCT_TYPES] },
            product_id: { type: 'number' },
            status: { type: 'string', enum: ['pending', 'active', 'revoked'] },
            page: { type: 'number', minimum: 1 },
            per_page: { type: 'number', minimum: 1, maximum: 100 },
        },
        required: ['lab', 'product_type', 'product_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        product_type: z.enum(PRODUCT_TYPES),
        product_id: z.number().int().positive(),
        status: z.enum(['pending', 'active', 'revoked']).optional(),
        page: z.number().int().min(1).optional(),
        per_page: z.number().int().min(1).max(100).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const qs = new URLSearchParams();
        if (p.status !== undefined) qs.set('status', p.status);
        if (p.page !== undefined) qs.set('page', String(p.page));
        if (p.per_page !== undefined) qs.set('per_page', String(p.per_page));
        const query = qs.toString() ? `?${qs.toString()}` : '';
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/products/${p.product_type}/${p.product_id}/affiliates${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
