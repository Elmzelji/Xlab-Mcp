/**
 * Tool `list_assistant_actions` — propositions de Lou.
 * Scope : assistant.read.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listAssistantActionsTool = {
    name: 'list_assistant_actions',
    description: "Liste paginee des propositions de Lou (reponses a des commentaires / DM, brouillons de posts, DM de vente...). Filtre status=proposed pour celles qui attendent une validation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            status: { type: 'string', enum: ['proposed', 'executed', 'rejected', 'expired', 'failed', 'scheduled'] },
            type: { type: 'string', enum: ['comment_reply', 'post_draft', 'sales_dm', 'dm_reply', 'course_question', 'sales_question', 'sequence_reply', 'comment_sales_pitch', 'course_sales_pitch', 'milestone_offer', 'product_suggestion'] },
            per_page: { type: 'number', minimum: 1, maximum: 50 },
            page: { type: 'number', minimum: 1, description: 'page (pagination)' },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        status: z.enum(['proposed', 'executed', 'rejected', 'expired', 'failed', 'scheduled']).optional(),
        type: z.enum(['comment_reply', 'post_draft', 'sales_dm', 'dm_reply', 'course_question', 'sales_question', 'sequence_reply', 'comment_sales_pitch', 'course_sales_pitch', 'milestone_offer', 'product_suggestion']).optional(),
        per_page: z.number().int().min(1).max(50).optional(),
        page: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const { status, type, per_page, page } = p;
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/actions`, { params: { status, type, per_page, page } });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
