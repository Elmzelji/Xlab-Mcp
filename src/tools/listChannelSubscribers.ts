import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const listChannelSubscribersTool = {
    name: 'list_channel_subscribers',
    description: "Liste les abonnes actuels aux canaux payants (Telegram / Discord / WhatsApp) du Lab. Provider filtrable, status filtrable (active/pending_kick/kicked).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            provider: { type: 'string', enum: ['telegram', 'discord', 'whatsapp'] },
            status: { type: 'string', enum: ['active', 'pending_kick', 'kicked'] },
            limit: { type: 'number', minimum: 1, maximum: 200 },
        },
        required: ['lab'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        provider: z.enum(['telegram', 'discord', 'whatsapp']).optional(),
        status: z.enum(['active', 'pending_kick', 'kicked']).optional(),
        limit: z.number().int().min(1).max(200).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/channel-subscribers`, {
                params: { provider: p.provider, status: p.status, limit: p.limit },
            });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
