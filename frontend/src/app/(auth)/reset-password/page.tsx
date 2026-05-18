'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import api from '@/services/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid or missing password reset token in the URL.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSuccess('');
    setError('');

    interface AxiosErrorLike {
      response?: {
        data?: {
          message?: string;
        };
      };
    }

    try {
      const res = await api.post('/auth/reset-password', {
        token,
        newPassword,
        confirmNewPassword,
      });
      setSuccess(res.data.message || 'Password has been reset successfully!');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      const error = err as AxiosErrorLike;
      console.error(error);
      setError(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-xl border-[#D6DEE8] shadow-2xl overflow-hidden relative rounded-2xl">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#7C3AED] to-[#3B82F6]" />
      
      <CardHeader className="space-y-1 text-center pt-8">
        <div className="mx-auto bg-linear-to-br from-[#7C3AED]/10 to-[#3B82F6]/10 p-3 rounded-full border border-[#7C3AED]/20 w-fit mb-2 shadow-sm">
          <KeyRound size={28} className="text-[#7C3AED]" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-[#0F172A]">Reset Password</CardTitle>
        <CardDescription className="text-[#475569] text-sm leading-relaxed">
          Please enter and confirm your new password below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed">
              <CheckCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <span className="font-semibold block">{success}</span>
                <span className="text-[10px] text-emerald-600 block mt-1">Redirecting you to the login screen...</span>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed">
              <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-[#F8FAFC]/80 border-[#D6DEE8] text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    className="bg-[#F8FAFC]/80 border-[#D6DEE8] text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all placeholder:text-gray-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <Button
            type="submit"
            disabled={loading || !!success}
            className="w-full bg-linear-to-r from-[#7C3AED] to-[#3B82F6] hover:opacity-95 text-white font-semibold transition-all h-10 shadow-md hover:shadow-lg mt-2 rounded-xl"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center border-t border-[#D6DEE8] bg-[#F8FAFC]/50 py-4">
        <Link href="/login" className="text-xs text-[#7C3AED] hover:underline font-bold transition-all flex items-center gap-1">
          <ArrowLeft size={12} /> Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Suspense fallback={
        <Card className="bg-white/80 border-[#D6DEE8] h-75 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#7C3AED] w-8 h-8" />
        </Card>
      }>
        <ResetPasswordForm />
      </Suspense>
    </motion.div>
  );
}
