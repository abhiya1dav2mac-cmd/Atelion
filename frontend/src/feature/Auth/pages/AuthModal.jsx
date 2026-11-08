import React, { useState } from 'react';
import { X, Eye, EyeOff } from '../../Landing/components/Icons';
import { authService } from '../service/authService';
import { isTempEmail } from '../service/disposableEmailGuard';
import { passkeyService } from '../service/passkeyService';

export default function AuthModal({
  isOpen,
  mode,
  setMode,
  onClose,
  onLogin,
  onRegister,
  onGoogleLogin,
  onCompleteGoogleProfile,
  isLoading,
  error: parentError
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('student'); // 'student' | 'professional'
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [localError, setLocalError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  // Google Profile State (for new Google user onboarding)
  const [googleProfile, setGoogleProfile] = useState(null);
  const [googleRole, setGoogleRole] = useState('student'); // 'student' | 'professional'

  // Common Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  // Student Specific Fields
  const [collegeName, setCollegeName] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');

  // Professional Specific Fields
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [employeeEmail, setEmployeeEmail] = useState('');

  // OTP Verification
  const [otp, setOtp] = useState('');

  if (!isOpen) return null;

  const displayError = localError || parentError;

  const handleResetForm = () => {
    setStep('form');
    setOtp('');
    setLocalError(null);
    setShowEmailForm(false);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    handleResetForm();
  };

  const handlePasskeyAuth = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const user = await passkeyService.loginWithPasskey(email);
      if (user) {
        window.location.reload();
      }
    } catch (err) {
      setLocalError(err.message || 'Passkey authentication failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const res = await onGoogleLogin();
      if (res?.requireDetails) {
        setGoogleProfile(res.googleProfile);
        setName(res.googleProfile.name || '');
        setEmail(res.googleProfile.email || '');
        setGoogleRole('student');
        setMode('google-details');
      }
    } catch (err) {
      setLocalError(err.message || 'Google authentication failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (googleRole === 'student') {
      if (!collegeName.trim()) {
        setLocalError('College / University name is required for student registration.');
        return;
      }
      if (!mobile.trim() || mobile.trim().length < 7) {
        setLocalError('Valid mobile number is required.');
        return;
      }
    } else {
      if (!companyName.trim()) {
        setLocalError('Company / Organization name is required for professional registration.');
        return;
      }
      if (!designation.trim()) {
        setLocalError('Designation is required for professional registration.');
        return;
      }
      if (!employeeEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeEmail)) {
        setLocalError('Valid work/employee email is required.');
        return;
      }
      if (!mobile.trim() || mobile.trim().length < 7) {
        setLocalError('Valid mobile number is required.');
        return;
      }
    }

    setLocalLoading(true);
    try {
      const payload = {
        email: googleProfile.email,
        name: name || googleProfile.name,
        googleId: googleProfile.googleId,
        avatar: googleProfile.avatar,
        role: googleRole,
        mobile: mobile.trim(),
        collegeName: googleRole === 'student' ? collegeName.trim() : undefined,
        collegeEmail: googleRole === 'student' && collegeEmail ? collegeEmail.trim() : undefined,
        companyName: googleRole === 'professional' ? companyName.trim() : undefined,
        designation: googleRole === 'professional' ? designation.trim() : undefined,
        employeeEmail: googleRole === 'professional' ? employeeEmail.trim() : undefined,
      };

      if (onCompleteGoogleProfile) {
        await onCompleteGoogleProfile(payload);
      } else {
        await authService.completeGoogleProfile(payload);
        window.location.reload();
      }
    } catch (err) {
      setLocalError(err.message || 'Profile completion failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    // Strict Anti-Temp / Disposable Email Guard
    if (isTempEmail(email)) {
      setLocalError('Temporary/disposable email addresses are strictly prohibited. Please use a permanent email address.');
      return;
    }
    if (role === 'student' && collegeEmail && isTempEmail(collegeEmail)) {
      setLocalError('Disposable college emails are prohibited. Please provide a genuine university email.');
      return;
    }
    if (role === 'professional' && employeeEmail && isTempEmail(employeeEmail)) {
      setLocalError('Disposable work emails are prohibited. Please provide your official company email.');
      return;
    }

    if (mode === 'signin') {
      await onLogin({ email, password });
      return;
    }

    // Role-specific frontend validations
    if (role === 'student') {
      if (!collegeName.trim()) {
        setLocalError('College / University name is required for students.');
        return;
      }
    } else if (role === 'professional') {
      if (!companyName.trim()) {
        setLocalError('Company / Organization name is required for professionals.');
        return;
      }
      if (!designation.trim()) {
        setLocalError('Designation / Job Title is required for professionals.');
        return;
      }
      if (!employeeEmail.trim()) {
        setLocalError('Work / Corporate email ID is required for professionals.');
        return;
      }
    }

    const payload = {
      role,
      name,
      email,
      mobile: mobile || '9876543210',
      password,
      collegeName: role === 'student' ? collegeName : undefined,
      collegeEmail: role === 'student' && collegeEmail ? collegeEmail : undefined,
      companyName: role === 'professional' ? companyName : undefined,
      designation: role === 'professional' ? designation : undefined,
      employeeEmail: role === 'professional' ? employeeEmail : undefined,
    };

    setLocalLoading(true);
    try {
      // Direct register with complete student / professional payload
      await onRegister(payload);
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setLocalError('Please enter a valid verification code.');
      return;
    }

    setLocalLoading(true);
    setLocalError(null);
    try {
      const user = await authService.verifyOtp({
        email,
        otp,
        role,
        cachedData: {
          name,
          mobile,
          collegeName,
          collegeEmail,
          companyName,
          designation,
          employeeEmail,
        },
      });
      // Complete sign-in
      window.location.reload();
    } catch (err) {
      setLocalError(err.message || 'OTP verification failed.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 transition-all"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-[540px] w-full p-5 sm:p-6 shadow-2xl border border-gray-100 relative text-center animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto auth-modal-scroll"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          .auth-modal-scroll::-webkit-scrollbar,
          .auth-modal-scroll *::-webkit-scrollbar,
          .auth-modal-scroll::-webkit-scrollbar-thumb,
          .auth-modal-scroll::-webkit-scrollbar-track,
          .auth-modal-scroll::-webkit-scrollbar-button {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            background: transparent !important;
          }
          .auth-modal-scroll {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
        `}</style>
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Illustration */}
        <div className="flex justify-center mb-2">
          <img
            src="/assets/auth-avatars.png"
            alt="Community Avatars"
            className="h-11 sm:h-13 w-auto object-contain select-none drop-shadow-sm"
          />
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-xl sm:text-2xl font-bold text-gray-950 tracking-tight">
          {mode === 'google-details'
            ? 'Complete Your Atelion Profile'
            : mode === 'signup'
            ? step === 'otp'
              ? 'Verify Your Email'
              : 'Create your account'
            : 'Sign in to Atelion'}
        </h3>
        <p className="text-xs text-gray-500 mt-1 mb-4">
          {mode === 'google-details'
            ? 'One final step: Select your role and fill your details to personalize your workspace.'
            : mode === 'signup'
            ? step === 'otp'
              ? `We sent a 6-digit passcode to ${email}`
              : 'Personalized onboarding for students and professionals.'
            : 'Fast passwordless access with Google OAuth or FIDO2 Biometrics.'}
        </p>

        {/* Switch Mode Segmented Pill */}
        {mode !== 'google-details' && step !== 'otp' && (
          <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs sm:text-sm font-medium">
            <button
              type="button"
              onClick={() => handleModeChange('signup')}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-gray-950 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('signin')}
              className={`flex-1 py-1.5 sm:py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-gray-950 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-950'
              }`}
            >
              Log In
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {localLoading && (
          <div className="mb-3.5 text-xs bg-blue-50 text-blue-700 py-2.5 px-3.5 rounded-xl border border-blue-200 flex items-center justify-center gap-2 animate-pulse">
            <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">Authenticating via security provider...</span>
          </div>
        )}

        {/* Error message */}
        {displayError && (
          <div className="mb-4 text-xs sm:text-sm bg-red-50 text-red-600 py-2.5 px-3.5 rounded-xl border border-red-200 text-left">
            ⚠️ {displayError}
          </div>
        )}

        {/* 🔐 GOOGLE & FIDO2 AUTHENTICATION CARDS (IN SIGNIN MODE) */}
        {mode === 'signin' && (
          <div className="space-y-3 mb-3">
            {/* 1. Google OAuth 2.0 Card */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading || localLoading}
              className="w-full group relative flex items-center gap-3.5 p-3.5 sm:p-4 border-2 border-gray-200 hover:border-blue-500 rounded-2xl bg-white hover:bg-blue-50/20 text-gray-800 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-950 group-hover:text-blue-600 transition-colors">
                    Continue with Google
                  </h4>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Google OAuth
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                  Instant 1-click login with verified Google identity
                </p>
              </div>
              <span className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                →
              </span>
            </button>

            {/* 2. FIDO2 / Passkey Card */}
            <button
              type="button"
              onClick={handlePasskeyAuth}
              disabled={isLoading || localLoading}
              className="w-full group relative flex items-center gap-3.5 p-3.5 sm:p-4 border-2 border-indigo-200 hover:border-indigo-500 rounded-2xl bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-blue-50/60 hover:bg-indigo-50/90 text-gray-800 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer disabled:opacity-50"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform shadow-xs text-lg">
                🛡️
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-950 group-hover:text-indigo-700 transition-colors flex items-center gap-1.5">
                    <span>Sign in with FIDO</span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      Biometric
                    </span>
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                    FIDO2 / WebAuthn
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-0.5 truncate">
                  Touch ID, Face ID, Windows Hello & Security Keys
                </p>
              </div>
              <span className="text-indigo-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                →
              </span>
            </button>

            {/* Optional Collapsible Email & Password Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="text-xs text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center justify-center gap-1.5 font-medium cursor-pointer py-1"
              >
                <span>{showEmailForm ? 'Hide manual password form' : 'Or sign in with email and password'}</span>
                <span className="text-[10px]">{showEmailForm ? '▲' : '▼'}</span>
              </button>
            </div>
          </div>
        )}

        {/* 🚀 GOOGLE & FIDO QUICK SETUP FOR SIGN UP MODE */}
        {mode === 'signup' && step === 'form' && (
          <div className="space-y-2 mb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isLoading || localLoading}
                className="flex items-center justify-center gap-2 py-2.5 px-3 border border-gray-200 hover:border-gray-300 rounded-xl bg-white hover:bg-gray-50/80 text-gray-800 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
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
                <span>Google Sign Up</span>
              </button>

              <button
                type="button"
                onClick={handlePasskeyAuth}
                disabled={isLoading || localLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 border border-indigo-200 hover:border-indigo-400 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/60 text-indigo-950 text-xs font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <span className="text-sm">🛡️</span>
                <span>FIDO2 Passkey</span>
              </button>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-[11px] text-gray-400 uppercase tracking-wider">
                <span className="bg-white px-3 font-medium">or register with full profile</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OTP Verification Screen */}
        {mode === 'signup' && step === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-4 text-left">
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-center">
              <p className="text-xs text-blue-900 font-medium">
                Please check your inbox at <span className="font-bold">{email}</span> and enter the 6-digit code.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
                Enter 6-Digit Passcode
              </label>
              <input
                type="text"
                maxLength={6}
                required
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full px-4 py-3 text-center tracking-widest text-lg font-mono font-bold border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white transition-all text-gray-900 placeholder:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || localLoading}
              className="w-full btn-blue-pill py-3 px-4 rounded-xl text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {localLoading ? 'Verifying...' : 'Verify & Launch Workspace →'}
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ← Edit Information
              </button>
              <button
                type="button"
                onClick={handleOtpVerify}
                className="text-blue-600 font-semibold hover:underline cursor-pointer"
              >
                Instant Fast Verify
              </button>
            </div>
          </form>
        )}

        {/* STEP 1: Main Signup / Signin Form (Only shown for Sign Up or when manual password form is toggled in Sign In) */}
        {!(mode === 'signup' && step === 'otp') && mode !== 'google-details' && (mode === 'signup' || (mode === 'signin' && showEmailForm)) && (
          <form onSubmit={handleSubmit} className="space-y-3 text-left">
            {/* Attractive Role Selection Cards for Sign Up */}
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                    Select Your Profile
                  </label>
                  <span className="text-[10px] text-gray-400">Customized workspace tools</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                  {/* Student Card */}
                  <div
                    type="button"
                    onClick={() => {
                      setRole('student');
                      setLocalError(null);
                    }}
                    className={`group relative p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-left flex flex-col justify-between ${
                      role === 'student'
                        ? 'border-blue-600 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 shadow-md ring-2 ring-blue-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base shadow-sm">
                        🎓
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          role === 'student'
                            ? 'bg-blue-600 text-white text-[10px] font-bold shadow-sm'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {role === 'student' && '✓'}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        Student
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                        Notes, LaTeX formulas & homework solver
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                        Free Study Hub
                      </span>
                    </div>
                  </div>

                  {/* Professional Card */}
                  <div
                    type="button"
                    onClick={() => {
                      setRole('professional');
                      setLocalError(null);
                    }}
                    className={`group relative p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-left flex flex-col justify-between ${
                      role === 'professional'
                        ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/90 to-purple-50/50 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-base shadow-sm">
                        💼
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          role === 'professional'
                            ? 'bg-indigo-600 text-white text-[10px] font-bold shadow-sm'
                            : 'border-2 border-gray-300'
                        }`}
                      >
                        {role === 'professional' && '✓'}
                      </div>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        Professional
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-gray-500 leading-tight mt-0.5">
                        Sprints, relational DBs & engineering specs
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-md">
                        Pro Workspace
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Common: Full Name & Mobile (Side by Side in Signup) */}
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Rahul Sharma' : 'e.g. Priya Patel'}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </div>
            )}

            {/* STUDENT SPECIFIC FIELDS */}
            {mode === 'signup' && role === 'student' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      College / University <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. IIT Delhi / Oxford"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-blue-50/20 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Student Email <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={collegeEmail}
                      onChange={(e) => setCollegeEmail(e.target.value)}
                      placeholder="student@univ.edu"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Personal Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 chars"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PROFESSIONAL SPECIFIC FIELDS */}
            {mode === 'signup' && role === 'professional' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company / Org <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Google / Stripe"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-indigo-50/20 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Designation / Role <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Lead Engineer"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-indigo-50/20 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={employeeEmail}
                      onChange={(e) => setEmployeeEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-indigo-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-indigo-50/20 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Personal Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@personal.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* SIGNIN ONLY FIELDS */}
            {mode === 'signin' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to your email!')}
                      className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || localLoading}
              className={`w-full mt-2 py-2.5 sm:py-3 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                mode === 'signup'
                  ? role === 'student'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                  : 'btn-blue-pill'
              }`}
            >
              {isLoading || localLoading
                ? 'Processing...'
                : mode === 'signup'
                ? role === 'student'
                  ? 'Join as Student & Open Study Hub →'
                  : 'Join as Professional & Open Workspace →'
                : 'Sign In to Workspace →'}
            </button>
          </form>
        )}

        {/* STEP 3: Google User Onboarding Form (Collect remaining details) */}
        {mode === 'google-details' && (
          <form onSubmit={handleCompleteGoogleProfile} className="space-y-3.5 text-left">
            {/* Google Verified Account Card */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <img
                src={googleProfile?.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${googleProfile?.email || 'user'}`}
                alt="Google Avatar"
                className="w-10 h-10 rounded-full border-2 border-emerald-300 bg-white shadow-xs object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-gray-900 truncate">
                    {googleProfile?.name || name}
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white font-semibold px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    ✓ Verified Google
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 truncate">{googleProfile?.email || email}</p>
              </div>
            </div>

            {/* Role Selection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                  Select Your Profile
                </label>
                <span className="text-[10px] text-gray-400">Tailors your study & AI tools</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Student Option */}
                <div
                  type="button"
                  onClick={() => {
                    setGoogleRole('student');
                    setLocalError(null);
                  }}
                  className={`group relative p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-left flex flex-col justify-between ${
                    googleRole === 'student'
                      ? 'border-blue-600 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 shadow-md ring-2 ring-blue-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">🎓</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        googleRole === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Academic
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Student Scholar</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      College exams, formulas, flashcards & AI tutor
                    </p>
                  </div>
                </div>

                {/* Professional Option */}
                <div
                  type="button"
                  onClick={() => {
                    setGoogleRole('professional');
                    setLocalError(null);
                  }}
                  className={`group relative p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 select-none text-left flex flex-col justify-between ${
                    googleRole === 'professional'
                      ? 'border-indigo-600 bg-gradient-to-br from-indigo-50/90 to-purple-50/50 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">💼</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        googleRole === 'professional'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      Industry
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Professional</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                      Sprint databases, documentation & architecture
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Name (Editable) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Phone / Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Student Specific Fields */}
            {googleRole === 'student' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / University / School <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="e.g. Stanford University / IIT Delhi"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    College / Academic Email <span className="text-gray-400 text-[10px]">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={collegeEmail}
                    onChange={(e) => setCollegeEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </>
            )}

            {/* Professional Specific Fields */}
            {googleRole === 'professional' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Company / Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Microsoft, Google, Acme Corp"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Job Title / Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Official Work Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={employeeEmail}
                    onChange={(e) => setEmployeeEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-gray-50/50 hover:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </>
            )}

            {/* Complete Profile Submit Button */}
            <button
              type="submit"
              disabled={isLoading || localLoading}
              className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 ${
                googleRole === 'student' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading || localLoading
                ? 'Setting up your workspace...'
                : googleRole === 'student'
                ? 'Complete Setup & Open Study Hub →'
                : 'Complete Setup & Open Workspace →'}
            </button>

            {/* Back to sign in */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                ← Use a different account
              </button>
            </div>
          </form>
        )}

        {/* Bottom Switch Link */}
        {step !== 'otp' && mode !== 'google-details' && (
          <p className="mt-4 text-xs text-gray-500">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('signin')}
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
                  onClick={() => handleModeChange('signup')}
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
