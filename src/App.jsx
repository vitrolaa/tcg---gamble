import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Album } from './components/album/Album';
import { PackStore } from './components/store/PackStore';
import { CardUpgrader } from './components/upgrader/CardUpgrader';
import { PokeFishing } from './components/fishing/PokeFishing';
import { CasinoLobby } from './components/casino/CasinoLobby';
import { DespairModal } from './components/casino/DespairModal';
import { LoanSharkModal } from './components/casino/LoanSharkModal';
import { BoosterPackOpening } from './components/gacha/BoosterPackOpening';
import { RecycleModal } from './components/inventory/RecycleModal';
import { ToastContainer } from './components/ui/ToastContainer';
import { DailyQuests } from './components/quests/DailyQuests';
import { Achievements } from './components/achievements/Achievements';
import { GameProvider, useGame } from './context/GameContext';

const MainApp = () => {
  const { theme, showDespairModal, setShowDespairModal, showLoanModal, setShowLoanModal } = useGame();
  const [currentTab, setCurrentTab] = useState('album'); // 'album' | 'casino' | 'store' | 'upgrader' | 'fishing'
  const [activePackOpening, setActivePackOpening] = useState(null);
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);

  const handlePackOpened = (result) => {
    setActivePackOpening(result);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-orient-torii selection:text-white transition-colors duration-300">
      
      {/* Ambient Animated Colored Blobs (Adapts to Light / Dark Mode) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-opacity duration-500">
        {theme === 'dark' ? (
          <>
            <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-orient-torii/12 rounded-full blur-[140px] animate-float-slow" />
            <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-orient-yamabuki/12 rounded-full blur-[130px]" />
            <div className="absolute bottom-10 left-1/3 w-[700px] h-[700px] bg-orient-ai/15 rounded-full blur-[160px]" />
          </>
        ) : (
          <>
            <div className="absolute top-0 left-1/4 w-[650px] h-[650px] bg-rose-300/25 rounded-full blur-[120px] animate-float-slow" />
            <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-amber-200/30 rounded-full blur-[120px]" />
            <div className="absolute bottom-10 left-1/3 w-[700px] h-[700px] bg-sky-200/30 rounded-full blur-[130px]" />
          </>
        )}
      </div>

      {/* Global Floating Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenRecycleModal={() => setIsRecycleModalOpen(true)}
      />

      {/* Main Content View */}
      <main className="flex-1">
        {currentTab === 'album' && (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Album principal */}
              <div className="flex-1 min-w-0">
                <Album
                  onOpenStore={() => setCurrentTab('store')}
                  onOpenRecycle={() => setIsRecycleModalOpen(true)}
                />
              </div>
              {/* Sidebar de quest / conquistas */}
              <div className="xl:w-80 shrink-0 flex flex-col gap-6">
                <div className="glass-panel rounded-3xl p-5 shadow-lg">
                  <DailyQuests />
                </div>
                <div className="glass-panel rounded-3xl p-5 shadow-lg">
                  <Achievements />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'casino' && (
          <CasinoLobby onOpenStore={() => setCurrentTab('store')} />
        )}

        {currentTab === 'store' && (
          <PackStore onPackOpened={handlePackOpened} />
        )}

        {currentTab === 'upgrader' && (
          <CardUpgrader onOpenAlbum={() => setCurrentTab('album')} />
        )}

        {currentTab === 'fishing' && (
          <PokeFishing />
        )}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Interactive Pack Opening 3D Overlay */}
      {activePackOpening && (
        <BoosterPackOpening
          packResult={activePackOpening}
          onClose={() => {
            setActivePackOpening(null);
            setCurrentTab('album');
          }}
          onOpenAnother={() => {
            setActivePackOpening(null);
            setCurrentTab('store');
          }}
        />
      )}

      {/* Recycle & Duplicates Sell Modal */}
      {isRecycleModalOpen && (
        <RecycleModal onClose={() => setIsRecycleModalOpen(false)} />
      )}

      {/* Despair Mode Recovery Modal */}
      {showDespairModal && (
        <DespairModal onClose={() => setShowDespairModal(false)} />
      )}

      {/* Loan Shark Modal */}
      {showLoanModal && (
        <LoanSharkModal onClose={() => setShowLoanModal(false)} />
      )}

      {/* Toast Feedback Layer */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
