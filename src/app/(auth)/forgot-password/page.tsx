'use client';

import { useState } from 'react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { resetPassword } = useAuth();

  const handleResetPassword = async (email: string) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await resetPassword(email);

      if (result.success) {
        setSuccess(result.message || 'Password reset email sent successfully!');
      } else {
        setError(result.error || 'Failed to send reset email');
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
        <ForgotPasswordForm
          onSubmit={handleResetPassword}
          loading={loading}
          error={error}
          success={success}
        />
      </div>
    </ProtectedRoute>
  );
}
