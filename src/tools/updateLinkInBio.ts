/**
 * Tool `update_link_in_bio` — upsert des meta de la page (slug, display_name,
 * bio, theme, layout, socials, URLs de photos). Si la page n'existe pas
 * encore, elle est creee. Tous les champs sont optionnels : on ne modifie
 * que ce qui est fourni.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SOCIAL_KEYS = ['instagram', 'tiktok', 'youtube', 'x', 'linkedin', 'facebook', 'whatsapp', 'telegram'] as const;

export const updateLinkInBioTool = {
    name: 'update_link_in_bio',
    description:
        "Upsert (remplacement) de la page Link in Bio. Cree la page si absente. C'est un upsert COMPLET : tu dois TOUJOURS fournir slug, display_name, photo_layout et theme (fais get_link_in_bio d'abord pour recuperer les valeurs actuelles, puis renvoie-les avec tes modifs). Autres champs : bio, accent_color (#RRGGBB), desktop_layout (split/centered), avatar_url, banner_url, portrait_url, socials{instagram, tiktok, youtube, x, linkedin, facebook, whatsapp, telegram}. theme = light | dark | violet | yellow. photo_layout = avatar | banner | portrait. Les uploads d'images (avatar/banniere) se font via le front — ici on passe des URLs. Attention : changer le slug a un cooldown de 30 jours.",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            slug: { type: 'string', minLength: 3, maxLength: 60, description: 'minuscule, ^[a-z][a-z0-9_-]{2,59}$' },
            display_name: { type: 'string', maxLength: 100 },
            bio: { type: 'string', maxLength: 500 },
            theme: { type: 'string', enum: ['light', 'dark', 'violet', 'yellow'] },
            accent_color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            photo_layout: { type: 'string', enum: ['avatar', 'banner', 'portrait'] },
            desktop_layout: { type: 'string', enum: ['split', 'centered'] },
            avatar_url: { type: 'string' },
            banner_url: { type: 'string' },
            portrait_url: { type: 'string' },
            socials: {
                type: 'object',
                properties: Object.fromEntries(SOCIAL_KEYS.map((k) => [k, { type: 'string', maxLength: 200 }])),
                additionalProperties: false,
            },
        },
        required: ['lab', 'slug', 'display_name', 'photo_layout', 'theme'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        slug: z.string().min(3).max(60),
        display_name: z.string().max(100),
        bio: z.string().max(500).optional(),
        theme: z.enum(['light', 'dark', 'violet', 'yellow']),
        accent_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
        photo_layout: z.enum(['avatar', 'banner', 'portrait']),
        desktop_layout: z.enum(['split', 'centered']).optional(),
        avatar_url: z.string().optional(),
        banner_url: z.string().optional(),
        portrait_url: z.string().optional(),
        socials: z.record(z.string().max(200)).optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/link-in-bio`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
