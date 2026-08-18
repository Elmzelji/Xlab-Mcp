/**
 * Tool `toggle_company_visibility` — publie / masque une société du Marketplace.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const toggleCompanyVisibilityTool = {
    name: 'toggle_company_visibility',
    description: "Publie ou masque une societe du Marketplace sans la supprimer. Par defaut bascule l'etat courant ; passe is_published (true = publiee/visible, false = masquee/brouillon) pour forcer une valeur. uuid vient de list_companies (qui renvoie is_published).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            uuid: { type: 'string', description: 'uuid de la societe (list_companies)' },
            is_published: { type: 'boolean', description: 'Optionnel : force la valeur (sinon bascule).' },
        },
        required: ['lab', 'uuid'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        uuid: z.string(),
        is_published: z.boolean().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        const body = p.is_published !== undefined ? { is_published: p.is_published } : {};
        try {
            const { data } = await http.patch(`/mcp/labs/${encodeURIComponent(p.lab)}/companies/${encodeURIComponent(p.uuid)}/visibility`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
