/**
 * Tool `update_assistant_settings` — modifie les reglages de Lou.
 * Scope : assistant.write.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateAssistantSettingsTool = {
    name: 'update_assistant_settings',
    description: "Modifie les reglages de Lou (seuls les champs fournis changent). Chaque capacite allow_* a souvent un mode : draft (Lou propose, l'owner valide), assisted (Lou envoie seule les cas surs), autopilot (Lou envoie seule). Activer Lou (enabled=true) exige l'abonnement XLab Agent. Changer un mode remet son compteur de confiance a zero.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'group_url ou id du Lab' },
            enabled: { type: 'boolean' },
            language: { type: 'string', maxLength: 8 },
            tone_preset: { type: 'string', enum: ['friendly', 'professional', 'casual', 'enthusiastic', 'formal'] },
            tone_instructions: { type: 'string', maxLength: 1000 },
            allow_comment_replies: { type: 'boolean' },
            comment_reply_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_dm_replies: { type: 'boolean' },
            dm_reply_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_course_question_replies: { type: 'boolean' },
            course_question_reply_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_sales_question_replies: { type: 'boolean' },
            sales_question_reply_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_sequence_replies: { type: 'boolean' },
            sequence_reply_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_comment_sales_pitch: { type: 'boolean' },
            comment_sales_pitch_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_course_sales_pitch: { type: 'boolean' },
            course_sales_pitch_mode: { type: 'string', enum: ['draft', 'assisted', 'autopilot'] },
            allow_post_drafts: { type: 'boolean' },
            allow_sales_dms: { type: 'boolean' },
            allow_milestone_offers: { type: 'boolean' },
            allow_product_suggestions: { type: 'boolean' },
            weekly_recap_enabled: { type: 'boolean' },
            morning_brief_enabled: { type: 'boolean' },
            morning_brief_hour: { type: 'number', minimum: 0, maximum: 23 },
            allow_freeform_commands: { type: 'boolean' },
            sales_dm_cooldown_days: { type: 'number', minimum: 1, maximum: 365 },
            sales_dm_daily_cap: { type: 'number', minimum: 1, maximum: 100 },
            daily_proposal_cap: { type: 'number', minimum: 1, maximum: 200 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        enabled: z.boolean().optional(),
        language: z.string().max(8).nullable().optional(),
        tone_preset: z.enum(['friendly', 'professional', 'casual', 'enthusiastic', 'formal']).optional(),
        tone_instructions: z.string().max(1000).nullable().optional(),
        allow_comment_replies: z.boolean().optional(),
        comment_reply_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_dm_replies: z.boolean().optional(),
        dm_reply_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_course_question_replies: z.boolean().optional(),
        course_question_reply_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_sales_question_replies: z.boolean().optional(),
        sales_question_reply_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_sequence_replies: z.boolean().optional(),
        sequence_reply_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_comment_sales_pitch: z.boolean().optional(),
        comment_sales_pitch_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_course_sales_pitch: z.boolean().optional(),
        course_sales_pitch_mode: z.enum(['draft', 'assisted', 'autopilot']).optional(),
        allow_post_drafts: z.boolean().optional(),
        allow_sales_dms: z.boolean().optional(),
        allow_milestone_offers: z.boolean().optional(),
        allow_product_suggestions: z.boolean().optional(),
        weekly_recap_enabled: z.boolean().optional(),
        morning_brief_enabled: z.boolean().optional(),
        morning_brief_hour: z.number().int().min(0).max(23).optional(),
        allow_freeform_commands: z.boolean().optional(),
        sales_dm_cooldown_days: z.number().int().min(1).max(365).optional(),
        sales_dm_daily_cap: z.number().int().min(1).max(100).optional(),
        daily_proposal_cap: z.number().int().min(1).max(200).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        const p = { lab };
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/assistant/settings`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
