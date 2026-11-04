/**
 * Economie de tokens (0.4.0).
 *
 *  - Reponses legeres : JSON sans indentation, `fields` pour ne garder que
 *    certains champs, `limit` a 20 par defaut, `next_offset` quand il reste
 *    des elements.
 *  - Descriptions courtes : une phrase par tool et par parametre dans la
 *    liste envoyee au client ; la doc complete passe par `describe_tool`.
 *  - Mode compact (defaut) : le client ne voit que search_tools /
 *    describe_tool / execute ; les 192 tools restent appelables derriere
 *    `execute`. XLAB_MCP_MODE=full reexpose tous les tools.
 */

export type ToolResult = {
    isError?: boolean;
    content: { type: 'text'; text: string }[];
};

export type Tool = {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties?: Record<string, any>;
        required?: string[];
        [key: string]: unknown;
    };
    handler: (args: Record<string, unknown>) => Promise<ToolResult>;
};

const DEFAULT_LIMIT = 20;

/** Actions qui suppriment, retirent ou envoient quelque chose : accord explicite de l'utilisateur. */
const SENSITIVE_PREFIXES = ['delete_', 'ban_', 'kick_', 'reject_', 'send_', 'revoke_', 'clear_', 'demote_', 'stop_', 'unpublish_'];
const SENSITIVE_TOOLS = new Set(['update_slug', 'schedule_newsletter_edition', 'set_current_subscription_price', 'publish_podcast_episode']);

export function isSensitive(name: string): boolean {
    return SENSITIVE_TOOLS.has(name) || SENSITIVE_PREFIXES.some(prefix => name.startsWith(prefix));
}

/** Tools de lecture : ceux qui acceptent `fields`. */
export function isReadTool(name: string): boolean {
    return /^(list_|get_|search_|preview_|check_)/.test(name) || name === 'newsletter_dashboard';
}

/** Premiere phrase, coupee proprement au-dela de `max` caracteres. */
export function firstSentence(text: string | undefined, max: number): string {
    if (!text) return '';
    const flat = text.replace(/\s+/g, ' ').trim();
    const match = flat.match(/^(.+?[.!?])(\s|$)/);
    let sentence = match ? match[1] : flat;
    if (sentence.length > max) {
        const cut = sentence.slice(0, max - 1);
        sentence = cut.slice(0, cut.lastIndexOf(' ') > max / 2 ? cut.lastIndexOf(' ') : cut.length) + '…';
    }
    return sentence;
}

export function shortDescription(tool: Tool): string {
    const summary = firstSentence(tool.description, 110);
    return isSensitive(tool.name) ? `${summary} Action sensible : accord de l'utilisateur avant.` : summary;
}

/** Bornes retirees de la liste : la validation du tool (zod) les applique toujours, avec un message clair. */
const BOUND_KEYS = new Set(['minimum', 'maximum', 'minLength', 'maxLength', 'minItems', 'maxItems', 'additionalProperties']);

function stripBounds(value: any): any {
    if (Array.isArray(value)) return value.map(stripBounds);
    if (typeof value !== 'object' || value === null) return value;
    const copy: Record<string, any> = {};
    for (const [key, inner] of Object.entries(value)) {
        if (!BOUND_KEYS.has(key)) copy[key] = stripBounds(inner);
    }
    return copy;
}

/**
 * Schema allege : descriptions de parametres raccourcies (celle de `lab`,
 * commune a tous les tools, est dans les instructions du serveur), bornes
 * retirees, limit a 20, `fields` sur les lectures.
 */
export function lightSchema(tool: Tool): Tool['inputSchema'] {
    const properties: Record<string, any> = {};
    for (const [key, prop] of Object.entries(tool.inputSchema.properties ?? {})) {
        const copy = stripBounds(prop);
        if (key === 'lab') {
            delete copy.description;
        } else if (typeof copy.description === 'string') {
            copy.description = firstSentence(copy.description, 50);
        }
        if (key === 'limit') {
            copy.default = defaultLimit(prop);
        }
        properties[key] = copy;
    }
    if (isReadTool(tool.name)) {
        properties.fields = { type: 'array', items: { type: 'string' } };
    }
    const { additionalProperties: _strict, ...schema } = tool.inputSchema;
    return { ...schema, properties };
}

function defaultLimit(limitProp: any): number {
    const max = typeof limitProp?.maximum === 'number' ? limitProp.maximum : DEFAULT_LIMIT;
    return Math.min(DEFAULT_LIMIT, max);
}

/**
 * Lance un tool avec les reglages economes : `fields` retire des arguments,
 * limit a 20 si le tool en a une et que rien n'est demande, reponse compacte.
 */
