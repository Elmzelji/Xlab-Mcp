/**
 * Config du serveur MCP. Toutes les valeurs viennent de l'environnement,
 * poussees par Claude Desktop (via env dans claude_desktop_config.json)
 * ou par ton shell si tu lances en dev.
 */

const requireEnv = (key: string): string => {
    const v = process.env[key];
    if (!v || v.trim() === '') {
        console.error(`[connectxlab-mcp] env var manquante : ${key}`);
        process.exit(1);
    }
    return v;
};

export const config = {
    apiBaseUrl: process.env.XLAB_API_URL || 'https://v1.connectxlab.io/api/v1',
    mcpToken: requireEnv('XLAB_MCP_TOKEN'),
    timeoutMs: parseInt(process.env.XLAB_TIMEOUT_MS || '15000', 10),
};
