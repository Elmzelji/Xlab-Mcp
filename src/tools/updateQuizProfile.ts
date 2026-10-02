/**
 * Tool `update_quiz_profile` — modifie un profil de resultat.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateQuizProfileTool = {
    name: 'update_quiz_profile',
    description: "Modifie un profil de resultat (seuls les champs fournis changent). Memes champs que create_quiz_profile.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            profile_id: { type: 'number', minimum: 1, description: 'id du profil de resultat (get_quiz)' },
            name: { type: 'string', maxLength: 120 },
            color: { type: 'string', maxLength: 16 },
            diagnosis: { type: 'string' },
            video_url: { type: 'string', maxLength: 500 },
            plan: { type: 'array', maxItems: 5, items: { type: 'object', properties: { text: { type: 'string' }, locked: { type: 'boolean' } }, required: ['text', 'locked'] } },
            cta_label: { type: 'string', maxLength: 120 },
            destination_type: { type: 'string', enum: ['product', 'join', 'calendar', 'url'] },
            destination_ref: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'quiz_id', 'profile_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        profile_id: z.number().int().positive(),
        name: z.string().max(120).nullable().optional(),
        color: z.string().max(16).nullable().optional(),
        diagnosis: z.string().nullable().optional(),
        video_url: z.string().max(500).nullable().optional(),
        plan: z.array(z.object({ text: z.string(), locked: z.boolean() })).max(5).nullable().optional(),
        cta_label: z.string().max(120).nullable().optional(),
        destination_type: z.enum(['product', 'join', 'calendar', 'url']).optional(),
        destination_ref: z.string().max(255).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, profile_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id, profile_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}/profiles/${p.profile_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
