import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    yellow: 'bg-amber-500/15 dark:bg-yellow-500/20 text-amber-700 dark:text-yellow-300 border-amber-500/30',
    blue: 'bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30',
    purple: 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30',
    rare: 'bg-gradient-to-r from-blue-500/15 to-indigo-500/15 dark:from-blue-500/25 dark:to-indigo-500/25 text-blue-700 dark:text-blue-300 border-blue-400/40 shadow-sm',
    ultraRare: 'bg-gradient-to-r from-amber-500/25 via-rose-500/20 to-purple-500/25 dark:from-amber-500/30 dark:via-rose-500/30 dark:to-purple-500/30 text-amber-700 dark:text-amber-200 border-amber-400/50 shadow-sm animate-pulse',
    success: 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    grass: 'bg-emerald-500/15 dark:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
    fire: 'bg-orange-500/15 dark:bg-orange-600/25 text-orange-700 dark:text-orange-300 border-orange-500/40',
    water: 'bg-blue-500/15 dark:bg-blue-600/25 text-blue-700 dark:text-blue-300 border-blue-500/40',
    lightning: 'bg-yellow-500/15 dark:bg-yellow-600/25 text-yellow-700 dark:text-yellow-300 border-yellow-500/40',
    psychic: 'bg-pink-500/15 dark:bg-pink-600/25 text-pink-700 dark:text-pink-300 border-pink-500/40',
    fighting: 'bg-red-500/15 dark:bg-red-800/25 text-red-700 dark:text-red-300 border-red-500/40',
    darkness: 'bg-zinc-300/60 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-300 border-zinc-400/50 dark:border-zinc-700',
    metal: 'bg-slate-300/60 dark:bg-slate-700/60 text-slate-800 dark:text-slate-300 border-slate-400/50 dark:border-slate-600',
    colorless: 'bg-stone-300/60 dark:bg-stone-800/60 text-stone-800 dark:text-stone-300 border-stone-400/50 dark:border-stone-700'
  };

  const getVariant = () => {
    if (variant === 'Ultra Rara') return variants.ultraRare;
    if (variant === 'Rara') return variants.rare;
    if (variant === 'Incomum') return variants.blue;
    if (variant === 'Comum') return variants.default;
    return variants[variant] || variants.default;
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border backdrop-blur-sm ${getVariant()} ${className}`}
    >
      {children}
    </span>
  );
};
