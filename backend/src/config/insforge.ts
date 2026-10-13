/**
 * InsForge Backend Integration Client
 * Provides database access, storage operations, and Edge Function invocation capabilities.
 */
import { createClient } from '@insforge/sdk';
import { env } from './env';

export const insforgeAdmin = createClient({
  baseUrl: env.INSFORGE_PROJECT_URL || 'https://289ybt8g.us-east.insforge.app',
  anonKey: env.INSFORGE_ANON_KEY || 'ik_7b864691972beda6b5dd6e5d67ea743a'
});
