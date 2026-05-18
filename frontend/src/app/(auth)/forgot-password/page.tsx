'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import api from '@/services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      const res = await api.post('/auth/forgot-password', { email });
      setSuccess(res.data.message || 'If that email address exists, a password reset link has been sent!');
    } catch (err) {
      const error = err as AxiosErrorLike;
      console.error(error);
      setError(error.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="bg-white/80 backdrop-blur-xl border-[#D6DEE8] shadow-2xl overflow-hidden relative rounded-2xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-[#7C3AED] to-[#3B82F6]" />
        
        <CardHeader className="space-y-1 text-center pt-8">
          <div className="mx-auto bg-linear-to-br from-[#7C3AED]/10 to-[#3B82F6]/10 p-3 rounded-full border border-[#7C3AED]/20 w-fit mb-2 shadow-sm">
            <KeyRound size={28} className="text-[#7C3AED]" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-[#0F172A]">Forgot Password?</CardTitle>
          <CardDescription className="text-[#475569] text-sm leading-relaxed">
            Enter your email below and we will send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed">
                <CheckCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 text-xs p-3.5 rounded-xl flex items-start gap-2.5 leading-relaxed">
                <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!success && (
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-[#F8FAFC]/80 border-[#D6DEE8] text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all placeholder:text-gray-400 pl-10"
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-[#7C3AED] to-[#3B82F6] hover:opacity-95 text-white font-semibold transition-all h-10 shadow-md hover:shadow-lg mt-2 rounded-xl"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : success ? (
                'Resend Verification Link'
              ) : (
                'Send Reset Link'
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
    </motion.div>
  );
}
