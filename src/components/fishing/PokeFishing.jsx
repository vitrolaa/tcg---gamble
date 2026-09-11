import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Sparkles, Zap, RotateCcw, ShieldCheck, Fish, AlertCircle, ArrowRight } from 'lucide-react';
import { FISHING_RODS, useFishing } from '../../hooks/useFishing';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { FishCatchModal } from './FishCatchModal';
import { soundService } from '../../services/soundService';

export const PokeFishing = () => {
  const { coins, addToast } = useGame();
  const { generateCatch } = useFishing();

  const [selectedRodId, setSelectedRodId] = useState('old_rod');
  const [fishingState, setFishingState] = useState('idle'); // 'idle' | 'casting' | 'waiting' | 'biting' | 'reeling'
  const [activeCatch, setActiveCatch] = useState(null);
  const [recentCatches, setRecentCatches] = useState([]);

  const selectedRod = FISHING_RODS.find(r => r.id === selectedRodId) || FISHING_RODS[0];

  // Fishing Cast Flow
  const handleCastRod = () => {
    if (selectedRod.cost > coins) {
      addToast('Moedas Insuficientes', `Você precisa de ${selectedRod.cost} moedas para isca da ${selectedRod.name}!`, 'error');
      return;
    }

    setFishingState('casting');
    soundService.playCastRod();

    // Move to waiting in 400ms
    setTimeout(() => {
      setFishingState('waiting');
      
      // Random wait time before bite: 1.5s to 3s
      const waitTime = Math.floor(Math.random() * 1500) + 1500;
      setTimeout(() => {
        setFishingState('biting');
        soundService.playFishBiteAlert();
      }, waitTime);

    }, 400);
  };

  // User Clicks to Reel In / Hook Fish
  const handleReelIn = () => {
    if (fishingState !== 'biting') return;

    setFishingState('reeling');
    soundService.playReelSplash();

    setTimeout(() => {
      const reward = generateCatch(selectedRod);
      if (reward) {
        setActiveCatch(reward);
        setRecentCatches(prev => [reward, ...prev.slice(0, 4)]);
      }
      setFishingState('idle');
    }, 600);
  };

  // If user fails to reel in within 1.3 seconds, fish escapes
  useEffect(() => {
    let timer;
    if (fishingState === 'biting') {
      timer = setTimeout(() => {
        setFishingState('idle');
        addToast('O Peixe Escapou! 💨', 'Reação muito lenta! O peixe fugiu com a isca — seja mais rápido!', 'warning');
      }, 1300);
    }
    return () => clearTimeout(timer);
  }, [fishingState, addToast]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Fishing Hero Header */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 mb-8 shadow-xl overflow-hidden">
        
        {/* Japanese Watermark */}
        <div className="absolute right-4 -bottom-8 text-9xl font-black text-slate-900/[0.04] dark:text-white/[0.03] select-none pointer-events-none font-japanese">
          釣り
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Waves className="w-3.5 h-3.5" />
              <span>Lago dos Gyarados • 釣り場</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Pescaria <span className="text-cyan-500 dark:text-cyan-400">Pokémon</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Arremesse sua linha nas águas profundas para fisgar <strong className="text-slate-900 dark:text-white">Bolsas de Moedas</strong>, 
              <strong className="text-slate-900 dark:text-white"> Baús de Ouro</strong>, 
              <strong className="text-slate-900 dark:text-white"> Peixes Raros</strong> e até 
              <strong className="text-slate-900 dark:text-white"> Cartas Pokémon Aquáticas</strong> para o seu Álbum!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl glass-panel-subtle flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-500">
                <Fish className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Status da Água</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Cardumes Ativos
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rod Selection Cards (3 Rods) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {FISHING_RODS.map((rod) => {
          const isSelected = selectedRodId === rod.id;
          const canAfford = coins >= rod.cost;

          return (
            <motion.button
              key={rod.id}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (fishingState === 'idle') {
                  setSelectedRodId(rod.id);
                }
              }}
              disabled={fishingState !== 'idle'}
              className={`p-5 rounded-3xl glass-panel text-left flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden border-2 ${
                isSelected
                  ? 'border-cyan-500 dark:border-cyan-400 shadow-xl'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${rod.badgeColor}`}>
                  {rod.badge}
                </span>
                <span className="hanko-seal text-[9px]">{rod.kanji}</span>
              </div>

              <div className="my-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rod.icon}</span>
                  <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                    {rod.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {rod.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-400">Custo do Arremesso:</span>
                <strong className={`font-mono text-sm ${rod.cost === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {rod.cost === 0 ? 'Grátis' : `${rod.cost} moedas`}
                </strong>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Interactive Fishing Pond Lake */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 shadow-2xl mb-8 relative overflow-hidden border border-cyan-500/20">
        
        {/* Animated Water Background Surface */}
        <div className="w-full h-80 sm:h-96 rounded-2xl bg-gradient-to-b from-sky-400/20 via-cyan-600/30 to-blue-900/60 relative overflow-hidden flex flex-col items-center justify-center border border-cyan-400/30 shadow-inner">
          
          {/* Water ripples */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent animate-pulse" />
          
          {/* Lake Ambient Particles */}
          <div className="absolute bottom-6 left-1/4 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl animate-float-slow" />
          <div className="absolute top-8 right-1/3 w-40 h-40 rounded-full bg-blue-500/15 blur-3xl animate-float-slow" />

          {/* Bobber / Fishing Float in Water */}
          <div className="relative flex flex-col items-center justify-center">
            
            {/* Biting Exclamation Indicator — 1.3s window! */}
            <AnimatePresence>
              {fishingState === 'biting' && (
                <motion.div
                  initial={{ scale: 0, y: 10 }}
                  animate={{ scale: [1, 1.3, 1], y: -25 }}
                  exit={{ scale: 0 }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                  className="absolute -top-20 z-30 flex flex-col items-center cursor-pointer gap-1"
                  onClick={handleReelIn}
                >
                  <div className="px-4 py-2 rounded-2xl bg-rose-600 text-white font-black text-sm shadow-2xl border-2 border-white flex items-center gap-1.5 animate-bounce">
                    <span className="text-lg">⚡</span>
                    <span className="uppercase text-[12px] tracking-wider">FISGOU! CLIQUE RÁPIDO!</span>
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="text-[10px] font-bold text-rose-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-rose-500/40">
                    1.3 segundos para reagir!
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Float Ball */}
            <motion.div
              animate={{
                y: fishingState === 'waiting' ? [0, -6, 0] : fishingState === 'biting' ? [-10, 8, -8, 10, 0] : 0,
                rotate: fishingState === 'biting' ? [-15, 15, -15, 15, 0] : 0
              }}
              transition={{
                repeat: fishingState === 'waiting' || fishingState === 'biting' ? Infinity : 0,
                duration: fishingState === 'biting' ? 0.25 : 2,
                ease: 'easeInOut'
              }}
              className={`relative z-10 w-12 h-12 rounded-full border-2 border-slate-900 dark:border-white shadow-2xl flex flex-col items-center justify-center overflow-hidden ${
                fishingState === 'biting' ? 'bg-rose-600 shadow-red-500/80 ring-4 ring-rose-400 animate-pulse' : 'bg-red-600'
              }`}
            >
              <div className="w-full h-1/2 bg-red-600" />
              <div className="w-full h-1 bg-slate-950" />
              <div className="w-full h-1/2 bg-white" />
              <div className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-950 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
            </motion.div>

            {/* Concentric Water Waves */}
            <div className="absolute -bottom-2 w-28 h-8 rounded-[100%] border border-cyan-300/40 animate-ping pointer-events-none" />
            <div className="absolute -bottom-4 w-44 h-12 rounded-[100%] border border-cyan-400/20 animate-pulse pointer-events-none" />

          </div>

          {/* Prompt Status Label */}
          <div className="absolute bottom-5 text-center px-4">
            <span className={`text-xs sm:text-sm font-bold text-white backdrop-blur-md px-4 py-1.5 rounded-full border shadow-md ${
              fishingState === 'biting'
                ? 'bg-rose-700/90 border-rose-400/60 animate-pulse'
                : 'bg-slate-950/75 border-white/20'
            }`}>
              {fishingState === 'idle' && `Pronto para pescar com ${selectedRod.name}!`}
              {fishingState === 'casting' && 'Arremessando a linha na água...'}
              {fishingState === 'waiting' && '🎣 Aguardando o peixe morder a isca... fique atento!'}
              {fishingState === 'biting' && '⚡ MORDIDA! VOCÊ TEM 1.3s PARA PUXAR! ⚡'}
              {fishingState === 'reeling' && 'Puxando a linha do lago...'}
            </span>
          </div>

        </div>

        {/* Action Button Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Isca Selecionada: <strong className="text-slate-900 dark:text-white">{selectedRod.name}</strong> ({selectedRod.lootPreview})
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {fishingState === 'biting' ? (
              <Button
                variant="danger"
                size="lg"
                icon={Zap}
                onClick={handleReelIn}
                className="w-full sm:w-64 animate-bounce"
              >
                PUXAR LINHA / FISGAR!
              </Button>
            ) : (
              <Button
                variant="torii"
                size="lg"
                icon={Waves}
                disabled={fishingState !== 'idle' || coins < selectedRod.cost}
                onClick={handleCastRod}
                className="w-full sm:w-64"
              >
                {fishingState === 'idle' 
                  ? selectedRod.cost > 0 ? `Arremessar (${selectedRod.cost} Moedas)` : 'Arremessar Linha (Grátis)'
                  : 'Pescando...'}
              </Button>
            )}
          </div>
        </div>

      </div>

      {/* Recent Catches History Log */}
      {recentCatches.length > 0 && (
        <div className="rounded-3xl glass-panel p-6 shadow-xl">
          <h3 className="text-base font-display font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Capturas Recentes Desta Sessão</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentCatches.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl glass-panel-subtle flex items-center gap-3 border border-slate-200 dark:border-slate-800"
              >
                <span className="text-2xl">{item.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-amber-500 font-mono font-bold">
                    {item.rewardText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward Catch Modal */}
      {activeCatch && (
        <FishCatchModal
          result={activeCatch}
          onClose={() => setActiveCatch(null)}
          onCastAgain={() => {
            setActiveCatch(null);
            setTimeout(() => {
              handleCastRod();
            }, 200);
          }}
        />
      )}

    </div>
  );
};
