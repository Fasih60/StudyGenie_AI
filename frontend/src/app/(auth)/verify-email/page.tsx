'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

function VerificationContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (!token) {
      setTimeout(() => {
        setStatus('error');
        setMessage('No verification token provided in the URL.');
      }, 0);
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage(res.data.message || 'Your email address has been verified successfully!');
      } catch (err) {
        const error = err as AxiosErrorLike;
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification link is invalid or has expired.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <Card className="bg-white/65 backdrop-blur-xl border-[#D6DEE8] shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-linear-to-r from-[#7C3AED] to-[#3B82F6]" />
      
      {status === 'loading' && (
        <>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-linear-to-br from-[#7C3AED]/10 to-[#3B82F6]/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-[#7C3AED]/20 animate-pulse">
              <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F172A]">Confirming Your Email</CardTitle>
            <CardDescription className="text-[#475569] mt-2">
              Please wait while we activate your StudyGenie AI account...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-8">
            <p className="text-sm text-[#475569]">
              This will only take a moment. Once verified, you will be able to log in to your dashboard.
            </p>
          </CardContent>
        </>
      )}

      {status === 'success' && (
        <>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-emerald-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F172A]">Account Activated!</CardTitle>
            <CardDescription className="text-emerald-700 font-medium mt-2 bg-emerald-500/10 py-1 px-3 rounded-full inline-block text-xs border border-emerald-500/20">
              Verification Successful
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-[#475569] leading-relaxed">
              {message}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-[#D6DEE8] bg-[#F8FAFC]/50 py-4">
            <Link href="/login">
              <Button className="bg-linear-to-r from-[#7C3AED] to-[#3B82F6] hover:opacity-90 text-white font-semibold flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all">
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </>
      )}

      {status === 'error' && (
        <>
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-red-500/20">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F172A]">Verification Failed</CardTitle>
            <CardDescription className="text-red-700 font-medium mt-2 bg-red-500/10 py-1 px-3 rounded-full inline-block text-xs border border-red-500/20">
              Activation Error
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-red-600 leading-relaxed font-medium">
              {message}
            </p>
            <p className="text-xs text-[#475569] mt-3">
              The link might have already been used, expired after 24 hours, or the token is incorrect.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4 border-t border-[#D6DEE8] bg-[#F8FAFC]/50 py-4 w-full">
            <Link href="/register" className="w-1/2">
              <Button variant="outline" className="w-full border-[#D6DEE8] text-[#0F172A] font-semibold">
                Sign Up Again
              </Button>
            </Link>
            <Link href="/login" className="w-1/2">
              <Button className="w-full bg-linear-to-r from-[#7C3AED] to-[#3B82F6] hover:opacity-90 text-white font-semibold shadow-sm">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Suspense fallback={
        <Card className="bg-white/65 backdrop-blur-xl border-[#D6DEE8] shadow-2xl overflow-hidden p-8 text-center">
          <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[#475569]">Loading verification interface...</p>
        </Card>
      }>
        <VerificationContent />
      </Suspense>
    </motion.div>
  );
}
