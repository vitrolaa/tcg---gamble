import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, Eye, X, Zap } from 'lucide-react';
import { HolographicCard } from './HolographicCard';
import { PackSummaryModal } from './PackSummaryModal';
import { Button } from '../ui/Button';
import { soundService } from '../../services/soundService';

export const BoosterPackOpening = ({
  packResult,
  onClose,
  onOpenAnother,
  onSelectCard
}) => {
  const { pack, cards } = packResult;

  const [phase, setPhase] = useState('pack_sealed');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState({});

  const handlePackClick = () => {
    if (phase === 'pack_sealed') {
      soundService.playPackShake();
      setPhase('pack_tearing');
      setTimeout(() => {
        soundService.playPackRip();
      }, 400);
      setTimeout(() => {
        setPhase('cards_reveal');
      }, 1200);
    }
  };

  const handleCardFlip = (index) => {
    if (!flippedCards[index]) {
      setFlippedCards(prev => ({ ...prev, [index]: true }));
      const card = cards[index];
      if (card.rarity === 'Ultra Rara') {
        soundService.playUltraRareFanfare();
      } else if (card.rarity === 'Rara') {
        soundService.playRareShine();
      }
    }
  };

  const handleNextCard = () => {
    if (!flippedCards[currentCardIndex]) {
      handleCardFlip(currentCardIndex);
    }

    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setPhase('summary');
    }
  };

  const handleRevealAll = () => {
    const all = {};
    cards.forEach((_, idx) => {
      all[idx] = true;
    });
    setFlippedCards(all);
    setPhase('summary');
  };

  const currentCard = cards[currentCardIndex];
  const isCurrentFlipped = !!flippedCards[currentCardIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-2xl overflow-hidden select-none">
      
      {/* Top Close / Skip Button */}
      <div className="absolute top-5 right-5 z-40 flex items-center gap-3">
        {phase === 'cards_reveal' && (
          <Button
            variant="glass"
            size="sm"
            icon={Eye}
            onClick={handleRevealAll}
          >
            Revelar Todas (全開)
          </Button>
        )}
        <button
          onClick={onClose}
          className="p-2 rounded-full glass-panel-subtle hover:bg-slate-800 text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* PHASE 1 & 2: PACK SEALED & TEARING ANIMATION */}
      {(phase === 'pack_sealed' || phase === 'pack_tearing') && (
        <div className="flex flex-col items-center justify-center max-w-md w-full text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              rotate: phase === 'pack_tearing' ? [0, -4, 4, -4, 4, 0] : [0, -1, 1, 0]
            }}
            transition={{
              rotate: {
                repeat: phase === 'pack_tearing' ? 2 : Infinity,
                duration: phase === 'pack_tearing' ? 0.2 : 4,
                ease: 'easeInOut'
              }
            }}
            onClick={handlePackClick}
            className="cursor-pointer group relative perspective-1000 my-6"
          >
            {/* 3D Booster Pack Wrapper */}
            <div
              className={`w-64 sm:w-72 h-96 sm:h-[420px] rounded-3xl bg-gradient-to-br ${pack.themeColor} p-1 shadow-2xl relative overflow-hidden transition-all duration-300 group-hover:scale-105 border-2 border-white/30`}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />

              {/* Tearing top effect */}
              {phase === 'pack_tearing' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: '40%', opacity: 1 }}
                  className="absolute top-0 inset-x-0 bg-gradient-to-b from-poke-yellow via-white to-transparent blur-sm z-30 flex items-center justify-center"
                >
                  <Sparkles className="w-12 h-12 text-poke-yellow animate-spin" />
                </motion.div>
              )}

              {/* Pack Interior Art */}
              <div className="w-full h-full rounded-[22px] bg-slate-950/75 p-4 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-sm">
                
                {/* Pack Header */}
                <div className="w-full flex items-center justify-between">
                  <span className="text-[9px] font-black tracking-widest uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 font-japanese">
                    7枚入 • 7 CARTAS
                  </span>
                  <span className="text-[10px] font-bold tracking-wider text-slate-300">
                    {pack.subtitle}
                  </span>
                </div>

                {/* Featured Pokémon Image */}
                <div className="w-44 h-52 relative flex items-center justify-center">
                  <img
                    src={pack.coverImage}
                    alt={pack.coverPokemon}
                    className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-radial from-amber-400/20 to-transparent blur-lg pointer-events-none" />
                </div>

                {/* Pack Footer */}
                <div className="w-full flex flex-col items-center">
                  <h3 className="font-display font-black text-xl text-white tracking-wide">
                    {pack.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-300 font-bold bg-slate-900/90 px-3 py-1 rounded-full border border-amber-500/40">
                    <Zap className="w-3.5 h-3.5 text-poke-yellow animate-pulse" />
                    Toque para Abrir (開封)
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

          <p className="text-sm font-semibold text-slate-300 animate-pulse">
            {phase === 'pack_tearing' ? 'Rasgando o booster...' : 'Clique no pacote para iniciar a abertura!'}
          </p>
        </div>
      )}

      {/* PHASE 3: ONE BY ONE CARD REVEAL */}
      {phase === 'cards_reveal' && (
        <div className="flex flex-col items-center justify-center max-w-xl w-full">
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            {cards.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentCardIndex
                    ? 'w-8 bg-amber-400 shadow-sm shadow-amber-400/50'
                    : idx < currentCardIndex
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Active Card in 3D */}
          <div className="w-72 sm:w-80 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCardIndex}
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, x: -100, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              >
                <HolographicCard
                  card={currentCard}
                  isFlipped={isCurrentFlipped}
                  onFlip={() => handleCardFlip(currentCardIndex)}
                  interactive={true}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Card Meta & Next Action */}
          <div className="mt-6 flex flex-col items-center gap-3 w-full">
            <div className="text-center min-h-[44px]">
              {isCurrentFlipped ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-lg font-bold text-white font-display">
                    {currentCard.name}
                  </span>
                  <span className={`text-xs font-black uppercase tracking-wider font-japanese ${
                    currentCard.rarity === 'Ultra Rara'
                      ? 'text-amber-400 animate-pulse'
                      : currentCard.rarity === 'Rara'
                      ? 'text-blue-400'
                      : 'text-slate-400'
                  }`}>
                    {currentCard.rarity} • #{currentCard.localId}
                  </span>
                </motion.div>
              ) : (
                <span className="text-sm font-semibold text-amber-300/90 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 animate-spin text-poke-yellow" />
                  Toque na carta para virar e conferir a raridade!
                </span>
              )}
            </div>

            <Button
              variant={isCurrentFlipped ? 'torii' : 'secondary'}
              size="lg"
              icon={ChevronRight}
              onClick={handleNextCard}
              className="w-full sm:w-64 mt-1"
            >
              {currentCardIndex < cards.length - 1 ? 'Próxima Carta' : 'Ver Resumo Completo'}
            </Button>
          </div>
        </div>
      )}

      {/* PHASE 4: SUMMARY MODAL */}
      {phase === 'summary' && (
        <PackSummaryModal
          packResult={packResult}
          onOpenAnother={onOpenAnother}
          onCloseToAlbum={onClose}
          onSelectCard={onSelectCard}
        />
      )}

    </div>
  );
};