export async function runTool(tool: Tool, rawArgs: Record<string, unknown>): Promise<ToolResult> {
    const args = { ...rawArgs };
    const fields = Array.isArray(args.fields) ? (args.fields as unknown[]).filter((f): f is string => typeof f === 'string') : [];
    delete args.fields;

    const limitProp = tool.inputSchema.properties?.limit;
    if (limitProp && args.limit === undefined) {
        args.limit = defaultLimit(limitProp);
    }
    const paged = !!limitProp && !!tool.inputSchema.properties?.offset;

    let result: ToolResult;
    try {
        result = await tool.handler(args);
    } catch (err) {
        // Arguments refuses par la validation du tool : message court et relisible.
        const issues = (err as { issues?: { path: (string | number)[]; message: string }[] }).issues;
        const detail = issues?.length
            ? issues.map(issue => `${issue.path.join('.') || 'arguments'} : ${issue.message}`).join(' ; ')
            : (err as Error).message ?? String(err);
        return { isError: true, content: [{ type: 'text', text: `[arguments] ${detail}` }] };
    }
    if (result.isError) return result;

    return {
        ...result,
        content: result.content.map(part => ({
            ...part,
            text: compactText(part.text, {
                fields,
                limit: typeof args.limit === 'number' ? args.limit : undefined,
                offset: typeof args.offset === 'number' ? args.offset : 0,
                paged,
            }),
        })),
    };
}

function compactText(text: string, options: { fields: string[]; limit?: number; offset: number; paged: boolean }): string {
    let value: unknown;
    try {
        value = JSON.parse(text);
    } catch {
        return text;
    }

    // Enveloppe { status: true, data } de l'API : seul le contenu compte.
    if (isObject(value) && value.status === true && 'data' in value) {
        const { status: _status, ...rest } = value;
        value = Object.keys(rest).length === 1 ? rest.data : rest;
    }

    if (options.fields.length) {
        value = pickFields(value, options.fields);
    }

    // Page pleine : il en reste peut-etre, on donne l'offset suivant.
    if (options.paged && options.limit) {
        const list = Array.isArray(value) ? value : isObject(value) && Array.isArray(value.data) ? value.data : null;
        const nextOffset = options.offset + options.limit;
        const total = isObject(value) && isObject(value.meta) && typeof value.meta.total === 'number' ? value.meta.total : null;
        if (list && list.length >= options.limit && (total === null || nextOffset < total)) {
            value = Array.isArray(value) ? { items: value, next_offset: nextOffset } : { ...(value as object), next_offset: nextOffset };
        }
    }

    return JSON.stringify(value);
}

function pickFields(value: unknown, fields: string[]): unknown {
    if (Array.isArray(value)) return value.map(item => pickFields(item, fields));
    if (!isObject(value)) return value;
    // Liste enveloppee ({ data: [...], meta }) : le filtre s'applique aux elements.
    if (Array.isArray(value.data)) return { ...value, data: pickFields(value.data, fields) };
    const picked: Record<string, unknown> = {};
    for (const field of fields) {
        if (field in value) picked[field] = value[field];
    }
    return Object.keys(picked).length ? picked : value;
}

function isObject(value: unknown): value is Record<string, any> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalize(text: string): string {
    return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/_/g, ' ');
}

/** Verbes francais -> mot des noms de tools (en anglais). */
const VERB_HINTS: [RegExp, string][] = [
    [/^envo/, 'send'], [/^supprim|^efface/, 'delete'], [/^cre/, 'create'], [/^modifi|^change|^mettre/, 'update'],
    [/^list|^voir|^affich/, 'list'], [/^banni/, 'ban'], [/^exclu|^vire|^retir/, 'kick'], [/^publi/, 'publish'],
    [/^program|^planifi/, 'schedule'], [/^invit/, 'invitation'], [/^approuv|^valid|^accept/, 'approve'],
    [/^refus|^rejet/, 'reject'], [/^cherch|^trouv/, 'search'], [/^epingl/, 'pin'], [/^stat|^chiffr/, 'stats'],
    [/^revenu|^gain|^argent/, 'earnings'], [/^vente/, 'sales'], [/^membre/, 'member'], [/^cours|^formation|^classe/, 'class'],
    [/^evenement/, 'event'], [/^boutique|^produit/, 'shop'], [/^tunnel/, 'funnel'], [/^lien/, 'link'],
    [/^attente/, 'pending'], [/^abonne/, 'subscription'], [/^prix|^tarif/, 'price'],
];

/** Mots trop courants pour departager les actions. */
const STOP_WORDS = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'mes', 'mon', 'ma', 'ses', 'son', 'sa', 'au', 'aux', 'en', 'et', 'pour', 'sur', 'avec', 'dans', 'lab', 'qui', 'que', 'quelqu']);

