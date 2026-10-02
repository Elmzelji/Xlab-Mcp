/**
 * Tool `update_dm_sequence` — modifie le brouillon d'une sequence DM.
 * Scope : dm_sequences.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateDmSequenceTool = {
    name: 'update_dm_sequence',
    description: "Modifie le BROUILLON d'une sequence (la version en ligne ne change qu'a la publication). trigger (keyword : post_ids de list_dm_sequence_target_posts + keywords, max 10) ; goal (objectif qui arrete la sequence : reply, first_comment, lesson_completed + module_id, none ; window_days 1-90) ; config (link_url, group_shop_id) ; steps remplace toute la liste (max 8 messages : delay_seconds depuis le message precedent + body_template). Variables utilisables dans body_template : {{prenom}}, {{lab}}, {{lien}}. revision facultative.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            sequence_id: { type: 'number', minimum: 1, description: 'id de la sequence (list_dm_sequences)' },
            trigger: { type: 'object', properties: { post_ids: { type: 'array', items: { type: 'number' } }, keywords: { type: 'array', items: { type: 'string' }, maxItems: 10 } } },
            goal: { type: 'object', properties: { type: { type: 'string', enum: ['reply', 'first_comment', 'lesson_completed', 'none'] }, window_days: { type: 'number', minimum: 1, maximum: 90 }, module_id: { type: 'number' } } },
            config: { type: 'object', properties: { link_url: { type: 'string' }, group_shop_id: { type: 'number' } } },
            steps: { type: 'array', maxItems: 8, items: { type: 'object', properties: { delay_seconds: { type: 'number', minimum: 0 }, body_template: { type: 'string' } }, required: ['delay_seconds', 'body_template'] } },
            revision: { type: 'number', minimum: 1 },
        },
        required: ['lab', 'sequence_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        sequence_id: z.number().int().positive(),
        trigger: z.object({ post_ids: z.array(z.number().int()).optional(), keywords: z.array(z.string().max(60)).max(10).optional() }).optional(),
        goal: z.object({ type: z.enum(['reply', 'first_comment', 'lesson_completed', 'none']).optional(), window_days: z.number().int().min(1).max(90).optional(), module_id: z.number().int().nullable().optional() }).optional(),
        config: z.object({ link_url: z.string().max(500).nullable().optional(), group_shop_id: z.number().int().nullable().optional() }).optional(),
        steps: z.array(z.object({ delay_seconds: z.number().int().min(0), body_template: z.string() })).max(8).optional(),
        revision: z.number().int().min(1).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, sequence_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, sequence_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/dm-sequences/sequences/${p.sequence_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
