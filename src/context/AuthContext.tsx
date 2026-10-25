import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, Profile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER = 'notenpilot_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch student profile from Supabase
  const fetchProfile = async (userId: string) => {
    if (!isSupabaseConfigured) {
      const stored = localStorage.getItem(`notenpilot_profile_${userId}`);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      } else {
        const defaultProfile: Profile = {
          id: userId,
          display_name: 'Schüler',
          school_type: 'Gymnasium',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(defaultProfile);
        localStorage.setItem(`notenpilot_profile_${userId}`, JSON.stringify(defaultProfile));
      }
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
      } else {
        // If profile doesn't exist yet, insert a default profile safely
        const newProfile: Partial<Profile> = {
          id: userId,
          display_name: user?.email ? user.email.split('@')[0] : 'Schüler',
          school_type: 'Gymnasium',
        };
        const { data: created } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();
        if (created) {
          setProfile(created as Profile);
        }
      }
    } catch {
      // Safe error containment
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local fallback mode for prototyping before publishable key is entered
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUser(parsed);
          fetchProfile(parsed.id);
        } catch {
          // ignore
        }
      }
      setLoading(false);
      return;
    }

    // Official Supabase Auth Session Handling
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      const mockUser: User = {
        id: 'demo-student-id-1234',
        email,
        app_metadata: {},
        user_metadata: { display_name: email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      await fetchProfile(mockUser.id);
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isSupabaseConfigured) {
      const mockUser: User = {
        id: 'demo-student-id-1234',
        email,
        app_metadata: {},
        user_metadata: { display_name: displayName || email.split('@')[0] },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
      localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(mockUser));
      await fetchProfile(mockUser.id);
      return { error: null, message: 'Erfolgreich angemeldet (Lokaler Modus).' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    });

    if (error) return { error };

    const message = data.session
      ? 'Konto erfolgreich erstellt und angemeldet!'
      : 'Konto erstellt! Bitte überprüfe deine E-Mails zur Bestätigung.';

    return { error: null, message };
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      setUser(null);
      setProfile(null);
      localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#reset-password`,
    });
    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
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
        signIn,
        signUp,
        signOut,
        resetPassword,
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
