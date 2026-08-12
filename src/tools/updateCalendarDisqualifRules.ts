/**
 * Tool `update_calendar_disqualif_rules` — règles de disqualification des leads.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarDisqualifRulesTool = {
    name: 'update_calendar_disqualif_rules',
    description: "Remplace les regles de disqualification automatique des leads du Calendrier IA. rules est le jeu complet de regles : condition_type = phone_country (indicatif telephonique) ou question_answer (reponse a une question, question_id requis), disqualifying_values = valeurs qui disqualifient. Envoyer un tableau vide efface toutes les regles.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            rules: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        condition_type: { type: 'string', enum: ['phone_country', 'question_answer'] },
                        question_id: { type: ['number', 'null'], description: 'Requis si condition_type=question_answer' },
                        disqualifying_values: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['condition_type'],
                    additionalProperties: false,
                },
            },
        },
        required: ['lab', 'rules'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        rules: z.array(z.object({
            condition_type: z.enum(['phone_country', 'question_answer']),
            question_id: z.number().int().positive().nullable().optional(),
            disqualifying_values: z.array(z.string()).optional(),
        })),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/disqualif-rules`, { rules: p.rules });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
