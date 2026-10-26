import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User as UserIcon,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { ZeroxOrb } from './ZeroxOrb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    const res = StorageService.loginUser(email, password);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Failed to login.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = StorageService.registerUser(name, email, password);
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide your email and new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const res = StorageService.resetPassword(email, password);
    if (res.success) {
      setSuccessMsg('Password has been successfully updated! You can now log in.');
      setMode('login');
      setPassword('');
    } else {
      setError(res.error || 'Password reset failed.');
    }
  };

  const handleQuickDemo = () => {
    const res = StorageService.loginUser('user@zerox.ai', 'zerox123');
    if (res.success && res.user) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      const reg = StorageService.registerUser('Alex Mercer', 'user@zerox.ai', 'zerox123');
      if (reg.user) {
        onAuthSuccess(reg.user);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in select-none">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-gray-900">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-gray-200 bg-white">
          <div className="flex items-center gap-2.5">
            <ZeroxOrb size="sm" state="idle" />
            <div>
              <div className="text-base font-bold tracking-tight text-gray-900 flex items-center gap-1.5">
                <span>Zerox GPT</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800 font-mono">
                  Nano
                </span>
              </div>
              <p className="text-[11px] text-gray-500">Personal Account Access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex p-1 rounded-xl bg-gray-100 text-xs">
            <button
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-gray-900 font-semibold shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-gray-900 font-semibold shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => {
                setMode('reset');
                setError(null);
              }}
              className={`flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                mode === 'reset' ? 'bg-white text-gray-900 font-semibold shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Reset
            </button>
          </div>

          {/* Sign In */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-700 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-cyan-700 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gray-900 hover:bg-gray-800 text-white shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Sign In to Zerox</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Full Name</label>
                <div className="relative flex items-center">
                  <UserIcon className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arnav Sharma"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Email Address</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Create Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Confirm Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gray-900 hover:bg-gray-800 text-white shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <span>Create Zerox Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Reset */}
          {mode === 'reset' && (
            <form onSubmit={handleReset} className="space-y-3.5">
              <p className="text-xs text-gray-500">
                Specify your email and desired new password.
              </p>
              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">Registered Email</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-gray-700 font-semibold">New Password</label>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 6 chars)"
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-cyan-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl font-semibold text-xs bg-gray-900 hover:bg-gray-800 text-white active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Update Password</span>
              </button>
            </form>
          )}

          {/* One-click Demo Access */}
          <div className="pt-2 border-t border-gray-100 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2 px-3 rounded-xl border border-cyan-200 bg-cyan-50/70 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
              <span>One-Click Demo Login (Instant Access)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
