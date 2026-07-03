import { z } from 'zod';
import { http, formatApiError } from '../http.js';

export const newsletterDashboardTool = {
    name: 'newsletter_dashboard',
    description: "Snapshot du plug-in Newsletter d'un Lab : abonnes (total/premium/free), editions (total/sent/draft/scheduled), etat actif.",
    inputSchema: { type: 'object' as const, properties: { lab: { type: 'string' } }, required: ['lab'], additionalProperties: false },
    zodSchema: z.object({ lab: z.string() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try { const { data } = await http.get(`/mcp/labs/${encodeURIComponent(p.lab)}/newsletter/dashboard`); return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] }; }
        catch (err) { return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] }; }
    },
};
