/**
 * Tool `update_product_affiliation_config` — active/configure l'affiliation
 * d'un produit (boutique ou agent IA).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const PRODUCT_TYPES = ['shop_product', 'agent_ai'] as const;

export const updateProductAffiliationConfigTool = {
    name: 'update_product_affiliation_config',
    description: "Active / configure l'affiliation d'un produit (boutique ou agent IA custom). enabled = activer, percent = commission % reversee a l'affilie, visibility = qui peut devenir affilie (members_only = membres approuves, open = tout utilisateur connecte, approval_required = sur validation manuelle).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            product_type: { type: 'string', enum: [...PRODUCT_TYPES] },
            product_id: { type: 'number' },
            affiliation_enabled: { type: 'boolean' },
            affiliation_percent: { type: 'number', minimum: 0, maximum: 100 },
            affiliation_visibility: { type: 'string', enum: ['members_only', 'open', 'approval_required'] },
        },
        required: ['lab', 'product_type', 'product_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        product_type: z.enum(PRODUCT_TYPES),
        product_id: z.number().int().positive(),
        affiliation_enabled: z.boolean().optional(),
        affiliation_percent: z.number().min(0).max(100).optional(),
        affiliation_visibility: z.enum(['members_only', 'open', 'approval_required']).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { lab, product_type, product_id, ...body } = p;
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(lab)}/affiliation/products/${product_type}/${product_id}/config`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
