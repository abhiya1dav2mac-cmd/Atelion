import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import PhilosophySection from '../components/PhilosophySection';
import InteractiveSection from '../components/InteractiveSection';
import TactileSpecsSection from '../components/TactileSpecsSection';
import CurriculumSection from '../components/CurriculumSection';
import PricingSection from '../components/PricingSection';
import TestimonialsSection from '../components/TestimonialsSection';
import FaqSection from '../components/FaqSection';
import CtaBanner from '../components/CtaBanner';
import Footer from '../components/Footer';
import AuthModal from '../../Auth/pages/AuthModal';
import { useAuth } from '../../Auth/hook/useAuth';

export default function LandingPage() {
  const {
    isOpen: isAuthOpen,
    mode: authMode,
    setMode: setAuthMode,
    openAuth,
    closeAuth,
    login,
    register,
    loginWithGoogle,
    quickLaunch,
    isLoading: isAuthLoading,
    error: authError
  } = useAuth();

  return (
    <div className="min-h-screen text-[#111827] relative selection:bg-blue-600 selection:text-white">
      {/* Header & Navbar */}
      <Navbar onOpenAuth={openAuth} />

      {/* Main Sections */}
      <main>
        <HeroSection />
        <PhilosophySection />
        <InteractiveSection />
        <TactileSpecsSection />
        <CurriculumSection />
        <PricingSection onOpenAuth={openAuth} />
        <TestimonialsSection />
        <FaqSection />
        <CtaBanner onOpenAuth={openAuth} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        mode={authMode}
        setMode={setAuthMode}
        onClose={closeAuth}
        onLogin={login}
        onRegister={register}
        onGoogleLogin={loginWithGoogle}
        onQuickLaunch={quickLaunch}
        isLoading={isAuthLoading}
        error={authError}
      />
    </div>
  );
}
