/**
 * Tool `update_quiz` — modifie l'accueil / l'apparence / la capture d'un quiz.
 * Scope : quiz.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateQuizTool = {
    name: 'update_quiz',
    description: "Modifie un quiz (seuls les champs fournis changent) : accueil (title, subtitle, cta_label), capture (capture_phone = demander le WhatsApp, capture_promise = promesse affichee au moment de laisser ses coordonnees, footer_note), apparence (color hex, show_progress, background_type text|image, logo_path, background_path).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            quiz_id: { type: 'number', minimum: 1, description: 'id du quiz (list_quizzes)' },
            title: { type: 'string', maxLength: 255 },
            subtitle: { type: 'string' },
            cta_label: { type: 'string', maxLength: 120 },
            capture_phone: { type: 'boolean' },
            capture_promise: { type: 'string' },
            footer_note: { type: 'string', maxLength: 255 },
            color: { type: 'string', maxLength: 16, description: 'couleur hex, ex #5A6BE3' },
            show_progress: { type: 'boolean' },
            background_type: { type: 'string', enum: ['text', 'image'] },
            logo_path: { type: 'string', maxLength: 255 },
            background_path: { type: 'string', maxLength: 255 },
        },
        required: ['lab', 'quiz_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        quiz_id: z.number().int().positive(),
        title: z.string().max(255).nullable().optional(),
        subtitle: z.string().nullable().optional(),
        cta_label: z.string().max(120).nullable().optional(),
        capture_phone: z.boolean().optional(),
        capture_promise: z.string().nullable().optional(),
        footer_note: z.string().max(255).nullable().optional(),
        color: z.string().max(16).nullable().optional(),
        show_progress: z.boolean().optional(),
        background_type: z.enum(['text', 'image']).optional(),
        logo_path: z.string().max(255).nullable().optional(),
        background_path: z.string().max(255).nullable().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, quiz_id, ...body } = this.zodSchema.parse(args);
        const p = { lab, quiz_id };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/quiz/quizzes/${p.quiz_id}`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
