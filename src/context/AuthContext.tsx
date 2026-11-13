import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, Profile } from '../lib/supabase';
import { isDemoUserId, normalizeEmail, shouldUseLocalData } from '../lib/authUtils';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  isDemoMode: boolean;
  isPasswordRecovery: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: Error | null; message?: string; needsEmailConfirmation?: boolean }>;
  resendConfirmation: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  clearPasswordRecovery: () => void;
  enterDemoMode: (displayName?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'notenpilot_demo_user';

// Deterministic hash for demo accounts so different local demo logins don't mix data
const generateDemoUserId = (email: string): string => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  return `demo_${Math.abs(hash).toString(36)}`;
};

const loadStoredDemoUser = (): User | null => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as User;
    if (parsed && typeof parsed.id === 'string') {
      return parsed;
    }
  } catch {
    // ignore invalid stored user
  }
  return null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  const isDemoMode = !isSupabaseConfigured || isDemoUserId(user?.id);

  // Fetch student profile from Supabase or local browser store
  const fetchProfile = async (userId: string, userEmail?: string | null, fallbackName?: string) => {
    if (shouldUseLocalData(isSupabaseConfigured, userId)) {
      const stored = localStorage.getItem(`notenpilot_profile_${userId}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
          return;
        } catch {
          // ignore parsing error and regenerate default profile
        }
      }
      const defaultProfile: Profile = {
        id: userId,
        display_name: fallbackName || (userEmail ? userEmail.split('@')[0] : 'Schüler (Lokal)'),
        school_type: 'Gymnasium',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setProfile(defaultProfile);
      localStorage.setItem(`notenpilot_profile_${userId}`, JSON.stringify(defaultProfile));
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setProfile(data as Profile);
      } else if (error && (error.code === 'PGRST116' || error.message?.includes('0 rows'))) {
        const resolvedName =
          fallbackName || (userEmail ? userEmail.split('@')[0] : 'Schüler');
        const newProfile: Partial<Profile> = {
          id: userId,
          display_name: resolvedName,
          school_type: 'Gymnasium',
        };
        const { data: created, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        if (created && !createError) {
          setProfile(created as Profile);
        }
      } else if (error) {
        console.error('Fehler beim Abrufen des Profils:', error.message);
      }
    } catch (err) {
      console.error('Unerwarteter Profilfehler:', err);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const demoUser = loadStoredDemoUser();
      if (demoUser) {
        setUser(demoUser);
        fetchProfile(
          demoUser.id,
          demoUser.email,
          typeof demoUser.user_metadata?.display_name === 'string'
            ? demoUser.user_metadata.display_name
            : undefined
        );
      }
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (currentSession?.user) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
        setSession(currentSession);
        setUser(currentSession.user);
        fetchProfile(
          currentSession.user.id,
          currentSession.user.email,
          typeof currentSession.user.user_metadata?.display_name === 'string'
            ? currentSession.user.user_metadata.display_name
            : undefined
        );
      } else {
        const demoUser = loadStoredDemoUser();
        if (demoUser) {
          setSession(null);
          setUser(demoUser);
          fetchProfile(
            demoUser.id,
            demoUser.email,
            typeof demoUser.user_metadata?.display_name === 'string'
              ? demoUser.user_metadata.display_name
              : undefined
          );
        } else {
          setSession(null);
          setUser(null);
        }
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (nextSession?.user) {
        localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
        setSession(nextSession);
        setUser(nextSession.user);
        fetchProfile(
          nextSession.user.id,
          nextSession.user.email,
          typeof nextSession.user.user_metadata?.display_name === 'string'
            ? nextSession.user.user_metadata.display_name
            : undefined
        );
      } else {
        setSession(null);
        const demoUser = loadStoredDemoUser();
        if (demoUser) {
          setUser(demoUser);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const enterDemoMode = async (displayName = 'Gast-Schüler (Lokal)') => {
    const demoUserId = 'demo_schueler';
    const demoUser: User = {
      id: demoUserId,
      email: 'schueler@lokal.notenpilot',
      app_metadata: {},
      user_metadata: { display_name: displayName },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(demoUser));
    setSession(null);
    setUser(demoUser);
    await fetchProfile(demoUser.id, demoUser.email, displayName);
  };

  const signIn = async (email: string, password: string) => {
    const cleanedEmail = normalizeEmail(email);

    if (!isSupabaseConfigured) {
      const mockUserId = generateDemoUserId(cleanedEmail);
      const mockUser: User = {
        id: mockUserId,
        email: cleanedEmail,
        app_metadata: {},
        user_metadata: { display_name: cleanedEmail.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      await fetchProfile(mockUser.id, cleanedEmail);
      return { error: null };
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanedEmail,
      password,
    });
    if (!error && data.session?.user) {
      setSession(data.session);
      setUser(data.session.user);
      await fetchProfile(data.session.user.id, data.session.user.email);
    }
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const cleanedEmail = normalizeEmail(email);
    const trimmedName = displayName?.trim() || cleanedEmail.split('@')[0];

    if (!isSupabaseConfigured) {
      const mockUserId = generateDemoUserId(cleanedEmail);
      const mockUser: User = {
        id: mockUserId,
        email: cleanedEmail,
        app_metadata: {},
        user_metadata: { display_name: trimmedName },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      await fetchProfile(mockUser.id, cleanedEmail, trimmedName);
      return { error: null, message: 'Erfolgreich angemeldet (Lokaler Modus).', needsEmailConfirmation: false };
    }

    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    const { data, error } = await supabase.auth.signUp({
      email: cleanedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) return { error };

    const needsEmailConfirmation = !data.session;
    const message = needsEmailConfirmation
      ? `Konto erstellt! Wir haben einen Bestätigungslink an ${cleanedEmail} gesendet. Klicke auf den Link in deinem Postfach, um dein Cloud-Konto freizuschalten.`
      : 'Konto erfolgreich erstellt und angemeldet!';

    return { error: null, message, needsEmailConfirmation };
  };

  const resendConfirmation = async (email: string) => {
    const cleanedEmail = normalizeEmail(email);
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
    setIsPasswordRecovery(false);

    if (isSupabaseConfigured && session) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const cleanedEmail = normalizeEmail(email);
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(cleanedEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    if (!isSupabaseConfigured) {
      setIsPasswordRecovery(false);
      return { error: null };
    }
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (!error) {
      setIsPasswordRecovery(false);
    }
    return { error };
  };

  const clearPasswordRecovery = () => {
    setIsPasswordRecovery(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isConfigured: isSupabaseConfigured,
        isDemoMode,
        isPasswordRecovery,
        signIn,
        signUp,
        resendConfirmation,
        signOut,
        resetPassword,
        updatePassword,
        clearPasswordRecovery,
        enterDemoMode,
        refreshProfile,
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
