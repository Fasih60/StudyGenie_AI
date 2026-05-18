'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/services/api';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Client-Side Validation Requirements
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    interface AxiosErrorLike {
      response?: {
        data?: {
          message?: string;
        };
      };
    }

    try {
      await api.post('/auth/register', {
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        password,
        confirmPassword,
      });
      setIsRegistered(true);
    } catch (err) {
      const error = err as AxiosErrorLike;
      setError(error.response?.data?.message || 'Registration failed. Email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Card className="bg-white/65 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
          <div className="h-2 bg-linear-to-r from-[#7C3AED] to-secondary" />
          <CardHeader className="text-center pt-8">
            <div className="mx-auto bg-linear-to-br from-[#7C3AED]/10 to-secondary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4 border border-[#7C3AED]/20">
              <Mail className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0F172A]">Verify Your Email</CardTitle>
            <CardDescription className="text-muted-foreground mt-2">
              We&apos;ve sent a verification link to <span className="font-semibold text-[#0F172A]">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Please click the link in that email to verify your email address and activate your StudyGenie AI account.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border bg-muted/50 py-4">
            <Link href="/login">
              <Button className="bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-90 text-white font-semibold flex items-center gap-2 px-6 shadow-md hover:shadow-lg transition-all">
                Proceed to Login <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="flex flex-col items-center mb-6">
        <div className="bg-linear-to-br from-[#7C3AED]/15 to-secondary/15 p-3 rounded-2xl border border-border shadow-md mb-3">
          <Sparkles className="w-7 h-7 text-[#7C3AED]" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">Create an Account</h1>
        <p className="text-muted-foreground mt-1 text-sm text-center">Join StudyGenie AI and start studying smarter today</p>
      </div>

      <Card className="bg-white/65 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-[#7C3AED] to-secondary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#0F172A]">Sign up</CardTitle>
          <CardDescription className="text-muted-foreground">Create your study companion profile</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-600 p-3 rounded-md text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-muted/80 border-border text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted/80 border-border text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-muted/80 border-border text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Confirm Password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-muted/80 border-border text-[#0F172A] focus-visible:ring-[#7C3AED] h-10 transition-all pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#0F172A] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-95 text-white font-semibold transition-all h-10 shadow-md hover:shadow-lg mt-2"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 justify-center border-t border-border bg-muted/50 py-4 text-center">
          <p className="text-xs text-[#475569]">
            Already have an account?{' '}
            <Link href="/login" className="text-[#7C3AED] hover:underline font-bold transition-all">
              Sign in
            </Link>
          </p>
          <Link href="/forgot-password" className="text-[11px] text-[#7C3AED] hover:underline transition-all">
            Forgot password?
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
