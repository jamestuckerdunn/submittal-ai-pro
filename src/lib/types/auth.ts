// Types for authentication system

export interface AuthUser {
  id: string;
  email: string | undefined;
  user_metadata:
    | {
        full_name?: string;
        avatar_url?: string;
      }
    | undefined;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    options?: SignUpOptions
  ) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  updateProfile: (updates: ProfileUpdates) => Promise<AuthResponse>;
}

export interface SignUpOptions {
  data?: {
    full_name?: string;
  };
}

export interface ProfileUpdates {
  full_name?: string;
  avatar_url?: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignUpFormData extends LoginFormData {
  confirmPassword: string;
  fullName?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
}

export interface AuthFormProps {
  onSubmit: (data: unknown) => Promise<void>;
  loading?: boolean;
  error?: string;
  className?: string;
}
