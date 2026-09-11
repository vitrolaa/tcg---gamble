import React from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles, Volume2, VolumeX, Gift, Layers, ShoppingBag, RefreshCw, Sun, Moon, Zap, Waves, DollarSign } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';

export const Header = ({ currentTab, setCurrentTab, onOpenRecycleModal }) => {
  const {
    theme,
    toggleTheme,
    coins,
    claimDailyReward,
    canClaimDaily,
    getDailyTimeRemaining,
    isMuted,
    toggleSound,
    getCollectionStats
  } = useGame();

  const stats = getCollectionStats();
  const dailyAvailable = canClaimDaily();

  return (
    <header className="sticky top-3 z-40 w-full px-2 sm:px-6 lg:px-8 pointer-events-none">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 dark:border-white/10 pointer-events-auto transition-colors duration-300">
        <div className="flex items-center justify-between h-18 sm:h-20 px-3 sm:px-6 gap-2 sm:gap-3">
          
          {/* Logo & Brand */}
          <div
            onClick={() => setCurrentTab('album')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="relative flex items-center justify-center w-10 sm:w-11 h-10 sm:h-11 rounded-2xl bg-gradient-to-tr from-orient-torii via-rose-500 to-orient-yamabuki p-0.5 shadow-md shadow-rose-950/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden relative">
                <div className="w-6 sm:w-7 h-6 sm:h-7 rounded-full border-2 border-slate-900 dark:border-slate-800 bg-orient-torii relative overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute bottom-0 w-full h-1/2 bg-white" />
                  <div className="absolute w-full h-0.5 bg-slate-900 dark:bg-slate-800 z-10" />
                  <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-white border-2 border-slate-900 dark:border-slate-800 z-20 flex items-center justify-center shadow-sm">
                    <div className="w-1 h-1 rounded-full bg-orient-torii animate-ping" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-black text-lg sm:text-2xl tracking-tight text-slate-900 dark:text-white">
                  POKÉ<span className="text-orient-torii dark:text-poke-yellow">VAULT</span>
                </span>
                <span className="hanko-seal text-[8px] sm:text-[9px] dark:hanko-seal-gold hidden sm:inline-flex">
                  図鑑
                </span>
              </div>
              <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:flex items-center gap-1">
                <span>ポケモンカード</span>
                <span className="text-slate-400">•</span>
                <span>TCGDex Oficial</span>
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs (Álbum / Loja / Upgrader / Pescaria / Vender) */}
          <nav className="hidden lg:flex items-center gap-1 p-1 rounded-2xl bg-slate-200/50 dark:bg-slate-900/60 border border-slate-300/40 dark:border-slate-800/80">
            <button
              onClick={() => setCurrentTab('album')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentTab === 'album'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-orient-torii dark:text-poke-blue" />
              <span>Álbum</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orient-torii/10 dark:bg-poke-blue/20 text-orient-torii dark:text-blue-300 font-extrabold">
                {stats.percentage}%
              </span>
            </button>

            <button
              onClick={() => setCurrentTab('store')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentTab === 'store'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-orient-yamabuki dark:text-poke-yellow" />
              <span>Loja Boosters</span>
            </button>

            <button
              onClick={() => setCurrentTab('upgrader')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentTab === 'upgrader'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Forja / Upgrader</span>
            </button>

            <button
              onClick={() => setCurrentTab('fishing')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                currentTab === 'fishing'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Waves className="w-3.5 h-3.5 text-cyan-500 animate-bounce" />
              <span>Pescaria (Ganhar $)</span>
            </button>

            <button
              onClick={onOpenRecycleModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Vender Cartas</span>
              {stats.totalDuplicates > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-500 text-slate-950 font-black text-[9px]">
                  {stats.totalDuplicates}
                </span>
              )}
            </button>
          </nav>

          {/* Right Actions: Coins, Daily Claim, Recycle, Theme, Sound */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Coins Display */}
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 select-none shadow-sm"
            >
              <div className="w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gradient-to-tr from-amber-500 to-orient-yamabuki flex items-center justify-center text-slate-950 font-black text-[9px] sm:text-[10px]">
                金
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400/80 -mb-0.5">Moedas</span>
                <span className="text-xs sm:text-sm font-extrabold font-mono tracking-tight text-slate-900 dark:text-white">
                  {coins.toLocaleString('pt-BR')}
                </span>
              </div>
            </motion.div>

            {/* Daily Reward Button */}
            <button
              onClick={claimDailyReward}
              title={dailyAvailable ? "Resgatar Bônus Diário (+300 Moedas)" : `Bônus Diário (Aguarde ${getDailyTimeRemaining()})`}
              className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer ${
                dailyAvailable
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-400/40 shadow-sm animate-pulse'
                  : 'bg-slate-200/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-300/60 dark:border-slate-800'
              }`}
            >
              <Gift className={`w-3.5 h-3.5 ${dailyAvailable ? 'text-yellow-200 animate-bounce' : 'text-slate-400'}`} />
              <span className="hidden xl:inline">
                {dailyAvailable ? 'Bônus' : getDailyTimeRemaining() || 'Em breve'}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-900/70 hover:bg-slate-300/70 dark:hover:bg-slate-800 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all shadow-sm cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-90" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              title={isMuted ? 'Ativar Efeitos Sonoros' : 'Desativar Sons'}
              className="p-2 rounded-xl bg-slate-200/60 dark:bg-slate-900/70 hover:bg-slate-300/70 dark:hover:bg-slate-800 border border-slate-300/60 dark:border-slate-800 text-slate-700 dark:text-slate-400 transition-all shadow-sm cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-500" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex lg:hidden items-center justify-around py-2 px-1.5 border-t border-slate-200/60 dark:border-slate-800/80 gap-1 overflow-x-auto">
          <button
            onClick={() => setCurrentTab('album')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
              currentTab === 'album'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3 h-3" />
            Álbum
          </button>
          <button
            onClick={() => setCurrentTab('store')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
              currentTab === 'store'
                ? 'bg-orient-torii text-white dark:bg-poke-yellow dark:text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShoppingBag className="w-3 h-3" />
            Loja
          </button>
          <button
            onClick={() => setCurrentTab('upgrader')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
              currentTab === 'upgrader'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Zap className="w-3 h-3" />
            Upgrader
          </button>
          <button
            onClick={() => setCurrentTab('fishing')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap ${
              currentTab === 'fishing'
                ? 'bg-cyan-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Waves className="w-3 h-3" />
            Pescaria
          </button>
          <button
            onClick={onOpenRecycleModal}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
          >
            <DollarSign className="w-3 h-3" />
            Vender
          </button>
        </div>

      </div>
    </header>
  );
};
