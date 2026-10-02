/**
 * Tool `request_assistant_post_draft` — demande un brouillon de post a Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const requestAssistantPostDraftTool = {
    name: 'request_assistant_post_draft',
    description: "Demande a Lou un brouillon de post (kind : announcement, discussion_starter, weekly_recap ; topic optionnel). Le brouillon arrive dans les propositions (list_assistant_actions) : rien n'est publie sans validation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            kind: { type: 'string', enum: ['announcement', 'discussion_starter', 'weekly_recap'] },
            topic: { type: 'string', maxLength: 500 },
            category_id: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'kind'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        kind: z.enum(['announcement', 'discussion_starter', 'weekly_recap']),
        topic: z.string().max(500).nullable().optional(),
        category_id: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/drafts/post`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
