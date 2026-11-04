import React from 'react';
import { useCardboardStore } from './store/useCardboardStore';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { SubPages } from './components/SubPages';
import { DashboardView } from './components/DashboardView';
import { VideoEditorView } from './components/VideoEditorView';
import { ShareModal } from './components/ShareModal';
import { ExportModal } from './components/ExportModal';

export const App: React.FC = () => {
  const { route } = useCardboardStore();

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100">
      <Navbar />
      <main>
        {route === 'home' && <LandingPage />}
        {(route === 'recipes' || route === 'mac' || route === 'plugins' || route === 'pricing' || route === 'changelog') && (
          <SubPages />
        )}
        {route === 'dashboard' && <DashboardView />}
        {route === 'editor' && <VideoEditorView />}
      </main>

      <ShareModal />
      <ExportModal />
    </div>
  );
};

export default App;
