'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async (email: string, password: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signUp(email, password);

      if (result.success) {
        setSuccess(
          result.message ||
            'Account created successfully! Please check your email to confirm your account.'
        );
        // Optionally redirect after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(result.error || 'Failed to create account');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        {success ? (
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600">{success}</p>
              <p className="text-sm text-gray-500 mt-4">
                Redirecting to login page in a few seconds...
              </p>
            </div>
          </div>
        ) : (
          <SignUpForm onSubmit={handleSignUp} loading={loading} error={error} />
        )}
      </div>
    </ProtectedRoute>
  );
}
