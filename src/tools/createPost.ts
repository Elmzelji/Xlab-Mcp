/**
 * Tool `create_post` — cree un post dans un Lab. Necessite un category_id
 * valide (recupere via list_categories).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const createPostTool = {
    name: 'create_post',
    description: "Cree un nouveau post dans un Lab. Le body peut etre du texte simple (sera wrappe en <p>) ou du HTML. Necessite un category_id valide — utilise list_categories pour l'obtenir.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string', description: 'Id ou url du Lab' },
            title: { type: 'string', description: 'Titre du post (max 255 char)' },
            body: { type: 'string', description: 'Contenu du post — texte ou HTML' },
            category_id: { type: 'number', description: "Id d'une categorie du Lab (list_categories)" },
        },
        required: ['lab', 'title', 'body', 'category_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        category_id: z.number().int().positive(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(parsed.lab)}/posts`, {
                title: parsed.title,
                body: parsed.body,
                category_id: parsed.category_id,
            });
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
