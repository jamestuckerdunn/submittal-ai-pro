'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Simplified types to avoid TypeScript strict mode issues
interface SimpleAuthUser {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
}

interface AuthContextType {
  user: SimpleAuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    email: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateProfile: (updates: {
    full_name?: string;
  }) => Promise<{ success: boolean; error?: string; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SimpleAuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<
    typeof createClient
  > | null>(null);

  useEffect(() => {
    // Initialize Supabase client only on the client side
    try {
      const client = createClient();
      setSupabaseClient(client);
    } catch (error) {
      console.warn('Failed to initialize Supabase client:', error);
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!supabaseClient) return;

    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            user_metadata: session.user.user_metadata || {},
          });
        }
      } catch (error) {
        console.warn('Failed to get initial session:', error);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata || {},
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const signUp = async (email: string, password: string) => {
    if (!supabaseClient) {
      return { success: false, error: 'Authentication service not available' };
    }

    try {
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Please check your email to confirm your account.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!supabaseClient) {
      return { success: false, error: 'Authentication service not available' };
    }

    try {
      const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Successfully signed in!' };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  };

  const signOut = async (): Promise<void> => {
    if (!supabaseClient) {
      return;
    }
    await supabaseClient.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    if (!supabaseClient) {
      return { success: false, error: 'Authentication service not available' };
    }

    try {
      const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  };

  const updateProfile = async (updates: { full_name?: string }) => {
    if (!supabaseClient) {
      return { success: false, error: 'Authentication service not available' };
    }

    try {
      const { error } = await supabaseClient.auth.updateUser({
        data: updates,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
