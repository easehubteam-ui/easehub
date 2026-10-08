/**
 * EaseHub InsForge Frontend SDK Client
 * Real InsForge SDK integration for Auth, Database, Storage, and Edge Functions.
 */
import { createClient } from '@insforge/sdk';

const projectUrl = (import.meta.env && import.meta.env.VITE_INSFORGE_PROJECT_URL) || 'https://289ybt8g.us-east.insforge.app';
const anonKey = (import.meta.env && import.meta.env.VITE_INSFORGE_ANON_KEY) || 'ik_7b864691972beda6b5dd6e5d67ea743a';

export const insforge = createClient({
  baseUrl: projectUrl,
  anonKey: anonKey
});

// Synchronously attach stored session token so database and auth requests are authenticated immediately
if (typeof window !== 'undefined') {
  try {
    const storedToken = localStorage.getItem('easehub_token');
    if (storedToken) {
      insforge.setAccessToken(storedToken);
    }
  } catch (err) {
    console.warn('Could not initialize token from storage:', err);
  }
}
