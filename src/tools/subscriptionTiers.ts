/**
 * Formules d'abonnement d'un Lab payant (1 a 3) : creer, modifier, retirer.
 * La liste des formules et des contenus a inclure (tier_catalog) est renvoyee
 * par get_subscription_settings.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const itemSchema = z.object({
    type: z.enum(['course', 'coaching_program', 'newsletter', 'podcast', 'shop']),
    id: z.number().int().positive(),
});

const tierFields = {
    name: { type: 'string', description: 'Nom de la formule (ex. Standard, Premium, VIP), 60 caracteres max.' },
    amount: { type: 'number', minimum: 1, description: 'Prix mensuel en euros (ex 29.90). Pas d abonnement annuel.' },
    description: { type: 'string', description: 'Phrase courte affichee sous le prix (facultatif).' },
    trial_days: { type: 'number', enum: [0, 3, 7, 14, 30], description: "Jours d'essai gratuit (0 = sans essai)." },
    includes_all: { type: 'boolean', description: 'true = tous les contenus du Lab sont inclus.' },
    items: {
        type: 'array',
        description: "Contenus inclus : [{type, id}] avec type parmi course, coaching_program, newsletter, podcast (id = id du Lab), shop. Ids donnes par get_subscription_settings.tier_catalog.",
        items: {
            type: 'object',
            properties: { type: { type: 'string' }, id: { type: 'number' } },
            required: ['type', 'id'],
        },
    },
};

const tierZod = z.object({
    lab: z.string(),
    name: z.string().min(1).max(60),
    amount: z.number().min(1),
    description: z.string().max(300).optional(),
    trial_days: z.union([z.literal(0), z.literal(3), z.literal(7), z.literal(14), z.literal(30)]).optional(),
    includes_all: z.boolean().optional(),
    items: z.array(itemSchema).optional(),
});

async function send(method: 'post' | 'put', path: string, body: Record<string, unknown>) {
    try {
        const { data } = await http[method](path, body);
        return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
    } catch (err) {
        return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
    }
}

export const createSubscriptionTierTool = {
    name: 'create_subscription_tier',
    description: "Cree une formule d'abonnement pour un Lab payant (3 max). Le prix du Lab suit la formule la moins chere ; la premiere formule rend le Lab payant (les membres deja la ont 14 jours pour s'abonner). Exige un Lab prive et le Stripe de l'owner configure. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, ...tierFields },
        required: ['lab', 'name', 'amount'],
        additionalProperties: false,
    },
    zodSchema: tierZod,
    async handler(args: Record<string, unknown>) {
        const { lab, ...body } = this.zodSchema.parse(args);
        return send('post', `/mcp/labs/${encodeURIComponent(lab)}/subscriptions/tiers`, body);
    },
};

export const updateSubscriptionTierTool = {
    name: 'update_subscription_tier',
    description: "Modifie une formule d'abonnement (memes champs que la creation, tous a renvoyer). Un nouveau prix vaut pour les nouveaux abonnes : les abonnes actuels gardent le leur. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, tier_id: { type: 'number' }, ...tierFields },
        required: ['lab', 'tier_id', 'name', 'amount'],
        additionalProperties: false,
    },
    zodSchema: tierZod.extend({ tier_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const { lab, tier_id, ...body } = this.zodSchema.parse(args);
        return send('put', `/mcp/labs/${encodeURIComponent(lab)}/subscriptions/tiers/${tier_id}`, body);
    },
};

export const archiveSubscriptionTierTool = {
    name: 'archive_subscription_tier',
    description: "Retire une formule de la vente. Ses abonnes la gardent, avec ses contenus, tant qu'ils ne changent pas de formule. Retirer la derniere formule = le Lab ne vend plus l'acces. IMPORTANT : action ecriture, demander confirmation.",
    inputSchema: {
        type: 'object' as const,
        properties: { lab: { type: 'string' }, tier_id: { type: 'number' } },
        required: ['lab', 'tier_id'],
        additionalProperties: false,
    },
    zodSchema: z.object({ lab: z.string(), tier_id: z.number().int().positive() }),
    async handler(args: Record<string, unknown>) {
        const p = this.zodSchema.parse(args);
        try {
            const { data } = await http.delete(`/mcp/labs/${encodeURIComponent(p.lab)}/subscriptions/tiers/${p.tier_id}`);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
