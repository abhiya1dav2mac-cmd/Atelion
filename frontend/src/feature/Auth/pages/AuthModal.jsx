import React, { useState } from 'react';
import { X, Eye, EyeOff } from '../../Landing/components/Icons';

export default function AuthModal({
  isOpen,
  mode,
  setMode,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin,
  isLoading,
  error
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'signup') {
      await onRegister({ name, email, password });
    } else {
      await onLogin({ email, password });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[480px] sm:max-w-[500px] w-full p-8 sm:p-10 shadow-2xl border border-gray-100 relative text-center animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Avatars Header Illustration */}
        <div className="flex justify-center mb-5">
          <img
            src="/assets/auth-avatars.png"
            alt="Community Avatars"
            className="h-20 sm:h-24 w-auto object-contain select-none drop-shadow-sm"
          />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
          {mode === 'signup' ? 'Create your account' : 'Welcome back'}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mt-1.5 mb-6">
          {mode === 'signup'
            ? 'Join designers & engineers mastering tactile interfaces.'
            : 'Enter your credentials to access your account.'}
        </p>

        {/* Switch Mode Segmented Pill */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 text-xs sm:text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-gray-950 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-gray-950 shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-950'
            }`}
          >
            Log In
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 text-xs sm:text-sm bg-red-50 text-red-600 py-2.5 px-3.5 rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50/80 text-gray-800 text-sm font-medium transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-[11px] text-gray-400 uppercase tracking-wider">
            <span className="bg-white px-3 font-medium">or continue with email</span>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">Password</label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your email!')}
                  className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 sm:py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400 pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 btn-blue-pill py-3 sm:py-3.5 px-4 rounded-xl text-white font-semibold text-sm sm:text-base shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading
              ? 'Please wait...'
              : mode === 'signup'
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Bottom Switch Link */}
        <p className="mt-5 text-xs sm:text-sm text-gray-500">
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Log In / Sign In
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
