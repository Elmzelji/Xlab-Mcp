/**
 * Tool `manage_pixel_request` — approuve / rejette / révoque une demande de
 * Meta Pixel d'un affilié.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const managePixelRequestTool = {
    name: 'manage_pixel_request',
    description: "Gere une demande de Meta Pixel d'un affilie. action : approve (autorise l'installation du pixel sur la page A propos), reject (refuse une demande en attente), revoke (retire un pixel deja approuve). id = id de la demande (list_pixel_requests). IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            id: { type: 'number', description: 'Id de la demande (list_pixel_requests)' },
            action: { type: 'string', enum: ['approve', 'reject', 'revoke'] },
        },
        required: ['lab', 'id', 'action'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        id: z.number().int().positive(),
        action: z.enum(['approve', 'reject', 'revoke']),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/pixel-requests/${p.id}`, { action: p.action });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
