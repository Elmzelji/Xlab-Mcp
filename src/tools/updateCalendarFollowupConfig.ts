/**
 * Tool `update_calendar_followup_config` — relances automatiques des prospects.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const updateCalendarFollowupConfigTool = {
    name: 'update_calendar_followup_config',
    description: "Configure les relances automatiques des prospects du Calendrier IA (max 2). trigger_type = abandon_step1 (a quitte au formulaire) ou no_booking (n'a pas reserve). Pour chaque : enabled, delay_hours (1..720), message_template optionnel.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            configs: {
                type: 'array',
                maxItems: 2,
                items: {
                    type: 'object',
                    properties: {
                        trigger_type: { type: 'string', enum: ['abandon_step1', 'no_booking'] },
                        enabled: { type: 'boolean' },
                        delay_hours: { type: 'number', minimum: 1, maximum: 720 },
                        message_template: { type: 'string' },
                    },
                    required: ['trigger_type', 'enabled', 'delay_hours'],
                    additionalProperties: false,
                },
            },
        },
        required: ['lab', 'configs'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        configs: z.array(z.object({
            trigger_type: z.enum(['abandon_step1', 'no_booking']),
            enabled: z.boolean(),
            delay_hours: z.number().int().min(1).max(720),
            message_template: z.string().nullable().optional(),
        })).max(2),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(p.lab)}/calendar/followup-config`, { configs: p.configs });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
