import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Plus, Minus, Check, Flame, ShieldAlert, Layers, ShieldCheck, ArrowRight } from 'lucide-react';
import { UPGRADE_TIERS, useUpgrader } from '../../hooks/useUpgrader';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { UpgradeAnimationModal } from './UpgradeAnimationModal';

export const CardUpgrader = ({ onOpenAlbum }) => {
  const { inventory, removeCardsFromInventory, addCardsToInventory, addToast } = useGame();
  const { getCardsByRarity, getTotalCountByRarity, autoFillRecipe, executeUpgrade } = useUpgrader();

  const [activeTierId, setActiveTierId] = useState('tier_common_to_uncommon');
  const [selectedCards, setSelectedCards] = useState([]); // [{ cardId, card, count }]
  const [allowBaseCopies, setAllowBaseCopies] = useState(false);
  const [forgedResult, setForgedResult] = useState(null);

  const activeTier = UPGRADE_TIERS.find(t => t.id === activeTierId) || UPGRADE_TIERS[0];
  const availableItems = getCardsByRarity(activeTier.inputRarity);
  const totalDuplicatesAvailable = getTotalCountByRarity(activeTier.inputRarity, true);
  const totalCardsAvailable = getTotalCountByRarity(activeTier.inputRarity, false);

  const totalSelectedCount = selectedCards.reduce((sum, item) => sum + item.count, 0);
  const isReadyToForge = totalSelectedCount === activeTier.requiredCount;

  // Auto-Fill Handler
  const handleAutoFill = () => {
    const result = autoFillRecipe(activeTier, allowBaseCopies);
    setSelectedCards(result.selected);
    if (!result.isComplete) {
      addToast(
        'Cartas Insuficientes',
        `Preenchido ${result.countFilled}/${activeTier.requiredCount} cartas. Você precisa de mais cartas ${activeTier.inputRarity}s para completar a fusão!`,
        'warning'
      );
    } else {
      addToast(
        'Slots Preenchidos!',
        `${activeTier.requiredCount} cartas ${activeTier.inputRarity}s selecionadas automaticamente. Pronto para forjar!`,
        'success'
      );
    }
  };

  // Manual Selection Increment / Decrement
  const handleAddCard = (cardItem) => {
    if (totalSelectedCount >= activeTier.requiredCount) {
      addToast('Limite Atingido', `Você já selecionou as ${activeTier.requiredCount} cartas necessárias.`, 'info');
      return;
    }

    const currentSelected = selectedCards.find(s => s.cardId === cardItem.card.id)?.count || 0;
    const maxAllowed = allowBaseCopies ? cardItem.count : Math.max(0, cardItem.count - 1);

    if (currentSelected >= maxAllowed) {
      if (!allowBaseCopies && cardItem.count === 1) {
        addToast('Carta Protegida', 'Ative "Usar cartas únicas do Álbum" caso deseje sacrificar sua única cópia.', 'warning');
      } else {
        addToast('Máximo Atingido', 'Todas as cópias disponíveis desta carta já foram selecionadas.', 'info');
      }
      return;
    }

    setSelectedCards(prev => {
      const existing = prev.find(s => s.cardId === cardItem.card.id);
      if (existing) {
        return prev.map(s => s.cardId === cardItem.card.id ? { ...s, count: s.count + 1 } : s);
      }
      return [...prev, { cardId: cardItem.card.id, card: cardItem.card, count: 1 }];
    });
  };

  const handleRemoveCard = (cardId) => {
    setSelectedCards(prev => {
      const existing = prev.find(s => s.cardId === cardId);
      if (!existing) return prev;
      if (existing.count <= 1) {
        return prev.filter(s => s.cardId !== cardId);
      }
      return prev.map(s => s.cardId === cardId ? { ...s, count: s.count - 1 } : s);
    });
  };

  const handleClearSelection = () => {
    setSelectedCards([]);
  };

  // Execute Forge Upgrade
  const handleStartUpgrade = () => {
    if (!isReadyToForge) return;

    // Deduct and forge
    removeCardsFromInventory(selectedCards);
    const forged = executeUpgrade(activeTier, selectedCards, () => {});
    if (forged) {
      setForgedResult(forged);
      setSelectedCards([]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Upgrader Hero Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 mb-8 shadow-xl overflow-hidden">
        
        {/* Japanese Watermark */}
        <div className="absolute right-4 -bottom-8 text-9xl font-black text-slate-900/[0.04] dark:text-white/[0.03] select-none pointer-events-none font-japanese">
          錬金
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orient-torii/15 border border-orient-torii/30 text-orient-torii dark:text-poke-yellow text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Altar de Fusão Alquímica • 錬金術</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Upgrader de <span className="text-orient-torii dark:text-poke-yellow">Raridades</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Combine suas cartas repetidas para forjar cartas de tiers superiores! 
              <strong className="text-slate-900 dark:text-white"> 20 Comuns ➔ 1 Incomum</strong>, 
              <strong className="text-slate-900 dark:text-white"> 15 Incomuns ➔ 1 Rara</strong> ou 
              <strong className="text-slate-900 dark:text-white"> 10 Raras ➔ 1 Ultra Rara</strong> garantida!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-4 rounded-2xl glass-panel-subtle flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total de Repetidas</span>
                <span className="text-lg font-mono font-black text-slate-900 dark:text-white">
                  {totalDuplicatesAvailable} cartas
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Selector Tabs (3 Recipes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {UPGRADE_TIERS.map((tier) => {
          const isCurrent = activeTierId === tier.id;
          const availableDupes = getTotalCountByRarity(tier.inputRarity, true);
          const availableTotal = getTotalCountByRarity(tier.inputRarity, false);

          return (
            <motion.button
              key={tier.id}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveTierId(tier.id);
                setSelectedCards([]);
              }}
              className={`p-5 rounded-3xl glass-panel text-left flex flex-col justify-between transition-all duration-300 cursor-pointer relative overflow-hidden border-2 ${
                isCurrent
                  ? 'border-orient-torii dark:border-poke-yellow shadow-lg'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="hanko-seal text-[9px]">{tier.kanji}</span>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {tier.requiredCount}x {tier.inputRarity}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
                  {tier.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={tier.inputRarity}>{tier.inputRarity}</Badge>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <Badge variant={tier.outputRarity}>{tier.outputRarity}</Badge>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500">Repetidas disponíveis:</span>
                <strong className={availableDupes >= tier.requiredCount ? 'text-emerald-500' : 'text-slate-400'}>
                  {availableDupes} / {tier.requiredCount}
                </strong>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Crucible Altar Control Center */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-xl mb-8 relative">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/80">
          
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white">
                {activeTier.name} — ({activeTier.subtitle})
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {activeTier.description}
            </p>
          </div>

          {/* Quick Actions & Protection Toggle */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl glass-panel-subtle text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowBaseCopies}
                onChange={(e) => setAllowBaseCopies(e.target.checked)}
                className="rounded text-orient-torii focus:ring-0 cursor-pointer"
              />
              <span>Usar cartas únicas do Álbum</span>
            </label>

            <Button
              variant="glass"
              size="md"
              icon={Sparkles}
              onClick={handleAutoFill}
            >
              Auto-Preencher ({activeTier.requiredCount}x)
            </Button>

            {selectedCards.length > 0 && (
              <button
                onClick={handleClearSelection}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>

        </div>

        {/* Progress Fill Bar */}
        <div className="my-6">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-slate-500">Cartas Selecionadas para o Sacrifício:</span>
            <span className={`font-mono text-sm ${isReadyToForge ? 'text-emerald-500' : 'text-slate-400'}`}>
              {totalSelectedCount} / {activeTier.requiredCount} cartas
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-200/80 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-800 shadow-inner">
            <motion.div
              animate={{ width: `${Math.min(100, (totalSelectedCount / activeTier.requiredCount) * 100)}%` }}
              className="h-full rounded-full bg-gradient-to-r from-orient-torii via-amber-400 to-emerald-400 shadow-md transition-all duration-300"
            />
          </div>
        </div>

        {/* Selected Cards Visual Rack */}
        {selectedCards.length > 0 ? (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
            {selectedCards.map((item) => (
              <div
                key={item.cardId}
                className="p-2 rounded-2xl glass-panel-subtle flex items-center gap-2.5 shrink-0 border border-slate-300 dark:border-slate-700"
              >
                <img
                  src={item.card.image}
                  alt={item.card.name}
                  className="w-10 h-14 object-cover rounded-lg border border-slate-700"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">
                    {item.card.name}
                  </span>
                  <span className="text-[10px] text-amber-500 font-bold">
                    {item.count}x selecionada
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveCard(item.cardId)}
                  className="p-1 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl glass-panel-subtle text-center text-xs text-slate-400 mb-6 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Nenhuma carta selecionada. Clique no botão <strong>Auto-Preencher</strong> ou selecione as cartas abaixo.</span>
          </div>
        )}

        {/* Action Forge Trigger */}
        <div className="flex justify-end">
          <Button
            variant={isReadyToForge ? 'torii' : 'secondary'}
            size="lg"
            icon={Zap}
            disabled={!isReadyToForge}
            onClick={handleStartUpgrade}
            className="w-full sm:w-auto"
          >
            {isReadyToForge ? `Iniciar Fusão Alquímica (${activeTier.name})` : `Selecione mais ${activeTier.requiredCount - totalSelectedCount} cartas`}
          </Button>
        </div>

      </div>

      {/* Available Cards Pool for Manual Selection */}
      <div className="rounded-3xl glass-panel p-6 sm:p-8 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h3 className="text-lg font-display font-black text-slate-900 dark:text-white">
              Suas Cartas {activeTier.inputRarity}s Disponíveis
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Toque no botão + para adicionar cópias individuais ao sacrifício
            </p>
          </div>

          <span className="text-xs text-slate-500 font-mono font-bold">
            {availableItems.length} tipos de cartas encontradas
          </span>
        </div>

        {availableItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            Você não possui cartas de raridade {activeTier.inputRarity} no seu inventário. Abra mais boosters na loja!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {availableItems.map((item) => {
              const selectedCount = selectedCards.find(s => s.cardId === item.card.id)?.count || 0;
              const usableCount = allowBaseCopies ? item.count : Math.max(0, item.count - 1);
              const isProtectedOnly = !allowBaseCopies && item.count === 1;

              return (
                <div
                  key={item.card.id}
                  className={`p-3 rounded-2xl glass-panel-subtle flex flex-col justify-between gap-2 border transition-all ${
                    selectedCount > 0 ? 'border-orient-torii dark:border-poke-yellow shadow-md' : 'border-transparent'
                  }`}
                >
                  <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-900">
                    <img
                      src={item.card.image}
                      alt={item.card.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-mono font-bold border border-white/20">
                      x{item.count}
                    </div>

                    {isProtectedOnly && (
                      <div className="absolute bottom-1 inset-x-1 p-1 rounded bg-slate-950/90 text-[9px] text-amber-300 font-bold text-center">
                        1x Álbum (Protegida)
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {item.card.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      #{item.card.localId}
                    </span>
                  </div>

                  {/* Increment / Decrement Stepper */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-200/50 dark:border-slate-800/60">
                    <button
                      onClick={() => handleRemoveCard(item.card.id)}
                      disabled={selectedCount === 0}
                      className="p-1.5 rounded-lg glass-panel text-slate-500 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-xs font-mono font-extrabold text-slate-900 dark:text-white">
                      {selectedCount}
                    </span>

                    <button
                      onClick={() => handleAddCard(item)}
                      disabled={selectedCount >= usableCount || totalSelectedCount >= activeTier.requiredCount}
                      className="p-1.5 rounded-lg glass-panel text-slate-500 hover:text-emerald-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Upgrade Result Animation Modal */}
      {forgedResult && (
        <UpgradeAnimationModal
          tier={activeTier}
          forgedCard={forgedResult}
          onClose={() => setForgedResult(null)}
          onForgeAnother={() => setForgedResult(null)}
        />
      )}

    </div>
  );
};
