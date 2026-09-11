import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, RotateCcw, Coins, Layers, Tag } from 'lucide-react';
import { HolographicCard } from '../gacha/HolographicCard';
import { Button } from '../ui/Button';
import { useGame } from '../../context/GameContext';
import { tcgService } from '../../services/tcgService';

export const FishCatchModal = ({
  result,
  onClose,
  onCastAgain
}) => {
  const { addCoins, removeCardsFromInventory, addToast } = useGame();
  const { type, name, subtitle, icon, rewardText, description, coins, card } = result;

  // Sell value for a card catch
  const cardSellValue = card ? tcgService.getSellPrice(card.rarity) : 0;

  useEffect(() => {
    if (type === 'treasure' || (card && card.rarity === 'Ultra Rara') || coins >= 500) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#00E5FF', '#FFD000', '#52B788', '#FF2A54', '#FFFFFF']
      });
    }
  }, [type, card, coins]);

  // Sell the fished card immediately (it was already added to inventory by the hook)
  const handleSellCard = () => {
    if (!card) return;
    // Remove the one copy that was just added
    removeCardsFromInventory([{ cardId: card.id, count: 1 }]);
    addCoins(cardSellValue, `Carta ${card.name} vendida na hora! +${cardSellValue} PokéMoedas`);
    addToast('Carta Vendida!', `${card.name} vendida por ${cardSellValue} moedas antes de ir pro Álbum!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 dark:bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto flex flex-col items-center text-center gap-5 border border-white/20 dark:border-white/10"
      >
        {/* Header Tag */}
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-600 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-2 font-japanese">
            <Sparkles className="w-3.5 h-3.5" />
            <span>釣果 • Captura de Pesca!</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white">
            {name}
          </h2>
          <span className="text-xs text-slate-400 font-japanese font-bold">
            {subtitle}
          </span>
        </div>

        {/* Visual Item Display (Card or Treasure Icon) */}
        {type === 'card' && card ? (
          <div className="w-56 my-1">
            <HolographicCard
              card={card}
              isFlipped={true}
              isNew={true}
              interactive={true}
            />
          </div>
        ) : (
          <div className="relative my-2 w-32 h-32 rounded-3xl glass-panel-subtle flex flex-col items-center justify-center border-2 border-cyan-400/40 shadow-xl">
            <span className="text-6xl filter drop-shadow-md animate-bounce">
              {icon}
            </span>
            <div className="absolute inset-0 bg-cyan-400/10 rounded-3xl blur-xl -z-10" />
          </div>
        )}

        {/* Reward Pill */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-600 dark:text-amber-400 font-mono font-black text-base shadow-sm">
          {coins ? <Coins className="w-5 h-5 text-amber-500 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          <span>{rewardText}</span>
        </div>

        {/* Sell value hint for cards */}
        {type === 'card' && card && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            Valor de venda imediata:
            <span className="font-mono font-black text-amber-500 dark:text-amber-400">
              {cardSellValue} moedas
            </span>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
          {description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full pt-3 border-t border-slate-200 dark:border-slate-800">

          {/* Sell option — only for cards */}
          {type === 'card' && card && (
            <Button
              variant="secondary"
              size="md"
              icon={Coins}
              onClick={handleSellCard}
              className="w-full border-amber-400/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              Vender Agora por {cardSellValue} Moedas
            </Button>
          )}

          <div className="flex items-center gap-2.5 w-full">
            <Button
              variant={type === 'card' ? 'primary' : 'secondary'}
              size="md"
              icon={Layers}
              onClick={onClose}
              className="flex-1"
            >
              {type === 'card' ? 'Guardar no Álbum' : 'Fechar'}
            </Button>

            <Button
              variant="torii"
              size="md"
              icon={RotateCcw}
              onClick={onCastAgain}
              className="flex-1"
            >
              Pescar de Novo
            </Button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
