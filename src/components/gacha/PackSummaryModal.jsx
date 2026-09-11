import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Layers, Coins, Tag, CheckCircle2, BadgeDollarSign } from 'lucide-react';
import { Button } from '../ui/Button';
import { HolographicCard } from './HolographicCard';
import { useGame } from '../../context/GameContext';
import { tcgService } from '../../services/tcgService';

export const PackSummaryModal = ({
  packResult,
  onOpenAnother,
  onCloseToAlbum,
  onSelectCard
}) => {
  const { coins, addCoins, removeCardsFromInventory, addToast } = useGame();
  const { pack, cards, hasUltra, stats } = packResult;

  // Track which cards have been sold directly from the summary
  const [soldCardIndices, setSoldCardIndices] = useState(new Set());
  const [totalInstantSell, setTotalInstantSell] = useState(0);

  useEffect(() => {
    if (hasUltra) {
      confetti({
        particleCount: 130,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#E63946', '#F4A261', '#52B788', '#FF758F', '#FFFFFF']
      });
    }
  }, [hasUltra]);

  const getSellValue = (card) => tcgService.getSellPrice(card.rarity);

  const handleSellCard = (card, idx) => {
    if (soldCardIndices.has(idx)) return;
    const value = getSellValue(card);
    // Remove the one copy that was added to inventory
    removeCardsFromInventory([{ cardId: card.id, count: 1 }]);
    addCoins(value);
    setSoldCardIndices(prev => new Set([...prev, idx]));
    setTotalInstantSell(prev => prev + value);
    addToast('Carta Vendida!', `${card.name} vendida por ${value} moedas!`, 'success');
  };

  const handleSellAll = () => {
    let total = 0;
    const toRemove = [];
    cards.forEach((card, idx) => {
      if (!soldCardIndices.has(idx)) {
        const value = getSellValue(card);
        toRemove.push({ cardId: card.id, count: 1 });
        total += value;
      }
    });
    if (toRemove.length === 0) return;
    removeCardsFromInventory(toRemove);
    addCoins(total);
    setSoldCardIndices(new Set(cards.map((_, i) => i)));
    setTotalInstantSell(prev => prev + total);
    addToast('Todas Vendidas!', `${toRemove.length} cartas vendidas por ${total} moedas no total!`, 'success');
  };

  const remainingCards = cards.filter((_, i) => !soldCardIndices.has(i)).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-5xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto flex flex-col gap-6 border border-white/30 dark:border-white/10"
      >
        {/* Header Title */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orient-torii/10 dark:bg-poke-blue/20 border border-orient-torii/30 dark:border-poke-blue/40 text-orient-torii dark:text-blue-300 text-xs font-extrabold uppercase tracking-widest mb-2">
            <span className="font-japanese text-[10px]">開封結果</span>
            <span>{pack.name} Revelado!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            {hasUltra ? (
              <span className="bg-gradient-to-r from-amber-500 via-orient-torii to-pink-500 bg-clip-text text-transparent">
                ★ Sorte Lendária! Carta Ultra Rara Encontrada! ★
              </span>
            ) : (
              'Parabéns pelas novas cartas!'
            )}
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Você obteve <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.newCardsCount} novas cartas</strong> e{' '}
            <strong className="text-amber-600 dark:text-amber-400 font-bold">{stats.duplicateCardsCount} repetidas</strong>.
            {totalInstantSell > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-amber-500 font-bold">
                <Coins className="w-3.5 h-3.5" /> +{totalInstantSell} moedas arrecadadas
              </span>
            )}
          </p>
        </div>

        {/* 7 Cards Grid — each with sell option */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 my-2">
          {cards.map((card, idx) => {
            const isSold = soldCardIndices.has(idx);
            const sellValue = getSellValue(card);

            return (
              <motion.div
                key={`${card.id}-${idx}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className="flex flex-col gap-1.5"
              >
                {/* Card visual — greyed & overlaid when sold */}
                <div className="relative">
                  <div className={isSold ? 'opacity-30 grayscale pointer-events-none' : ''}>
                    <HolographicCard
                      card={card}
                      isFlipped={true}
                      interactive={!isSold}
                      onClick={() => !isSold && onSelectCard && onSelectCard(card)}
                    />
                  </div>

                  {/* Sold overlay badge */}
                  <AnimatePresence>
                    {isSold && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-slate-900/70 backdrop-blur-sm"
                      >
                        <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 mt-1">VENDIDA</span>
                        <span className="text-[10px] font-mono text-amber-400">+{sellValue} 🪙</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Card info */}
                <div className="text-center">
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block">
                    {card.name}
                  </span>
                  <span className={`text-[10px] font-bold ${
                    card.rarity === 'Ultra Rara' ? 'text-amber-600 dark:text-amber-400' :
                    card.rarity === 'Rara' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>
                    {card.rarity}
                  </span>
                </div>

                {/* Per-card sell button */}
                {!isSold ? (
                  <button
                    onClick={() => handleSellCard(card, idx)}
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-bold py-1 px-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/25 border border-amber-400/30 hover:border-amber-400/60 text-amber-600 dark:text-amber-400 transition-all duration-150 cursor-pointer"
                  >
                    <Tag className="w-3 h-3" />
                    Vender {sellValue}🪙
                  </button>
                ) : (
                  <div className="w-full text-center text-[10px] font-bold text-emerald-500 py-1">
                    ✓ Vendida
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              {remainingCards > 0
                ? `${remainingCards} carta${remainingCards > 1 ? 's' : ''} guardam no Álbum ao fechar.`
                : 'Todas as cartas foram vendidas!'}
            </div>
            {remainingCards > 0 && (
              <button
                onClick={handleSellAll}
                className="flex items-center gap-1 text-amber-500 hover:text-amber-400 font-bold transition-colors cursor-pointer"
              >
                <BadgeDollarSign className="w-3.5 h-3.5" />
                Vender todas as {remainingCards} restantes
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              icon={Layers}
              onClick={onCloseToAlbum}
              className="flex-1 sm:flex-none"
            >
              Ver no Álbum
            </Button>

            <Button
              variant="torii"
              size="md"
              icon={RotateCcw}
              disabled={coins < pack.price}
              onClick={() => onOpenAnother(pack)}
              className="flex-1 sm:flex-none"
            >
              Abrir Outro ({pack.price} Moedas)
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
