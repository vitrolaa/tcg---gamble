import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, HeartHandshake, Zap, Gift, Coins } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

const RELIEF_AMOUNTS = [400, 600, 800, 1000, 1500];

export const DespairModal = ({ onClose }) => {
  const { claimDespairBonus } = useGame();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);

  const handleClaimRelief = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    soundService.playForgeHum();

    setTimeout(() => {
      setIsSpinning(false);
      const chosen = RELIEF_AMOUNTS[Math.floor(Math.random() * RELIEF_AMOUNTS.length)];
      setSelectedReward(chosen);
      soundService.playJackpotWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }, 1200);
  };

  const handleCollect = () => {
    claimDespairBonus(selectedReward || 600);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 border border-amber-400/40 shadow-2xl bg-gradient-to-b from-amber-950/30 via-slate-950 to-slate-950 text-center relative overflow-hidden"
      >
        <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg flex items-center justify-center text-3xl mb-4">
          ❤️‍🔥
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
          <Zap className="w-3.5 h-3.5" />
          Modo Desespero Ativado
        </div>

        <h3 className="text-2xl font-display font-black text-white mb-2">
          Fundo de Recuperação Emergencial
        </h3>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          A sorte não esteve ao seu lado nas últimas rodadas, mas um verdadeiro Mestre Pokémon nunca desiste! Gire a Roda de Resgate para receber moedas gratuitas.
        </p>

        {selectedReward ? (
          <div className="flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-amber-500/20 border border-amber-500/40">
              <span className="text-xs uppercase font-bold text-amber-300 block mb-1">Prêmio de Retorno</span>
              <span className="text-3xl font-mono font-black text-amber-400">
                +{selectedReward.toLocaleString('pt-BR')} PokéMoedas
              </span>
            </div>

            <Button
              variant="torii"
              size="lg"
              icon={Coins}
              onClick={handleCollect}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black uppercase"
            >
              Coletar & Voltar ao Jogo
            </Button>
          </div>
        ) : (
          <Button
            variant="torii"
            size="lg"
            icon={Gift}
            disabled={isSpinning}
            onClick={handleClaimRelief}
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 font-black uppercase tracking-wider text-sm shadow-xl"
          >
            {isSpinning ? 'Sorteando Resgate...' : 'Girar Roleta de Resgate Grátis'}
          </Button>
        )}

      </motion.div>
    </div>
  );
};
