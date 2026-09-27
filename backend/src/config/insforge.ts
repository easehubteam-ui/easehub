/**
 * InsForge Backend Integration Client
 * Provides database access, storage operations, and Edge Function invocation capabilities.
 */
import { createClient } from '@insforge/sdk';
import { env } from './env';

export const insforgeAdmin = createClient({
  baseUrl: env.INSFORGE_PROJECT_URL || 'https://rs8ysej4.us-east.insforge.app',
  anonKey: env.INSFORGE_ANON_KEY || 'ik_dc7b941162eb360262857db148f4d1e1'
});
