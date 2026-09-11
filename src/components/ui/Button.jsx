import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  icon: Icon,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-bold tracking-wide rounded-xl sm:rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm active:scale-95 select-none';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-xs sm:text-sm gap-2',
    lg: 'px-6 py-3 text-sm sm:text-base gap-2.5',
    xl: 'px-8 py-3.5 text-base sm:text-lg gap-3'
  };

  const variants = {
    primary: 'bg-gradient-to-r from-amber-500 via-orient-yamabuki to-amber-600 text-slate-950 hover:brightness-105 shadow-amber-500/20 border border-amber-400/40',
    blue: 'bg-gradient-to-r from-blue-600 via-poke-blue to-indigo-600 text-white hover:brightness-110 shadow-blue-600/20 border border-blue-400/30',
    torii: 'bg-gradient-to-r from-orient-torii to-rose-600 text-white hover:brightness-110 shadow-red-600/20 border border-red-400/30',
    danger: 'bg-gradient-to-r from-rose-600 to-red-700 text-white hover:brightness-110 shadow-rose-600/20 border border-rose-400/30',
    secondary: 'bg-slate-200/80 dark:bg-slate-800/80 hover:bg-slate-300/80 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-300/80 dark:border-slate-700/80',
    glass: 'glass-panel-subtle hover:bg-white/40 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-white/60 dark:border-white/10 shadow-sm'
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' || size === 'xl' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </motion.button>
  );
};
