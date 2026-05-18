'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, User, Key, CheckCircle, AlertCircle, Loader2, Mail, Lock } from 'lucide-react';
import api from '@/services/api';

interface AxiosErrorLike {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export default function SettingsPage() {
  const { user, setUser } = useStore();

  // Profile States
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.put('/auth/profile', { fullName, email });
      setUser({
        _id: res.data._id,
        fullName: res.data.fullName,
        email: res.data.email,
      });
      setProfileSuccess('Profile details updated successfully!');
    } catch (err) {
      const error = err as AxiosErrorLike;
      console.error(error);
      setProfileError(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      const error = err as AxiosErrorLike;
      console.error(error);
      setPasswordError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your student profile details and account security.</p>
      </div>

      {/* Premium Profile Visual Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#111111] border border-[#2A2A2A] rounded-xl p-6 flex flex-col sm:flex-row items-center gap-5 shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-radial-at-t from-[#7C3AED]/5 to-transparent blur-[80px] pointer-events-none" />
        
        {/* Large Avatar */}
        <div className="w-18 h-18 rounded-full bg-white text-black flex items-center justify-center text-2xl font-black shrink-0 shadow-md ring-4 ring-[#7C3AED]/10 select-none">
          {user?.fullName 
            ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
            : (user?.email ? user.email[0].toUpperCase() : 'S')}
        </div>
        
        <div className="text-center sm:text-left min-w-0 flex-1 space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-extrabold text-white truncate leading-none">
              {user?.fullName || 'Student'}
            </h2>
            <span className="text-[10px] font-extrabold text-[#7C3AED] bg-[#7C3AED]/5 border border-[#7C3AED]/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider w-fit mx-auto sm:mx-0">
              Active Member
            </span>
          </div>
          <p className="text-xs text-gray-400 font-medium flex items-center justify-center sm:justify-start gap-1.5 truncate">
            <Mail size={12} className="text-gray-500" />
            {user?.email || 'N/A'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-[#111111] border-[#2A2A2A] h-full shadow-lg rounded-xl">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <User size={18} className="text-gray-400" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-gray-500 text-xs">
                Update your name and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileSuccess && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs py-2.5 px-3.5 rounded-lg flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0 text-emerald-400" />
                    <span className="font-medium">{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-500/5 border border-red-500/10 text-red-400 text-xs py-2.5 px-3.5 rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-red-400" />
                    <span className="font-medium">{profileError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="fullName" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Full Name</Label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Your Full Name"
                      style={{ paddingLeft: '2.75rem' }}
                      className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Email Address</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@example.com"
                      style={{ paddingLeft: '2.75rem' }}
                      className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold h-11 rounded-lg transition-all duration-200 shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {profileLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Save Details'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change Password Form */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-[#111111] border-[#2A2A2A] h-full shadow-lg rounded-xl">
            <CardHeader className="border-b border-[#2A2A2A] pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Key size={18} className="text-gray-400" />
                Change Password
              </CardTitle>
              <CardDescription className="text-gray-500 text-xs">
                Ensure your account stays secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                {passwordSuccess && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs py-2.5 px-3.5 rounded-lg flex items-center gap-2">
                    <CheckCircle size={14} className="shrink-0 text-emerald-400" />
                    <span className="font-medium">{passwordSuccess}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="bg-red-500/5 border border-red-500/10 text-red-400 text-xs py-2.5 px-3.5 rounded-lg flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0 text-red-400" />
                    <span className="font-medium">{passwordError}</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="currentPass" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Current Password</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <Input
                      id="currentPass"
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ paddingLeft: '2.75rem' }}
                      className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 z-10"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPass" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">New Password</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <Input
                      id="newPass"
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ paddingLeft: '2.75rem' }}
                      className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 z-10"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmNewPass" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-1">Confirm New Password</Label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10" />
                    <Input
                      id="confirmNewPass"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      style={{ paddingLeft: '2.75rem' }}
                      className="bg-[#050505] border-[#1F1F1F] hover:border-[#2D2D2D] text-white placeholder:text-gray-600 focus-visible:ring-0 focus:border-white h-11 rounded-lg transition-all duration-200 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 z-10"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-semibold h-11 rounded-lg transition-all duration-200 shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {passwordLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
