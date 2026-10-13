/**
 * InsForge Backend Integration Client
 * Provides database access, storage operations, and Edge Function invocation capabilities.
 */
import { createClient } from '@insforge/sdk';
import { env } from './env';

export const insforgeAdmin = createClient({
  baseUrl: env.INSFORGE_PROJECT_URL,
  anonKey: env.INSFORGE_ANON_KEY,
});
