import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundService } from '../services/soundService';
import { tcgService } from '../services/tcgService';

export const useGacha = () => {
  const { cardPool, spendCoins, addCardsToInventory, addToast, incrementPity, resetPity, shouldTriggerPity } = useGame();

  // Helper to pick a random card from a specific array
  const pickRandomFromPool = useCallback((cards) => {
    if (!cards || cards.length === 0) return null;
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
  }, []);

  // Weighted draw for a single card based on pack odds
  const drawSingleCard = useCallback((pack, pool, forcedRarity = null) => {
    const commons = pool.filter(c => c.rarity === 'Comum');
    const uncommons = pool.filter(c => c.rarity === 'Incomum');
    const rares = pool.filter(c => c.rarity === 'Rara');
    const ultraRares = pool.filter(c => c.rarity === 'Ultra Rara');

    let chosenRarity = forcedRarity;

    if (!chosenRarity) {
      const roll = Math.random() * 100;
      const { common = 55, uncommon = 30, rare = 11 } = pack.rates || {};

      if (roll < common) {
        chosenRarity = 'Comum';
      } else if (roll < common + uncommon) {
        chosenRarity = 'Incomum';
      } else if (roll < common + uncommon + rare) {
        chosenRarity = 'Rara';
      } else {
        chosenRarity = 'Ultra Rara';
      }
    }

    let card = null;
    if (chosenRarity === 'Ultra Rara' && ultraRares.length > 0) {
      card = pickRandomFromPool(ultraRares);
    } else if (chosenRarity === 'Rara' && rares.length > 0) {
      card = pickRandomFromPool(rares);
    } else if (chosenRarity === 'Incomum' && uncommons.length > 0) {
      card = pickRandomFromPool(uncommons);
    } else if (commons.length > 0) {
      card = pickRandomFromPool(commons);
    } else {
      card = pickRandomFromPool(pool);
    }

    return card;
  }, [pickRandomFromPool]);

  // Main Booster Pack Opening Algorithm (7 Cards) with Specific Set Pool Support
  const openBoosterPack = useCallback(async (pack) => {
    // 1. Check if user has coins
    const hasCoins = spendCoins(pack.price);
    if (!hasCoins) return null;

    // 2. Fetch specific set cards if opening an official expansion pack
    let packCardPool = [];
    try {
      if (pack.id && !pack.id.startsWith('pack_custom')) {
        packCardPool = await tcgService.getSetCardPool(pack.id);
      }
    } catch (e) {
      console.warn('Error loading set pool, using global pool:', e);
    }

    if (!packCardPool || packCardPool.length === 0) {
      packCardPool = cardPool;
    }

    if (!packCardPool || packCardPool.length === 0) {
      addToast('Erro', 'Banco de cartas ainda não carregou. Tente novamente em instantes.', 'error');
      return null;
    }

    const drawnCards = [];

    // Slot 1-4: Standard weighted distribution
    for (let i = 0; i < 4; i++) {
      drawnCards.push(drawSingleCard(pack, packCardPool));
    }

    // Slot 5: Guaranteed Uncommon or better
    const isSlot5Rare = Math.random() < 0.25;
    drawnCards.push(drawSingleCard(pack, packCardPool, isSlot5Rare ? 'Rara' : 'Incomum'));

    // Slot 6: Guaranteed Uncommon or better
    const isSlot6Rare = Math.random() < 0.35;
    drawnCards.push(drawSingleCard(pack, packCardPool, isSlot6Rare ? 'Rara' : 'Incomum'));

    // Slot 7: Climax Slot — Pity triggers Ultra Rare if overdue, else 6% chance
    const pitySave = shouldTriggerPity();
    const isSlot7Ultra = pitySave || Math.random() < 0.06;
    drawnCards.push(drawSingleCard(pack, packCardPool, isSlot7Ultra ? 'Ultra Rara' : 'Rara'));

    const validCards = drawnCards.filter(Boolean);

    // Save to inventory
    const inventoryResult = addCardsToInventory(validCards);

    // Check if pack contained Ultra Rare
    const hasUltra = validCards.some(c => c.rarity === 'Ultra Rara');

    if (hasUltra) {
      resetPity();
      soundService.playUltraRareFanfare();
    } else {
      incrementPity();
    }

    return {
      pack,
      cards: validCards,
      hasUltra,
      stats: inventoryResult
    };
  }, [cardPool, spendCoins, drawSingleCard, addCardsToInventory, addToast, incrementPity, resetPity, shouldTriggerPity]);

  return {
    openBoosterPack
  };
};
