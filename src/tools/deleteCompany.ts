/**
 * Tool `delete_company` — supprime une societe du Marketplace (par uuid).
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const deleteCompanyTool = {
    name: 'delete_company',
    description: "Supprime une societe du Marketplace (et ses contacts). Identifiee par son uuid (list_companies). IMPORTANT : action destructive, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            uuid: { type: 'string', description: 'uuid de la societe (list_companies)' },
        },
        required: ['lab', 'uuid'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), uuid: z.string() }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(parsed.lab)}/companies/${encodeURIComponent(parsed.uuid)}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
