/**
 * Tool `list_members` — liste les membres d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listMembersTool = {
    name: 'list_members',
    description: "Liste les membres d'un Lab. Utilise l'id ou l'url du Lab (recupere avec list_labs). Filtre par status (approved/pending/rejected/left).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: "Id numerique OU url (group_url) du Lab" },
            status: { type: 'string', enum: ['approved', 'pending', 'rejected', 'left'], default: 'approved' },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
            offset: { type: 'number', minimum: 0, default: 0 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        status: z.enum(['approved', 'pending', 'rejected', 'left']).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members`, {
                params: {
                    status: parsed.status,
                    limit: parsed.limit,
                    offset: parsed.offset,
                },
            });
            return {
                content: [
                    { type: 'text' as const, text: JSON.stringify(data, null, 2) },
                ],
            };
        } catch (err) {
            return {
                isError: true,
                content: [{ type: 'text' as const, text: formatApiError(err) }],
            };
        }
    },
};
