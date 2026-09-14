import React from 'react';
import { motion } from 'framer-motion';
import { X, Percent, ShieldCheck } from 'lucide-react';
import { BOOSTER_PACKS } from '../../data/boosterPacks';

export const DropRatesModal = ({ onClose, selectedPack = null }) => {
  const packs = selectedPack ? [selectedPack] : BOOSTER_PACKS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-2xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative border border-white/30 dark:border-white/10"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl glass-panel-subtle text-orient-torii dark:text-blue-400">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
                  Tabela de Probabilidades
                </h3>
                <span className="hanko-seal text-[9px]">確設定</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparência oficial dos sorteios e mecânicas do Gacha
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full glass-panel-subtle text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto pr-1">
          {packs.map(p => (
            <div key={p.id} className="p-4 rounded-2xl glass-panel-subtle">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-slate-900 dark:text-white text-base">{p.name} {p.subtitle ? `(${p.subtitle})` : p.series ? `(${p.series})` : ''}</span>
                <span className="text-xs font-mono font-extrabold text-amber-600 dark:text-amber-400">{p.price} Moedas</span>
              </div>

              {/* Rates Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <div className="p-2.5 rounded-xl glass-card flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Comum</span>
                    <span className="font-japanese">普</span>
                  </div>
                  <span className="text-base font-black text-slate-800 dark:text-slate-200">{p.rates?.common || 55}%</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-blue-500">
                    <span>Incomum</span>
                    <span className="font-japanese">特</span>
                  </div>
                  <span className="text-base font-black text-blue-600 dark:text-blue-300">{p.rates?.uncommon || 30}%</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-purple-500">
                    <span>Rara</span>
                    <span className="font-japanese">稀</span>
                  </div>
                  <span className="text-base font-black text-purple-600 dark:text-purple-300">{p.rates?.rare || 11}%</span>
                </div>
                <div className="p-2.5 rounded-xl glass-card flex flex-col">
                  <div className="flex items-center justify-between text-[11px] text-amber-500">
                    <span>Ultra Rara</span>
                    <span className="font-japanese">極</span>
                  </div>
                  <span className="text-base font-black text-amber-600 dark:text-amber-300">{p.rates?.ultraRare || 4}%</span>
                </div>
              </div>

              {/* Guaranteed Feature */}
              <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl glass-card">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>{p.guaranteed}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
          >
            Fechar Janela
          </button>
        </div>
      </motion.div>
    </div>
  );
};
