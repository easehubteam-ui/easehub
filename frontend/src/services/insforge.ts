/**
 * EaseHub InsForge Frontend SDK Client
 * Real InsForge SDK integration for Auth, Database, Storage, and Edge Functions.
 */
import { createClient } from '@insforge/sdk';

const projectUrl = (import.meta.env && import.meta.env.VITE_INSFORGE_PROJECT_URL) || 'https://rs8ysej4.us-east.insforge.app';
const anonKey = (import.meta.env && import.meta.env.VITE_INSFORGE_ANON_KEY) || 'ik_dc7b941162eb360262857db148f4d1e1';

export const insforge = createClient({
  baseUrl: projectUrl,
  anonKey: anonKey
});
