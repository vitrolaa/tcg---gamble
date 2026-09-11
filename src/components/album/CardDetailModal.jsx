import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Shield, Swords, DollarSign, User, CheckCircle2 } from 'lucide-react';
import { HolographicCard } from '../gacha/HolographicCard';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useGame } from '../../context/GameContext';
import { tcgService } from '../../services/tcgService';

export const CardDetailModal = ({ card, onClose }) => {
  const { inventory, sellSingleCard } = useGame();
  const [detailedCard, setDetailedCard] = useState(card);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const inventoryItem = inventory[card.id];
  const count = inventoryItem ? inventoryItem.count : 0;
  const isOwned = count > 0;
  const hasDuplicates = count > 1;

  const sellPrice = detailedCard?.sellValue || tcgService.getSellPrice(detailedCard?.rarity);

  useEffect(() => {
    let isMounted = true;
    async function loadFullDetails() {
      if (!card.attacks || card.attacks.length === 0) {
        setIsLoadingDetails(true);
        try {
          const details = await tcgService.getCardDetails(card.id);
          if (details && isMounted) {
            setDetailedCard(prev => ({ ...prev, ...details }));
          }
        } catch (e) {
          console.warn('Failed to load card full details:', e);
        } finally {
          if (isMounted) setIsLoadingDetails(false);
        }
      }
    }
    loadFullDetails();
    return () => { isMounted = false; };
  }, [card.id, card.attacks]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative my-auto border border-white/30 dark:border-white/10"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-panel-subtle hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: 3D Holographic Card */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-64 sm:w-72">
              <HolographicCard
                card={detailedCard}
                isFlipped={true}
                interactive={true}
                showDuplicateBadge={hasDuplicates}
                duplicateCount={count}
              />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-semibold text-center">
              Passe o cursor sobre a carta para ver o reflexo 3D
            </span>
          </div>

          {/* Right Column: Card Meta & Battle Stats */}
          <div className="md:col-span-7 flex flex-col gap-4">
            
            {/* Header: Name & HP */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
                    {detailedCard.name}
                  </h2>
                  <Badge variant={detailedCard.rarity}>
                    {detailedCard.rarity}
                  </Badge>
                  {isOwned ? (
                    <span className="hanko-seal text-[9px]">入手済</span>
                  ) : (
                    <span className="hanko-seal text-[9px] opacity-50">未所持</span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span>Nº #{detailedCard.localId}</span>
                  <span>•</span>
                  <span>{detailedCard.stage || 'Básico'}</span>
                  <span>•</span>
                  <span className="text-orient-torii dark:text-poke-yellow font-bold">TCGDex PT-BR</span>
                </div>
              </div>

              {detailedCard.hp && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pontos de Vida</span>
                  <div className="text-2xl font-black font-display text-emerald-600 dark:text-emerald-400">
                    {detailedCard.hp} <span className="text-xs text-emerald-500 font-sans font-bold">PS</span>
                  </div>
                </div>
              )}
            </div>

            {/* Element Types */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tipo de Energia:</span>
              <div className="flex items-center gap-1.5">
                {(detailedCard.types || ['Incolor']).map((t, idx) => (
                  <Badge key={idx} variant={t}>
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Attacks List */}
            <div className="flex flex-col gap-2.5 my-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-display">
                Ataques & Habilidades
              </span>

              {detailedCard.attacks && detailedCard.attacks.length > 0 ? (
                detailedCard.attacks.map((atk, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl glass-panel-subtle flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-orient-torii dark:text-poke-yellow" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{atk.name}</span>
                      </div>
                      {atk.damage && atk.damage !== '0' && (
                        <span className="text-base font-black font-mono text-rose-600 dark:text-rose-400">
                          {atk.damage}
                        </span>
                      )}
                    </div>
                    {atk.effect && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                        {atk.effect}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhum ataque detalhado registrado.</p>
              )}
            </div>

            {/* Illustrator & Weakness */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl glass-panel-subtle text-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">Ilustrador: <strong className="text-slate-800 dark:text-slate-200">{detailedCard.illustrator || 'Oficial TCG'}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Fraqueza: <strong className="text-slate-800 dark:text-slate-200">{detailedCard.weaknesses?.[0]?.type || 'Nenhuma'} ({detailedCard.weaknesses?.[0]?.value || 'x2'})</strong></span>
              </div>
            </div>

            {/* Inventory Status & Sell Action Box */}
            <div className="mt-2 p-4 rounded-2xl glass-panel-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${
                  isOwned 
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isOwned ? `Você possui ${count}x cópia${count > 1 ? 's' : ''}` : 'Carta não obtida no Álbum'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {hasDuplicates
                      ? `Você tem ${count - 1} repetida${count > 2 ? 's' : ''} disponível para venda.`
                      : isOwned
                      ? '1 cópia protegida no seu álbum.'
                      : 'Abra pacotes na loja para encontrá-la!'}
                  </p>
                </div>
              </div>

              {hasDuplicates && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={DollarSign}
                  onClick={() => sellSingleCard(card.id)}
                >
                  Vender 1x (+{sellPrice} Moedas)
                </Button>
              )}
            </div>

          </div>

        </div>
      </motion.div>
    </div>
  );
};
