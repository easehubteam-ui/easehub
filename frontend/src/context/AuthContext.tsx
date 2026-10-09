import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  AdminPermissionKey,
  isSuperAdminRole,
  isSubAdminRole,
  isAdminRole,
  hasAdminPermission,
} from '../types';
import {
  insforge,
  decodeJwtPayload,
  isJwtStillValid,
  syncSdkSessionFromToken,
} from '../services/insforge';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isSubAdmin: boolean;
  hasPermission: (key?: AdminPermissionKey | 'subadmins') => boolean;
  login: (credentials: any) => Promise<User | null>;
  loginAdmin: (credentials: any) => Promise<User | null>;
  loginWithGoogle: () => Promise<void>;
  register: (data: any) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      if (typeof window === 'undefined') return null;
      if (localStorage.getItem('easehub_logged_out') === 'true') return null;
      const token = localStorage.getItem('easehub_token');
      if (!token || !isJwtStillValid(token)) return null;
      const stored = localStorage.getItem('easehub_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      if (window.location.search.includes('insforge_code=')) return true;
      if (localStorage.getItem('easehub_logged_out') === 'true') return false;
      const token = localStorage.getItem('easehub_token');
      return !!token && isJwtStillValid(token);
    } catch {
      return false;
    }
  });

  // Helper to fetch or initialize public.users profile for an InsForge Auth user
  const fetchOrSyncProfile = async (authUser: any): Promise<User | null> => {
    if (!authUser || !authUser.id) return null;

    try {
      // 1. Query by auth_user_id
      const { data: profilesByAuth } = await insforge.database
        .from('users')
        .select('*')
        .eq('auth_user_id', authUser.id);

      let profile = Array.isArray(profilesByAuth) && profilesByAuth.length > 0 ? profilesByAuth[0] : null;

      // 2. If not found by auth_user_id, attempt email match (for existing customers or seed records)
      if (!profile && authUser.email) {
        const { data: profilesByEmail } = await insforge.database
          .from('users')
          .select('*')
          .eq('email', authUser.email.trim().toLowerCase());

        if (Array.isArray(profilesByEmail) && profilesByEmail.length > 0) {
          const existing = profilesByEmail[0];
          // Link auth_user_id to existing profile
          await insforge.database
            .from('users')
            .update({ auth_user_id: authUser.id })
            .eq('id', existing.id);

          const { data: reFetched } = await insforge.database
            .from('users')
            .select('*')
            .eq('id', existing.id);
          profile = Array.isArray(reFetched) && reFetched.length > 0 ? reFetched[0] : existing;
        }
      }

      // 3. If still no profile, create a default customer profile (Google / OAuth new user)
      if (!profile) {
        const googleName = authUser.name || authUser.profile?.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User';
        const googleAvatar = authUser.profile?.avatar || authUser.user_metadata?.avatar_url || authUser.avatar_url || null;

        await insforge.database
          .from('users')
          .insert([{
            auth_user_id: authUser.id,
            name: googleName,
            email: authUser.email ? authUser.email.trim().toLowerCase() : '',
            phone: authUser.phone || null,
            avatar_url: googleAvatar,
            role: 'customer',
            is_active: true
          }]);

        const { data: newlyCreated } = await insforge.database
          .from('users')
          .select('*')
          .eq('auth_user_id', authUser.id);
        profile = Array.isArray(newlyCreated) && newlyCreated.length > 0 ? newlyCreated[0] : null;
      }

      if (!profile) return null;

      const mappedUser: User = {
        id: profile.id,
        authUserId: profile.auth_user_id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        role: profile.role,
        permissions: profile.permissions && typeof profile.permissions === 'object' ? profile.permissions : {},
        avatar: profile.avatar_url || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || '',
        isActive: profile.is_active ?? true
      };

      return mappedUser;
    } catch (err) {
      console.error('Failed to sync profile from PostgreSQL:', err);
      return null;
    }
  };

  const refreshUser = async () => {
    try {
      const isOAuthCallback =
        typeof window !== 'undefined' && window.location.search.includes('insforge_code=');

      if (isOAuthCallback) {
        localStorage.removeItem('easehub_logged_out');
      } else if (typeof window !== 'undefined') {
        const isLoggedOut = localStorage.getItem('easehub_logged_out') === 'true';
        const storedToken = localStorage.getItem('easehub_token');

        if (isLoggedOut || !storedToken || !isJwtStillValid(storedToken)) {
          localStorage.removeItem('easehub_token');
          localStorage.removeItem('easehub_user');
          syncSdkSessionFromToken(null);
          setUser(null);
          return null;
        }
      }

      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('easehub_token') : null;

      let activeAuthUser: any = null;
      let activeToken: string | null = storedToken;

      if (!isOAuthCallback && storedToken && isJwtStillValid(storedToken)) {
        const payload = decodeJwtPayload(storedToken);
        if (payload?.sub) {
          syncSdkSessionFromToken(storedToken, {
            id: payload.sub,
            email: payload.email || '',
          });
          activeAuthUser = {
            id: payload.sub,
            email: payload.email || '',
          };
        }
      } else if (isOAuthCallback) {
        const { data } = await insforge.auth.getCurrentUser();
        activeAuthUser = data?.user;
        const postOAuthToken: string | null =
          (insforge as any)?.tokenManager?.getAccessToken?.() || null;
        if (postOAuthToken && isJwtStillValid(postOAuthToken)) {
          activeToken = postOAuthToken;
          localStorage.setItem('easehub_token', postOAuthToken);
        }
      }

      // Abort if user logged out while async check was in flight
      if (typeof window !== 'undefined' && localStorage.getItem('easehub_logged_out') === 'true') {
        syncSdkSessionFromToken(null);
        setUser(null);
        return null;
      }

      if (activeAuthUser && activeToken) {
        const profile = await fetchOrSyncProfile(activeAuthUser);

        // Abort if user logged out while profile fetch was in flight
        if (typeof window !== 'undefined' && localStorage.getItem('easehub_logged_out') === 'true') {
          syncSdkSessionFromToken(null);
          setUser(null);
          return null;
        }

        if (profile && profile.isActive) {
          localStorage.setItem('easehub_token', activeToken);
          localStorage.setItem('easehub_user', JSON.stringify(profile));
          syncSdkSessionFromToken(activeToken, {
            id: profile.authUserId || activeAuthUser.id,
            email: profile.email,
            name: profile.name,
          });
          setUser(profile);
          return profile;
        } else {
          localStorage.removeItem('easehub_token');
          localStorage.removeItem('easehub_user');
          syncSdkSessionFromToken(null);
          setUser(null);
          return null;
        }
      } else {
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        return null;
      }
    } catch (err: any) {
      const isNetworkError = err?.message?.toLowerCase().includes('fetch') ||
                             err?.message?.toLowerCase().includes('network') ||
                             err?.message?.toLowerCase().includes('failed to fetch');
      if (!isNetworkError) {
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Subscribe to InsForge auth state changes (token refreshed, sign in/out)
    const unsubscribe = insforge.auth.onAuthStateChange(async (event) => {
      if (event === 'signedOut') {
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        setUser(null);
      } else if (event === 'tokenRefreshed') {
        if (typeof window !== 'undefined' && localStorage.getItem('easehub_logged_out') === 'true') {
          return;
        }
        const latestToken: string | null =
          (insforge as any)?.tokenManager?.getAccessToken?.() || null;
        if (latestToken && typeof window !== 'undefined') {
          localStorage.setItem('easehub_token', latestToken);
        }
      }
    });

    // Cross-tab logout / session change listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'easehub_logged_out' && e.newValue === 'true') {
        syncSdkSessionFromToken(null);
        setUser(null);
        return;
      }
      if ((e.key === 'easehub_token' || e.key === 'easehub_user') && !e.newValue) {
        syncSdkSessionFromToken(null);
        setUser(null);
        return;
      }
      if (e.key === 'easehub_token' && e.newValue) {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const login = async (credentials: any) => {
    try {
      const email = credentials.email || credentials.emailOrPhone;
      const password = credentials.password;

      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      // Clear any previous session state before signing in
      syncSdkSessionFromToken(null);

      const { data, error } = await insforge.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data?.user || !data?.accessToken) {
        throw new Error(error?.message || 'Invalid email or password.');
      }

      syncSdkSessionFromToken(data.accessToken, {
        id: data.user.id,
        email: data.user.email,
      });

      const profile = await fetchOrSyncProfile(data.user);
      if (!profile) {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Unable to retrieve user profile.');
      }

      // STRICT ROLE BOUNDARY FOR CUSTOMER LOGIN
      if (isAdminRole(profile.role) || profile.role.toLowerCase() !== 'customer') {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Admin accounts must use Admin Login.');
      }

      if (!profile.isActive) {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Your account has been deactivated. Please contact support.');
      }

      // Persist session token and profile
      localStorage.removeItem('easehub_logged_out');
      localStorage.setItem('easehub_token', data.accessToken);
      localStorage.setItem('easehub_user', JSON.stringify(profile));
      syncSdkSessionFromToken(data.accessToken, {
        id: profile.authUserId || data.user.id,
        email: profile.email,
        name: profile.name,
      });

      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
      throw new Error(msg);
    }
  };

  const loginAdmin = async (credentials: any) => {
    try {
      const email = credentials.email || credentials.emailOrPhone;
      const password = credentials.password;

      if (!email || !password) {
        throw new Error('Email and password are required.');
      }

      // Clear any previous session state before signing in
      syncSdkSessionFromToken(null);

      const { data, error } = await insforge.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error || !data?.user || !data?.accessToken) {
        throw new Error(error?.message || 'Invalid admin credentials.');
      }

      syncSdkSessionFromToken(data.accessToken, {
        id: data.user.id,
        email: data.user.email,
      });

      const profile = await fetchOrSyncProfile(data.user);
      if (!profile) {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Unable to retrieve administrator profile.');
      }

      // STRICT ROLE BOUNDARY FOR ADMIN LOGIN (Both Super Admin and Sub Admin)
      if (!isAdminRole(profile.role)) {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Access denied. Admin privileges required.');
      }

      if (!profile.isActive) {
        await insforge.auth.signOut();
        localStorage.setItem('easehub_logged_out', 'true');
        localStorage.removeItem('easehub_token');
        localStorage.removeItem('easehub_user');
        syncSdkSessionFromToken(null);
        setUser(null);
        throw new Error('Administrator account is inactive.');
      }

      // Persist session token and profile
      localStorage.removeItem('easehub_logged_out');
      localStorage.setItem('easehub_token', data.accessToken);
      localStorage.setItem('easehub_user', JSON.stringify(profile));
      syncSdkSessionFromToken(data.accessToken, {
        id: profile.authUserId || data.user.id,
        email: profile.email,
        name: profile.name,
      });

      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err?.message || 'Administrator access is required.';
      throw new Error(msg);
    }
  };

  const register = async (data: any) => {
    try {
      const { email, password, name, phone, city } = data;

      if (!email || !password || !name) {
        throw new Error('Name, email, and password are required.');
      }

      syncSdkSessionFromToken(null);

      // 1. Sign up user via InsForge Auth
      const { error: signUpError } = await insforge.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        name: name.trim(),
        autoConfirm: true
      });

      if (signUpError) {
        const errLower = (signUpError.message || '').toLowerCase();
        if (errLower.includes('already') || errLower.includes('exists')) {
          throw new Error('An account with this email address already exists.');
        }
        throw new Error(signUpError.message || 'Registration failed. Please try again.');
      }

      // 2. Authenticate immediately to obtain access token & active session for RLS
      const { data: signInData, error: signInError } = await insforge.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (signInError || !signInData?.user || !signInData?.accessToken) {
        throw new Error(signInError?.message || 'Auto-login failed after account creation.');
      }

      syncSdkSessionFromToken(signInData.accessToken, {
        id: signInData.user.id,
        email: signInData.user.email,
      });

      const authUser = signInData.user;

      // 3. Create public.users profile in PostgreSQL
      const formattedPhone = phone && String(phone).trim() !== '' ? String(phone).trim() : null;
      const { error: insertError } = await insforge.database
        .from('users')
        .insert([{
          auth_user_id: authUser.id,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: formattedPhone,
          city: city || null,
          role: 'customer',
          is_active: true
        }]);

      if (insertError) {
        const msgLower = (insertError.message || '').toLowerCase();
        if (insertError.code === '23505' || msgLower.includes('duplicate') || msgLower.includes('unique')) {
          if (msgLower.includes('phone')) {
            throw new Error('An account with this mobile number already exists.');
          }
          throw new Error('An account with this email address already exists.');
        }
        console.error('Failed to create user profile in database:', insertError);
      }

      // 4. Retrieve mapped profile for application context
      const profile = await fetchOrSyncProfile(authUser);

      localStorage.removeItem('easehub_logged_out');
      localStorage.setItem('easehub_token', signInData.accessToken);
      if (profile) {
        localStorage.setItem('easehub_user', JSON.stringify(profile));
      }
      syncSdkSessionFromToken(signInData.accessToken, {
        id: profile?.authUserId || authUser.id,
        email: profile?.email || authUser.email,
        name: profile?.name,
      });

      setUser(profile);
      return profile;
    } catch (err: any) {
      const msg = err?.message || 'Registration failed. Please check your details and try again.';
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    try {
      localStorage.removeItem('easehub_logged_out');
      const origin = typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://easehub-chi.vercel.app';
      const redirectUri = `${origin}/dashboard`;

      const { error } = await insforge.auth.signInWithOAuth('google', {
        redirectTo: redirectUri
      });

      if (error) {
        throw new Error(error.message || 'Google sign-in failed. Please try again.');
      }
    } catch (err: any) {
      const msg = err?.message || 'Google sign-in failed. Please try again.';
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      // 1. Immediately mark logged-out state and clear local storage + React state
      localStorage.setItem('easehub_logged_out', 'true');
      localStorage.removeItem('easehub_token');
      localStorage.removeItem('easehub_user');
      setUser(null);

      // 2. Call signOut while SDK still has the accessToken + CSRF cookie so backend revokes refresh cookie
      await insforge.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.setItem('easehub_logged_out', 'true');
      localStorage.removeItem('easehub_token');
      localStorage.removeItem('easehub_user');
      syncSdkSessionFromToken(null);
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isSuperAdmin: isSuperAdminRole(user?.role),
        isSubAdmin: isSubAdminRole(user?.role),
        hasPermission: (key) => hasAdminPermission(user, key),
        login,
        loginAdmin,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
