/**
 * Tool `create_link_in_bio_block` — ajoute un bloc a la page :
 *  - kind=external  : lien URL libre (url)
 *  - kind=product   : offre du Lab (sellable_type + sellable_id)
 *  - kind=lab       : autre Lab de l'owner (lab_group_id)
 *  - kind=quiz      : quiz du Lab (quiz_id) — l'URL publique /quiz/{public_key}
 *                     est resolue cote API, jamais par le client.
 *  - kind=calendar  : calendrier du Lab (calendar_event_id) — la reservation
 *                     s'ouvre en fenetre sur la page publique.
 *
 * Les ids se trouvent via get_link_in_bio_catalog. Position ajoutee
 * automatiquement en fin de liste.
 */

import { z } from 'zod';
import { http, formatApiError } from '../http.js';

const SELLABLE_TYPES = ['agent_ai', 'group_shop', 'newsletter', 'podcast_show', 'lab_channel'] as const;
const KINDS = ['external', 'product', 'lab', 'quiz', 'calendar'] as const;

export const createLinkInBioBlockTool = {
    name: 'create_link_in_bio_block',
    description:
        "Ajoute un bloc a la page Link in Bio (title requis). Cinq types :\n" +
        "- kind=external : lien URL libre (url requis)\n" +
        "- kind=product : offre du Lab (sellable_type + sellable_id requis, sellable_type dans agent_ai/group_shop/newsletter/podcast_show/lab_channel)\n" +
        "- kind=lab : autre Lab de l'owner (lab_group_id requis)\n" +
        "- kind=quiz : quiz du Lab (quiz_id requis). Le bloc reste masque sur la page publique tant que le quiz n'est pas publie et le plug-in Quiz active.\n" +
        "- kind=calendar : calendrier du Lab (calendar_event_id requis, ids via get_link_in_bio_catalog ou list_calendars). La reservation s'ouvre en fenetre sur la page publique. Masque si le calendrier est inactif ; un calendrier payant doit etre vendu dans une boutique Stripe active.\n" +
        "Les ids se trouvent via get_link_in_bio_catalog. Champs optionnels : subtitle, image_url, layout (forme du bloc : classic = petite image + bouton a droite, par defaut ; image = texte et bouton a contour a gauche, grande image a droite ; image_left = pareil avec la grande image a gauche ; button = image + titre en haut, gros bouton pleine largeur en dessous, image a gauche ; button_right = pareil, image a droite ; button_cover = image en fond sur toute la largeur, titre ecrit dessus, bouton en dessous), button_label (texte du bouton, 60 car. max ; vide = texte par defaut du type de bloc). Position en fin de liste (utiliser reorder pour changer).",
    inputSchema: {
        type: 'object' as const,
        properties: {
            lab: { type: 'string' },
            kind: { type: 'string', enum: [...KINDS] },
            title: { type: 'string', maxLength: 200 },
            subtitle: { type: 'string', maxLength: 300 },
            layout: { type: 'string', enum: ['classic', 'image', 'image_left', 'button', 'button_right', 'button_cover'] },
            button_label: { type: 'string', maxLength: 60 },
            url: { type: 'string', description: 'kind=external : URL du lien' },
            image_url: { type: 'string' },
            sellable_type: { type: 'string', enum: [...SELLABLE_TYPES] },
            sellable_id: { type: 'number', minimum: 1 },
            lab_group_id: { type: 'number', minimum: 1, description: "kind=lab : id d'un autre Lab de l'owner" },
            quiz_id: { type: 'number', minimum: 1, description: 'kind=quiz : id du quiz' },
            calendar_event_id: { type: 'number', minimum: 1, description: 'kind=calendar : id du calendrier' },
        },
        required: ['lab', 'kind', 'title'],
        additionalProperties: false,
    },
    zodSchema: z.object({
        lab: z.string(),
        kind: z.enum(KINDS),
        title: z.string().max(200),
        subtitle: z.string().max(300).optional(),
        layout: z.enum(['classic', 'image', 'image_left', 'button', 'button_right', 'button_cover']).optional(),
        button_label: z.string().max(60).optional(),
        url: z.string().optional(),
        image_url: z.string().optional(),
        sellable_type: z.enum(SELLABLE_TYPES).optional(),
        sellable_id: z.number().int().positive().optional(),
        lab_group_id: z.number().int().positive().optional(),
        quiz_id: z.number().int().positive().optional(),
        calendar_event_id: z.number().int().positive().optional(),
    }),
    async handler(args: Record<string, unknown>) {
        const parsed = this.zodSchema.parse(args);
        const { lab, ...body } = parsed;
        try {
            const { data } = await http.post(`/mcp/labs/${encodeURIComponent(lab)}/link-in-bio/blocks`, body);
            return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
        } catch (err) {
            return { isError: true, content: [{ type: 'text' as const, text: formatApiError(err) }] };
        }
    },
};
