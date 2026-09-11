import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, CheckCircle2, Coins } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export const Achievements = () => {
  const { achievements, claimAchievementReward } = useGame();

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-orient-torii dark:text-amber-400" />
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Conquistas
        </h3>
        <span className="ml-auto text-[10px] font-mono text-slate-400">
          {unlocked.length}/{achievements.length} desbloqueadas
        </span>
      </div>

      {/* Unlocked achievements */}
      {unlocked.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest mb-2">✅ Desbloqueadas</p>
          <div className="grid grid-cols-1 gap-2">
            {unlocked.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`relative rounded-2xl p-3 flex items-center gap-3 border overflow-hidden transition-all duration-200
                  ${ach.claimed
                    ? 'glass-panel-subtle border-emerald-200/30 dark:border-emerald-900/40 opacity-60'
                    : 'glass-panel border-amber-300/60 dark:border-amber-500/40 shadow-lg shadow-amber-500/10'
                  }`}
              >
                {/* Gold shimmer bg for unclaimed */}
                {!ach.claimed && (
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-yellow-300/5 to-transparent pointer-events-none animate-pulse" />
                )}

                <span className="text-2xl shrink-0 relative z-10">{ach.icon}</span>

                <div className="flex-1 min-w-0 relative z-10">
                  <p className="text-xs font-black text-slate-800 dark:text-white">{ach.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{ach.desc}</p>
                </div>

                <div className="shrink-0 relative z-10">
                  {ach.claimed ? (
                    <div className="flex items-center gap-1 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => claimAchievementReward(ach.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[11px] font-black shadow-lg shadow-amber-500/30 cursor-pointer"
                    >
                      <Coins className="w-3 h-3" />
                      +{ach.reward}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked achievements */}
      {locked.length > 0 && (
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-2">🔒 Bloqueadas</p>
          <div className="grid grid-cols-1 gap-2">
            {locked.map((ach, i) => {
              const pct = Math.min(100, Math.round((ach.progress / ach.goal) * 100));
              return (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-2xl p-3 flex items-center gap-3 glass-panel-subtle border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden"
                >
                  {/* Progress fill */}
                  {pct > 0 && (
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-slate-400/10 to-transparent pointer-events-none"
                      style={{ width: `${pct}%` }}
                    />
                  )}

                  <span className="text-xl shrink-0 opacity-40 relative z-10 grayscale">{ach.icon}</span>

                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{ach.label}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{ach.desc}</p>
                    {pct > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-0.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-slate-400 dark:bg-slate-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{ach.progress}/{ach.goal}</span>
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 relative z-10">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Lock className="w-3 h-3" />
                      <span className="text-[10px] font-mono">+{ach.reward}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
