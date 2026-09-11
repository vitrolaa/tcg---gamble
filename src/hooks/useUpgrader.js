import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { soundService } from '../services/soundService';

export const UPGRADE_TIERS = [
  {
    id: 'tier_common_to_uncommon',
    name: 'Fusão Básica',
    subtitle: 'Comum ➔ Incomum',
    inputRarity: 'Comum',
    outputRarity: 'Incomum',
    requiredCount: 20,
    kanji: '初段',
    accentColor: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/40',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Funda 20 cartas de raridade Comum para forjar 1 carta de raridade Incomum.'
  },
  {
    id: 'tier_uncommon_to_rare',
    name: 'Fusão Avançada',
    subtitle: 'Incomum ➔ Rara',
    inputRarity: 'Incomum',
    outputRarity: 'Rara',
    requiredCount: 15,
    kanji: '中段',
    accentColor: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/40',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Funda 15 cartas de raridade Incomum para forjar 1 carta de raridade Rara com brilho holográfico.'
  },
  {
    id: 'tier_rare_to_ultra',
    name: 'Alquimia Lendária',
    subtitle: 'Rara ➔ Ultra Rara',
    inputRarity: 'Rara',
    outputRarity: 'Ultra Rara',
    requiredCount: 10,
    kanji: '奥義',
    accentColor: 'from-amber-400 via-rose-500 to-purple-600',
    borderColor: 'border-amber-400/50',
    glowColor: 'rgba(255, 208, 0, 0.5)',
    description: 'Funda 10 cartas de raridade Rara para forjar 1 prestigiosa carta Ultra Rara ex / Lendária!'
  }
];

export const useUpgrader = () => {
  const { inventory, cardPool, addCardsToInventory, addToast } = useGame();

  // Calculate available cards by rarity (both total and safe duplicates)
  const getCardsByRarity = useCallback((rarity) => {
    const list = [];
    Object.values(inventory).forEach(item => {
      if (item.card.rarity === rarity && item.count > 0) {
        list.push(item);
      }
    });
    return list;
  }, [inventory]);

  // Total available count of a rarity
  const getTotalCountByRarity = useCallback((rarity, duplicatesOnly = false) => {
    let sum = 0;
    Object.values(inventory).forEach(item => {
      if (item.card.rarity === rarity) {
        sum += duplicatesOnly ? Math.max(0, item.count - 1) : item.count;
      }
    });
    return sum;
  }, [inventory]);

  // Auto-fill recipe using available cards (prioritizes duplicates first, then base copies if allowed)
  const autoFillRecipe = useCallback((tier, allowBaseCopies = false) => {
    const needed = tier.requiredCount;
    const items = getCardsByRarity(tier.inputRarity);
    const selected = []; // array of { cardId, card, count }

    let countFilled = 0;

    // First pass: fill with duplicates only (item.count > 1)
    for (const item of items) {
      if (countFilled >= needed) break;
      const availableDuplicates = Math.max(0, item.count - 1);
      if (availableDuplicates > 0) {
        const take = Math.min(needed - countFilled, availableDuplicates);
        selected.push({
          cardId: item.card.id,
          card: item.card,
          count: take
        });
        countFilled += take;
      }
    }

    // Second pass: if allowed and still need more, take base copies
    if (allowBaseCopies && countFilled < needed) {
      for (const item of items) {
        if (countFilled >= needed) break;
        const alreadySelected = selected.find(s => s.cardId === item.card.id)?.count || 0;
        const remainingInItem = item.count - alreadySelected;
        if (remainingInItem > 0) {
          const take = Math.min(needed - countFilled, remainingInItem);
          const existing = selected.find(s => s.cardId === item.card.id);
          if (existing) {
            existing.count += take;
          } else {
            selected.push({
              cardId: item.card.id,
              card: item.card,
              count: take
            });
          }
          countFilled += take;
        }
      }
    }

    return {
      selected,
      countFilled,
      isComplete: countFilled >= needed
    };
  }, [getCardsByRarity]);

  // Execute the Forge/Upgrade
  const executeUpgrade = useCallback((tier, selectedSacrifices, setInventoryDirect) => {
    // 1. Calculate total sacrificed
    const totalCount = selectedSacrifices.reduce((acc, item) => acc + item.count, 0);
    if (totalCount < tier.requiredCount) {
      addToast('Cartas Insuficientes', `Você precisa de exatamente ${tier.requiredCount} cartas ${tier.inputRarity}s para esta fusão.`, 'error');
      return null;
    }

    // 2. Deduct sacrificed cards from inventory
    setInventoryDirect(prev => {
      const next = { ...prev };
      selectedSacrifices.forEach(item => {
        if (next[item.cardId]) {
          const newCount = next[item.cardId].count - item.count;
          if (newCount <= 0) {
            delete next[item.cardId];
          } else {
            next[item.cardId] = {
              ...next[item.cardId],
              count: newCount
            };
          }
        }
      });
      return next;
    });

    // 3. Find candidate output cards of target rarity
    const targetPool = cardPool.filter(c => c.rarity === tier.outputRarity);
    if (targetPool.length === 0) {
      addToast('Erro', 'Nenhuma carta encontrada para a raridade de destino.', 'error');
      return null;
    }

    // Prioritize cards that the user doesn't own yet for maximum satisfaction!
    const unownedTargets = targetPool.filter(c => !inventory[c.id]);
    let forgedCard = null;
    if (unownedTargets.length > 0) {
      const idx = Math.floor(Math.random() * unownedTargets.length);
      forgedCard = unownedTargets[idx];
    } else {
      const idx = Math.floor(Math.random() * targetPool.length);
      forgedCard = targetPool[idx];
    }

    // 4. Add forged card to inventory
    addCardsToInventory([forgedCard]);

    return forgedCard;
  }, [cardPool, inventory, addCardsToInventory, addToast]);

  return {
    UPGRADE_TIERS,
    getCardsByRarity,
    getTotalCountByRarity,
    autoFillRecipe,
    executeUpgrade
  };
};
