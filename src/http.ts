/**
 * Client axios preconfigure pour l'API Laravel. Toutes les requetes ajoutent
 * automatiquement le Bearer + gerent les erreurs de facon standardisee pour
 * que les tools MCP renvoient un message lisible par l'IA.
 */

import axios, { AxiosError } from 'axios';
import { config } from './config.js';

export const http = axios.create({
    baseURL: config.apiBaseUrl,
    timeout: config.timeoutMs,
    headers: {
        Authorization: `Bearer ${config.mcpToken}`,
        Accept: 'application/json',
    },
});

/**
 * Normalise une erreur axios en message compact que l'IA peut relire.
 * Retourne toujours un string court prefixe par le status.
 */
export function formatApiError(err: unknown): string {
    if (err instanceof AxiosError) {
        const status = err.response?.status ?? 'network';
        const body = err.response?.data;
        const msg = (typeof body === 'object' && body && 'message' in body)
            ? String((body as { message: unknown }).message)
            : err.message;
        return `[HTTP ${status}] ${msg}`;
    }
    return `[erreur] ${(err as Error).message ?? String(err)}`;
}
