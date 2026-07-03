/**
 * Tool `list_posts` — liste les posts d'un Lab.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listPostsTool = {
    name: 'list_posts',
    description: "Liste les posts d'un Lab (les plus recents d'abord). Option `pinned_only: true` pour ne renvoyer que les posts epingles.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: "Id ou url du Lab" },
            limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
            offset: { type: 'number', minimum: 0, default: 0 },
            pinned_only: { type: 'boolean', default: false },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        pinned_only: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(parsed.lab)}/posts`, {
                params: {
                    limit: parsed.limit,
                    offset: parsed.offset,
                    pinned: parsed.pinned_only ? '1' : undefined,
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
