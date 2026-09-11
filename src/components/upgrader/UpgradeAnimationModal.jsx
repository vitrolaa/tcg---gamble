import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Zap, Flame, CheckCircle2, RotateCcw, Layers } from 'lucide-react';
import { HolographicCard } from '../gacha/HolographicCard';
import { Button } from '../ui/Button';
import { soundService } from '../../services/soundService';

export const UpgradeAnimationModal = ({
  tier,
  forgedCard,
  onClose,
  onForgeAnother
}) => {
  const [phase, setPhase] = useState('forging'); // 'forging' -> 'reveal'

  useEffect(() => {
    soundService.playForgeHum();
    const timer = setTimeout(() => {
      soundService.playForgeExplosion();
      setPhase('reveal');

      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.55 },
        colors: tier.outputRarity === 'Ultra Rara' 
          ? ['#FFD000', '#FF2A54', '#00E5FF', '#FFFFFF'] 
          : ['#00E5FF', '#52B788', '#FFD000', '#FFFFFF']
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, [tier]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-2xl overflow-hidden select-none">
      
      {/* PHASE 1: FORGE VORTEX ENERGY BUILDUP */}
      {phase === 'forging' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          className="flex flex-col items-center justify-center text-center max-w-md w-full relative"
        >
          {/* Glowing Alchemy Circle */}
          <div className="relative w-64 h-64 flex items-center justify-center my-6">
            
            {/* Spinning Outer Rune Circle */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/60 animate-forge-spin" />
            <div className="absolute inset-4 rounded-full border border-cyan-400/40 animate-[spin_6s_linear_infinite_reverse]" />
            <div className="absolute inset-8 rounded-full border border-rose-500/30 animate-[spin_4s_linear_infinite]" />
            
            {/* Ambient Radial Energy */}
            <div
              className="absolute inset-0 rounded-full blur-3xl opacity-60 animate-forge-pulse"
              style={{ background: tier.glowColor }}
            />

            {/* Center Crucible Icon */}
            <div className="relative z-10 w-24 h-24 rounded-3xl glass-panel flex flex-col items-center justify-center border-2 border-amber-400 shadow-2xl">
              <Zap className="w-10 h-10 text-amber-400 animate-bounce" />
              <span className="text-[10px] font-japanese font-bold text-amber-300 mt-1">
                {tier.kanji}
              </span>
            </div>
          </div>

          <h3 className="text-2xl font-display font-black text-white tracking-tight">
            Transmutando Cartas...
          </h3>
          <p className="text-xs text-amber-300/80 font-mono mt-1 animate-pulse">
            Sintetizando {tier.requiredCount}x {tier.inputRarity}s em 1x {tier.outputRarity}!
          </p>
        </motion.div>
      )}

      {/* PHASE 2: FORGED CARD REVEAL */}
      {phase === 'reveal' && forgedCard && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col items-center text-center gap-5 border border-white/20 dark:border-white/10"
        >
          {/* Header Title */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orient-torii/15 border border-orient-torii/40 text-orient-torii dark:text-poke-yellow text-xs font-black uppercase tracking-widest mb-2 font-japanese">
              <Sparkles className="w-3.5 h-3.5" />
              <span>錬金成功 • Fusão Concluída!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
              Você forjou 1x <span className="text-orient-torii dark:text-poke-yellow">{forgedCard.name}</span>!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Raridade <strong className="text-amber-600 dark:text-amber-400 font-bold">{forgedCard.rarity}</strong> adicionada com sucesso ao seu Álbum.
            </p>
          </div>

          {/* 3D Holographic Forged Card */}
          <div className="w-64 sm:w-72 my-2">
            <HolographicCard
              card={forgedCard}
              isFlipped={true}
              isNew={true}
              interactive={true}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              variant="secondary"
              size="md"
              icon={Layers}
              onClick={onClose}
              className="flex-1"
            >
              Ver no Álbum
            </Button>

            <Button
              variant="torii"
              size="md"
              icon={RotateCcw}
              onClick={onForgeAnother}
              className="flex-1"
            >
              Forjar Outra
            </Button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
