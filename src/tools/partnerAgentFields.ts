/**
 * Champs de la page de vente d'un agent partenaire, partages par
 * create_partner_agent et update_partner_agent.
 */

import { z } from 'zod';

export const partnerAgentProperties = {
    title: { type: 'string', maxLength: 255, description: "Nom de l'agent" },
    short_description: { type: 'string', maxLength: 500, description: 'Phrase courte de la carte marketplace' },
    description: { type: 'string', description: 'Description de la page de vente (HTML simple accepte)' },
    call_to_action_text: { type: 'string', maxLength: 120, description: 'Texte du bouton de la page de vente (ex. "Essayer l\'agent")' },
    shop_image: { type: 'string', description: "Image de la carte : URL https ou image encodee (data:image/...;base64,...)" },
    icon: { type: 'string', description: 'Logo (URL https ou data URI), optionnel' },
    affiliate_url: { type: 'string', maxLength: 2000, description: "Lien d'affiliation chez l'editeur, en https:// (les boutons de la page y menent)" },
    pricing_label: { type: 'string', maxLength: 80, description: 'Prix affiche, texte libre (ex. "Des 29 euros/mois")' },
    landing_template: { type: 'string', enum: ['', 'external_url'], description: '"" = page de vente XLab ; "external_url" = la carte mene au site de l editeur' },
    landing_external_url: { type: 'string', maxLength: 2000, description: "Site de l'editeur en https:// (obligatoire si landing_template = external_url)" },
};

export const partnerAgentZod = {
    title: z.string().max(255),
    short_description: z.string().max(500),
    description: z.string(),
    call_to_action_text: z.string().max(120),
    shop_image: z.string(),
    icon: z.string().nullable(),
    affiliate_url: z.string().max(2000),
    pricing_label: z.string().max(80).nullable(),
    landing_template: z.enum(['', 'external_url']),
    landing_external_url: z.string().max(2000).nullable(),
};
