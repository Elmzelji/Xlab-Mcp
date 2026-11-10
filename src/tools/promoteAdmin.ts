import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const promoteAdminTool = {
    name: 'promote_admin',
    description: "Promeut un membre en admin (type 'basic' -> 'admin'). Un admin peut moderer, poster, gerer les autres membres. Idempotent. Un super-admin ne peut pas etre modifie via MCP. Lab payant : access_offered (true par defaut) offre l'acces (il ne paie plus, son abonnement s'arrete en fin de periode) ; false = il paie son acces.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            member_id: { type: 'number' },
            access_offered: { type: 'boolean', description: "Lab payant : acces offert a ce membre de l'equipe (defaut true)." },
        },
        required: ['lab', 'member_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), member_id: z.number().int().positive(), access_offered: z.boolean().optional() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const body = parsed.access_offered === undefined ? undefined : { access_offered: parsed.access_offered };
            const { data } = await http.put(`/mcp/labs/${encodeURIComponent(parsed.lab)}/members/${parsed.member_id}/promote`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
