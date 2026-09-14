import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Lock, Key, ShieldCheck, TrendingUp, HelpCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';

export const JackpotVault = () => {
  const { vaultCoins, crackJackpotVault, coins, spendCoins, addToast } = useGame();
  const [isCracking, setIsCracking] = useState(false);
  const [crackCost] = useState(300); // 300 coins to try a master key attempt

  const handleAttemptCrack = () => {
    if (coins < crackCost) {
      addToast('Moedas Insuficientes', 'Você precisa de 300 moedas para forjar uma gazua do cofre!', 'error');
      return;
    }

    const deducted = spendCoins(crackCost);
    if (!deducted) return;

    setIsCracking(true);
    soundService.playForgeHum();

    setTimeout(() => {
      setIsCracking(false);
      // 18% chance of cracking the vault on attempt
      const success = Math.random() < 0.18;

      if (success) {
        crackJackpotVault();
      } else {
        soundService.playDryClick();
        addToast('Gazua Quebrou!', 'O segredo do cofre resistiu! 300 moedas foram adicionadas ao montante acumulado!', 'warning');
      }
    }, 1200);
  };

  return (
    <div className="relative rounded-3xl glass-panel p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-tr from-amber-950/30 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
      
      {/* Golden Shimmer Ambient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Vault Visual & Live Accumulator */}
        <div className="flex items-center gap-5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 2 }}
            animate={isCracking ? { x: [-3, 3, -3, 3, 0], transition: { repeat: Infinity, duration: 0.1 } } : {}}
            className="w-20 sm:w-24 h-20 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 p-0.5 shadow-xl shadow-amber-950/50 flex items-center justify-center shrink-0"
          >
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex flex-col items-center justify-center relative overflow-hidden">
              <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
              <span className="text-[9px] font-black text-amber-300 font-japanese mt-1">金庫</span>
            </div>
          </motion.div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Acumula 7% de cada aposta
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-display font-black text-white">
              Cofre Acumulador Celadon
            </h3>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400">
                {vaultCoins.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs text-amber-500 font-bold">PokéMoedas acumuladas</span>
            </div>
          </div>
        </div>

        {/* Right: Crack Key Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <Button
            variant="torii"
            size="md"
            icon={Key}
            disabled={isCracking}
            onClick={handleAttemptCrack}
            className="w-full sm:w-auto py-3 px-6 text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-950/30"
          >
            {isCracking ? 'Forçando Fechadura...' : `Tentar Abrir (300 Moedas)`}
          </Button>
        </div>

      </div>

    </div>
  );
};
