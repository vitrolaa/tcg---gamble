import React from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw, DollarSign, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useGame } from '../../context/GameContext';
import { tcgService } from '../../services/tcgService';

export const RecycleModal = ({ onClose }) => {
  const { inventory, sellSingleCard, sellAllDuplicates, getCollectionStats } = useGame();
  const stats = getCollectionStats();

  const duplicateItems = Object.values(inventory).filter(item => item.count > 1);

  const handleSellAll = () => {
    sellAllDuplicates();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-3xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto flex flex-col gap-6 border border-white/30 dark:border-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl glass-panel-subtle text-orient-torii dark:text-indigo-400">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                  Centro de Reciclagem & Troca
                </h3>
                <span className="hanko-seal text-[9px]">換金所</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Venda cópias extras para recuperar PokéMoedas e adquirir novos pacotes
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

        {/* Protection Guarantee Note */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl glass-panel-subtle text-emerald-800 dark:text-emerald-300 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>
            <strong>Álbum Protegido:</strong> O sistema mantém automaticamente 1 cópia de cada carta no seu Álbum. Apenas as cópias repetidas adicionais serão vendidas.
          </span>
        </div>

        {/* List of Duplicates */}
        {duplicateItems.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="p-4 rounded-full glass-panel-subtle text-slate-400">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">Nenhuma carta repetida encontrada</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              Você não possui cartas extras no momento. Abra novos boosters na loja para encontrar cartas raras e duplicadas para reciclagem!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {duplicateItems.map((item) => {
              const extraCount = item.count - 1;
              const unitPrice = item.card.sellValue || tcgService.getSellPrice(item.card.rarity);

              return (
                <div
                  key={item.card.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-2xl glass-panel-subtle gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.card.image}
                      alt={item.card.name}
                      className="w-12 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-900 shrink-0 shadow-sm"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {item.card.name}
                        </span>
                        <Badge variant={item.card.rarity}>
                          {item.card.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Possui <strong className="text-slate-800 dark:text-slate-200">{item.count} cópias</strong> ({extraCount} repetida{extraCount > 1 ? 's' : ''})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Valor Unitário</span>
                      <div className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        +{unitPrice} moedas
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={DollarSign}
                      onClick={() => sellSingleCard(item.card.id)}
                    >
                      Vender 1x (+{unitPrice})
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {stats.totalDuplicates > 0 ? (
              <span>
                Total de <strong className="text-slate-900 dark:text-white">{stats.totalDuplicates} cartas repetidas</strong> disponíveis.
              </span>
            ) : (
              <span>Inventário 100% limpo sem duplicadas.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl glass-panel-subtle text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors flex-1 sm:flex-none cursor-pointer"
            >
              Fechar
            </button>

            {stats.totalDuplicates > 0 && (
              <Button
                variant="torii"
                size="md"
                icon={RefreshCw}
                onClick={handleSellAll}
                className="flex-1 sm:flex-none"
              >
                Vender Todas (+{stats.totalPotentialSellValue} Moedas)
              </Button>
            )}
          </div>
        </div>

      </motion.div>
    </div>
  );
};
