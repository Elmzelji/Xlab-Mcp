/**
 * Tool `list_pixel_requests` — demandes d'installation de Meta Pixel par les
 * affiliés du Lab (sur la page À propos).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPixelRequestsTool = {
    name: 'list_pixel_requests',
    description: "Liste les demandes d'installation de Meta Pixel envoyees par les affilies du Lab (pour retargeter les visiteurs qu'ils envoient). Filtre optionnel status = pending | approved | rejected | revoked. Pagine.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'revoked'] },
            page: { type: 'number', minimum: 1 },
            per_page: { type: 'number', minimum: 1, maximum: 100 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        status: z.enum(['pending', 'approved', 'rejected', 'revoked']).optional(),
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
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/pixel-requests${query}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
