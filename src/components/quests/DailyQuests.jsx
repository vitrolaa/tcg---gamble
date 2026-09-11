import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const DailyQuests = () => {
  const { dailyQuests, claimQuestReward } = useGame();

  if (!dailyQuests || dailyQuests.length === 0) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Gift className="w-4 h-4 text-orient-torii dark:text-amber-400" />
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Missões do Dia
        </h3>
        <span className="ml-auto text-[10px] font-mono text-slate-400">Renova à meia-noite</span>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {dailyQuests.map((quest, i) => {
            const pct = Math.min(100, Math.round((quest.progress / quest.goal) * 100));
            const isDone = quest.completed;
            const isClaimed = quest.claimed;

            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`relative rounded-2xl p-3 flex items-center gap-3 border transition-all duration-200 overflow-hidden
                  ${isClaimed
                    ? 'glass-panel-subtle border-emerald-200/40 dark:border-emerald-800/40 opacity-60'
                    : isDone
                    ? 'glass-panel border-amber-300/60 dark:border-amber-500/40 shadow-md'
                    : 'glass-panel-subtle border-slate-200/60 dark:border-slate-700/60'
                  }`}
              >
                {/* Progress fill background */}
                {!isClaimed && (
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-transparent pointer-events-none transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                )}

                {/* Icon */}
                <span className="text-xl shrink-0 relative z-10">{quest.icon}</span>

                {/* Info */}
                <div className="flex-1 min-w-0 relative z-10">
                  <p className={`text-xs font-bold truncate ${isClaimed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                    {quest.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-amber-400'}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                      {quest.progress}/{quest.goal}
                    </span>
                  </div>
                </div>

                {/* Reward / Claim button */}
                <div className="shrink-0 relative z-10">
                  {isClaimed ? (
                    <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] font-bold">Resgatado</span>
                    </div>
                  ) : isDone ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimQuestReward(quest.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/30 cursor-pointer"
                    >
                      <Gift className="w-3 h-3" />
                      +{quest.reward}
                    </motion.button>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-mono">+{quest.reward}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