/** Recherche simple par mots dans le nom et la description des tools. */
export function searchTools(tools: Tool[], query: string, limit: number) {
    const base = normalize(query).split(/[^a-z0-9]+/).filter(word => word.length > 1 && !STOP_WORDS.has(word));
    const hints = base.flatMap(word => VERB_HINTS.filter(([pattern]) => pattern.test(word)).map(([, hint]) => hint));
    const ranked = tools
        .map(tool => {
            const name = normalize(tool.name);
            const parts = name.split(' ');
            const description = normalize(tool.description);
            let score = base.reduce((sum, word) => {
                const stem = word.length > 4 ? word.slice(0, -1) : word; // membres ~ membre
                return sum + (name.includes(stem) ? 3 : 0) + (description.includes(stem) ? 1 : 0);
            }, 0);
            // Mot traduit present tel quel dans le nom (« ban » oui, « unban » non) ; verbe en tete : bonus.
            for (const hint of hints) {
                if (parts.includes(hint) || parts.includes(hint + 's')) score += parts[0] === hint ? 5 : 4;
                else if (description.includes(hint)) score += 1;
            }
            return { tool, score };
        })
        .filter(entry => base.length === 0 || entry.score > 0)
        // A egalite, l'action la plus generale (nom le plus court) d'abord : get_stats avant get_quiz_stats.
        .sort((a, b) => b.score - a.score || a.tool.name.length - b.tool.name.length || a.tool.name.localeCompare(b.tool.name));

    if (base.length === 0) {
        // Sans mots-cles : tous les noms, sans description (catalogue).
        return { tools: ranked.map(entry => entry.tool.name) };
    }
    return {
        tools: ranked.slice(0, limit).map(entry => ({
            name: entry.tool.name,
            summary: firstSentence(entry.tool.description, 140),
            ...(isSensitive(entry.tool.name) ? { sensitive: true } : {}),
        })),
    };
}

export const SERVER_INSTRUCTIONS =
    "Pilote un Lab ConnectXLab. Parametre `lab` : id numerique ou url du Lab, donnes par list_labs. Reponses compactes : limit 20 par defaut, `fields` (lectures) pour ne garder que certains champs, `next_offset` pour la page suivante. Avant une action sensible (suppression, bannissement, envoi), demande l'accord explicite de l'utilisateur.";

export const COMPACT_INSTRUCTIONS =
    " Mode compact : trouve l'action avec search_tools, lis ses parametres avec describe_tool, puis lance-la avec execute.";

/**
 * Les 3 tools du mode compact, construits sur le catalogue complet. En mode
 * complet, seul describe_tool est ajoute (doc detaillee a la demande).
 */
export function compactTools(catalog: Tool[]) {
    const byName = new Map(catalog.map(tool => [tool.name, tool]));
    const text = (value: unknown, isError = false): ToolResult => ({
        ...(isError ? { isError: true } : {}),
        content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value) }],
    });

    const search: Tool = {
        name: 'search_tools',
        description: `Cherche parmi les ${catalog.length} actions ConnectXLab (membres, posts, cours, evenements, boutique, newsletter, podcast, tunnels, quiz…). Sans query : liste de tous les noms.`,
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Mots-cles, ex. "bannir membre" ou "newsletter envoyer"' },
                limit: { type: 'number', minimum: 1, maximum: 30, default: 8 },
            },
            additionalProperties: false,
        },
        async handler(args) {
            const limit = typeof args.limit === 'number' ? Math.min(30, Math.max(1, args.limit)) : 8;
            return text(searchTools(catalog, typeof args.query === 'string' ? args.query : '', limit));
        },
    };

    const describe: Tool = {
        name: 'describe_tool',
        description: "Description complete et parametres d'une action, avant de l'appeler avec execute.",
        inputSchema: {
            type: 'object',
            properties: { name: { type: 'string', description: 'Nom exact, ex. list_members' } },
            required: ['name'],
            additionalProperties: false,
        },
        async handler(args) {
            const tool = byName.get(String(args.name ?? ''));
            if (!tool) return text(`Action inconnue : ${String(args.name)}. Utilise search_tools.`, true);
            return text({
                name: tool.name,
                description: tool.description,
                ...(isSensitive(tool.name) ? { sensitive: "oui : accord explicite de l'utilisateur, puis execute avec confirm: true" } : {}),
                ...(isReadTool(tool.name) ? { fields: 'accepte (via execute)' } : {}),
                input_schema: tool.inputSchema,
            });
        },
    };

    const execute: Tool = {
        name: 'execute',
        description: "Lance une action ConnectXLab par son nom avec ses arguments. Actions sensibles : confirm: true, seulement apres accord de l'utilisateur.",
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: "Nom exact de l'action" },
                arguments: { type: 'object', description: "Arguments de l'action (voir describe_tool)" },
                fields: { type: 'array', items: { type: 'string' }, description: 'Champs a garder dans la reponse' },
                confirm: { type: 'boolean', description: 'true pour une action sensible approuvee' },
            },
            required: ['name'],
            additionalProperties: false,
        },
        async handler(args) {
            const name = String(args.name ?? '');
            const tool = byName.get(name);
            if (!tool) return text(`Action inconnue : ${name}. Utilise search_tools.`, true);
            if (isSensitive(name) && args.confirm !== true) {
                return text(`${name} est une action sensible. Decris-la a l'utilisateur, obtiens son accord explicite, puis relance execute avec confirm: true.`, true);
            }
            const toolArgs = isObject(args.arguments) ? { ...args.arguments } : {};
            if (Array.isArray(args.fields)) toolArgs.fields = args.fields;
            return runTool(tool, toolArgs);
        },
    };

    return [search, describe, execute];
}
