/**
 * Tool `manage_product_affiliate` — approuve / revoque / restaure un affilié
 * d'un produit, ou fixe son pourcentage custom.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const PRODUCT_TYPES = ['shop_product', 'agent_ai'] as const;

export const manageProductAffiliateTool = {
    name: 'manage_product_affiliate',
    description: "Gere un affilie d'un produit. action : approve (valide une demande en attente), revoke (coupe l'affiliation), restore (annule une revocation), set_percent (fixe un pourcentage custom pour cet affilie — fournir custom_percent, ou null pour repasser au % du produit). user_id = id de l'affilie (list_product_affiliates). IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            product_type: { type: 'string', enum: [...PRODUCT_TYPES] },
            product_id: { type: 'number' },
            user_id: { type: 'number' },
            action: { type: 'string', enum: ['approve', 'revoke', 'restore', 'set_percent'] },
            custom_percent: { type: ['number', 'null'], minimum: 0, maximum: 100, description: 'Requis si action=set_percent (null = % du produit).' },
        },
        required: ['lab', 'product_type', 'product_id', 'user_id', 'action'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        product_type: z.enum(PRODUCT_TYPES),
        product_id: z.number().int().positive(),
        user_id: z.number().int().positive(),
        action: z.enum(['approve', 'revoke', 'restore', 'set_percent']),
        custom_percent: z.number().min(0).max(100).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const body: Record<string, unknown> = { action: p.action };
        if (p.action === 'set_percent') body.custom_percent = p.custom_percent ?? null;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/affiliation/products/${p.product_type}/${p.product_id}/affiliates/${p.user_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
