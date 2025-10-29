import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  devBypass: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.info('AuthProvider: Initializing auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.info('AuthProvider: Auth state changed', { event, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logger.info('AuthProvider: Checked existing session', { hasSession: !!session, userId: session?.user?.id });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      logger.debug('AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, displayName?: string) => {
    logger.info('AuthProvider: Attempting user signup', { email, hasDisplayName: !!displayName });
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: displayName ? { display_name: displayName } : undefined
      }
    });
    
    if (error) {
      logger.error('AuthProvider: Signup failed', error, { email });
    } else {
      logger.info('AuthProvider: Signup successful', { email });
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    logger.info('AuthProvider: Attempting user signin', { email });
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      logger.error('AuthProvider: Signin failed', error, { email });
    } else {
      logger.info('AuthProvider: Signin successful', { email });
    }
    
    return { error };
  };

  const signOut = async () => {
    logger.info('AuthProvider: User signing out');
    await supabase.auth.signOut();
    logger.info('AuthProvider: User signed out successfully');
  };

  const devBypass = () => {
    logger.info('AuthProvider: Development bypass activated');
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'dev@example.com',
      user_metadata: { display_name: 'Dev User' },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    } as User;
    
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    } as Session;
    
    setUser(mockUser);
    setSession(mockSession);
    setLoading(false);

    // Update last access date for mock data generation
    import('@/lib/mockDataStorage').then(({ setLastAccessDate }) => {
      setLastAccessDate(new Date());
    });
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    devBypass,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}