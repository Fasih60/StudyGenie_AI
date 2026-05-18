'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useStore } from '@/store/useStore';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isNotVerified, setIsNotVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken, setUser } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsNotVerified(false);

    interface AxiosErrorLike {
      response?: {
        data?: {
          message?: string;
          notVerified?: boolean;
        };
      };
    }

    try {
      const res = await api.post('/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });
      setToken(res.data.token);
      setUser({
        _id: res.data._id,
        fullName: res.data.fullName,
        email: res.data.email,
      });
      router.push('/dashboard');
    } catch (err) {
      const error = err as AxiosErrorLike;
      if (error.response?.data?.notVerified) {
        setIsNotVerified(true);
        setError(error.response?.data?.message || 'Please verify your email address before logging in.');
      } else {
        setError(error.response?.data?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">StudyGenie AI</h1>
        <p className="text-muted-foreground mt-1 text-sm text-center">Welcome back to your intelligent study partner</p>
      </div>

      <Card className="bg-white/65 backdrop-blur-xl border-border shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-[#7C3AED] to-secondary" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-[#0F172A]">Sign in</CardTitle>
          <CardDescription className="text-muted-foreground">Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className={`p-3 rounded-md text-sm font-medium flex gap-2.5 items-start ${
                isNotVerified 
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-700' 
                  : 'bg-red-500/10 border border-red-500/30 text-red-600'
              }`}>
                {isNotVerified ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                ) : null}
                <div>{error}</div>
              </div>
            )}
            
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[#0F172A] font-semibold text-xs uppercase tracking-wider">Password</Label>
                <Link href="/forgot-password" className="text-xs text-[#7C3AED] hover:underline font-semibold transition-all">
                  Forgot password?
                </Link>
              </div>
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

            <Button 
              type="submit" 
              className="w-full bg-linear-to-r from-[#7C3AED] to-secondary hover:opacity-95 text-white font-semibold transition-all h-10 shadow-md hover:shadow-lg mt-2"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-border bg-muted/50 py-4">
          <p className="text-xs text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[#7C3AED] hover:underline font-bold transition-all">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
