import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Layers, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const ProgressBar = ({ onOpenRecycle }) => {
  const { getCollectionStats, inventory } = useGame();
  const stats = getCollectionStats();

  // Breakdown by rarity
  const ultraCount = Object.values(inventory).filter(item => item.card.rarity === 'Ultra Rara').length;
  const rareCount = Object.values(inventory).filter(item => item.card.rarity === 'Rara').length;
  const uncommonCount = Object.values(inventory).filter(item => item.card.rarity === 'Incomum').length;
  const commonCount = Object.values(inventory).filter(item => item.card.rarity === 'Comum').length;

  return (
    <div className="w-full rounded-3xl glass-panel p-5 sm:p-7 shadow-lg mb-8 transition-colors duration-300 relative overflow-hidden">
      
      {/* Subtle Japanese Watermark in background */}
      <div className="absolute -right-6 -bottom-10 text-9xl font-black text-slate-900/[0.03] dark:text-white/[0.02] select-none pointer-events-none font-japanese">
        図鑑
      </div>

      {/* Top Header Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Progresso do Álbum Oficial
            </h2>
            <span className="hanko-seal text-[10px] dark:hanko-seal-gold">
              完成度 {stats.percentage}%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Coleção <span className="text-orient-torii dark:text-poke-yellow font-extrabold">{stats.percentage}% Completa</span> —{' '}
            <strong className="text-slate-900 dark:text-white">{stats.ownedUnique}</strong> de{' '}
            <span className="text-slate-600 dark:text-slate-400">{stats.totalUniqueInSet}</span> cartas únicas registradas
          </p>
        </div>

        {/* Total Duplicates Callout */}
        {stats.totalDuplicates > 0 && (
          <button
            onClick={onOpenRecycle}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl glass-panel-subtle hover:border-orient-torii/40 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer group"
          >
            <RefreshCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-orient-torii dark:text-indigo-400" />
            <span>{stats.totalDuplicates} Repetidas</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono font-extrabold">(+{stats.totalPotentialSellValue} moedas)</span>
          </button>
        )}
      </div>

      {/* Main Progress Bar (Minimalist Zen Line) */}
      <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-900/90 rounded-full overflow-hidden p-0.5 border border-slate-300/60 dark:border-slate-800 shadow-inner relative my-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${stats.percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-orient-torii via-orient-sakura to-orient-yamabuki dark:from-poke-blue dark:via-purple-500 dark:to-poke-yellow shadow-md relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      {/* Rarity Breakdown Minimalist Badges with Kanji */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 relative z-10">
        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 font-japanese">普</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Comuns</span>
          </div>
          <span className="text-xs font-black text-slate-900 dark:text-slate-200">{commonCount}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-blue-400 font-japanese">特</span>
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">Incomuns</span>
          </div>
          <span className="text-xs font-black text-blue-700 dark:text-blue-300">{uncommonCount}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-purple-400 font-japanese">稀</span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">Raras</span>
          </div>
          <span className="text-xs font-black text-purple-700 dark:text-purple-300">{rareCount}</span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-2xl glass-panel-subtle">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-amber-400 font-japanese">極</span>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Ultra Raras</span>
          </div>
          <span className="text-xs font-black text-amber-700 dark:text-amber-300">{ultraCount}</span>
        </div>
      </div>

    </div>
  );
};
