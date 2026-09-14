import React, { useState } from 'react';
import { Trash2, ExternalLink } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const Footer = () => {
  const { resetSave } = useGame();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <footer className="w-full border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/60 backdrop-blur-md mt-16 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left: Info & Credits with Oriental Stamp */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-lg text-slate-900 dark:text-white">
              POKÉ<span className="text-orient-torii dark:text-poke-yellow">VAULT</span>
            </span>
            <span className="hanko-seal text-[8px]">公式版</span>
          </div>
          
        </div>

        {/* Center: Japanese Heritage Note */}
        <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center max-w-md">
          Pokémon é marca registrada de Nintendo, Game Freak e Creatures Inc. Projeto simulador de coleção Pokémon TCG para fins de demonstração.
        </div>

        {/* Right: Reset Data Option */}
        <div className="flex items-center gap-3">
          {showResetConfirm ? (
            <div className="flex items-center gap-2 bg-rose-500/10 dark:bg-rose-950/80 p-1.5 rounded-xl border border-rose-500/30">
              <span className="text-xs text-rose-600 dark:text-rose-300 font-bold">Confirmar Reset?</span>
              <button
                onClick={() => {
                  resetSave();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 cursor-pointer"
              >
                Sim
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2.5 py-1 rounded-lg glass-panel-subtle text-slate-600 dark:text-slate-300 text-xs hover:bg-slate-200 cursor-pointer"
              >
                Não
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-2 cursor-pointer"
              title="Resetar dados locais e recomeçar"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Resetar Dados
            </button>
          )}
        </div>

      </div>
    </footer>
  );
};
