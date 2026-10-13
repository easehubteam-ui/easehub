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

export function decodeJwtPayload(token: string | null): { sub?: string; email?: string; exp?: number; [key: string]: any } | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function isJwtStillValid(token: string | null): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 > Date.now() + 15000;
}

export function clearInsforgeCookies(): void {
  if (typeof document === 'undefined') return;
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `insforge_csrf_token=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function syncSdkSessionFromToken(
  token: string | null,
  userHint?: { id?: string; email?: string; name?: string } | null
): void {
  if (!token || !isJwtStillValid(token)) {
    insforge.setAccessToken(null);
    (insforge as any)?.http?.setRefreshToken?.(null);
    clearInsforgeCookies();
    return;
  }

  const payload = decodeJwtPayload(token);
  const authUserId = userHint?.id || payload?.sub;
  const email = userHint?.email || payload?.email || '';

  insforge.setAccessToken(token);
  if (authUserId) {
    (insforge as any)?.tokenManager?.setUser?.({
      id: authUserId,
      email,
      ...(userHint?.name ? { profile: { name: userHint.name } } : {}),
    });
  }
}

// Guard SDK getCurrentUser & refreshSession so a stale HttpOnly cookie can NEVER auto-login after logout
const originalGetCurrentUser = insforge.auth.getCurrentUser.bind(insforge.auth);
const originalRefreshSession = insforge.auth.refreshSession.bind(insforge.auth);

insforge.auth.refreshSession = async (options?: any) => {
  if (typeof window !== 'undefined') {
    const isOAuthCallback = window.location.search.includes('insforge_code=');
    const isLoggedOut = localStorage.getItem('easehub_logged_out') === 'true';
    const storedToken = localStorage.getItem('easehub_token');
    if (!isOAuthCallback && (isLoggedOut || !storedToken)) {
      return { data: null, error: null } as any;
    }
  }
  return originalRefreshSession(options);
};

insforge.auth.getCurrentUser = async () => {
  if (typeof window !== 'undefined') {
    const isOAuthCallback = window.location.search.includes('insforge_code=');
    if (!isOAuthCallback) {
      const isLoggedOut = localStorage.getItem('easehub_logged_out') === 'true';
      const storedToken = localStorage.getItem('easehub_token');

      if (isLoggedOut || !storedToken) {
        return { data: { user: null }, error: null } as any;
      }

      if (isJwtStillValid(storedToken)) {
        const payload = decodeJwtPayload(storedToken);
        let storedUserObj: any = null;
        try {
          const raw = localStorage.getItem('easehub_user');
          if (raw) storedUserObj = JSON.parse(raw);
        } catch {
          // ignore parse error
        }

        const authUserId = payload?.sub || storedUserObj?.authUserId;
        const email = payload?.email || storedUserObj?.email || '';
        if (authUserId) {
          syncSdkSessionFromToken(storedToken, {
            id: authUserId,
            email,
            name: storedUserObj?.name,
          });
          return {
            data: {
              user: {
                id: authUserId,
                email,
                name: storedUserObj?.name,
              },
            },
            error: null,
          } as any;
        }
      }
    }
  }
  return originalGetCurrentUser();
};

// Synchronously attach stored session token on startup only if user did not log out and token is valid
if (typeof window !== 'undefined') {
  try {
    const isLoggedOut = localStorage.getItem('easehub_logged_out') === 'true';
    const storedToken = localStorage.getItem('easehub_token');
    if (!isLoggedOut && storedToken && isJwtStillValid(storedToken)) {
      let storedUserObj: any = null;
      try {
        const raw = localStorage.getItem('easehub_user');
        if (raw) storedUserObj = JSON.parse(raw);
      } catch {
        // ignore
      }
      syncSdkSessionFromToken(storedToken, {
        id: storedUserObj?.authUserId,
        email: storedUserObj?.email,
        name: storedUserObj?.name,
      });
    } else {
      localStorage.removeItem('easehub_token');
      localStorage.removeItem('easehub_user');
      syncSdkSessionFromToken(null);
    }
  } catch (err) {
    console.warn('Could not initialize token from storage:', err);
  }
}


