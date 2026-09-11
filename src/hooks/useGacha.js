import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundService } from '../services/soundService';

export const useGacha = () => {
  const { cardPool, spendCoins, addCardsToInventory, addToast, incrementPity, resetPity, shouldTriggerPity } = useGame();

  // Helper to pick a random card from a specific rarity list
  const pickRandomFromPool = useCallback((cards) => {
    if (!cards || cards.length === 0) return null;
    const index = Math.floor(Math.random() * cards.length);
    return cards[index];
  }, []);

  // Weighted draw for a single card based on pack odds
  const drawSingleCard = useCallback((pack, commons, uncommons, rares, ultraRares, forcedRarity = null) => {
    let chosenRarity = forcedRarity;

    if (!chosenRarity) {
      const roll = Math.random() * 100;
      const { common, uncommon, rare } = pack.rates;

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

    // Select from respective pool, with fallback if pool is empty
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
      // General fallback to any card in pool
      card = pickRandomFromPool(cardPool);
    }

    return card;
  }, [cardPool, pickRandomFromPool]);

  // Main Booster Pack Opening Algorithm (7 Cards)
  const openBoosterPack = useCallback((pack) => {
    // 1. Validate card pool
    if (!cardPool || cardPool.length === 0) {
      addToast('Erro', 'Banco de cartas ainda não carregou. Tente novamente em alguns segundos.', 'error');
      return null;
    }

    // 2. Validate and deduct coins
    const hasCoins = spendCoins(pack.price);
    if (!hasCoins) return null;

    // 3. Separate card pool by normalized rarity
    const commons = cardPool.filter(c => c.rarity === 'Comum');
    const uncommons = cardPool.filter(c => c.rarity === 'Incomum');
    const rares = cardPool.filter(c => c.rarity === 'Rara');
    const ultraRares = cardPool.filter(c => c.rarity === 'Ultra Rara');

    const drawnCards = [];

    // Slot distribution logic per pack type
    if (pack.id === 'pack_legendary') {
      // Legendary Pack: 1 Ultra Rare guaranteed, 2 Rares guaranteed, others high-tier
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Incomum'));
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Incomum'));
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Rara'));
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Rara'));
      // Slots 5-6 livres: chance mínima de Ultra Rara (5%), caso contrário Rara ou Incomum
      const isSlot5LegUltra = Math.random() < 0.05;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isSlot5LegUltra ? 'Ultra Rara' : 'Rara'));
      const isSlot6LegUltra = Math.random() < 0.05;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isSlot6LegUltra ? 'Ultra Rara' : 'Rara'));
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Ultra Rara'));
    } else if (pack.id === 'pack_elite') {
      // Elite Pack: 4 standard, 1 Uncommon guaranteed, 1 Rare guaranteed, 1 Rare/Ultra slot
      for (let i = 0; i < 4; i++) {
        drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares));
      }
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Incomum'));
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, 'Rara'));
      // Final slot: 8% Ultra Rare, 92% Rare
      const isUltra = Math.random() < 0.08;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isUltra ? 'Ultra Rara' : 'Rara'));
    } else {
      // Basic Pack (7 Cards):
      // Slots 1-4: Standard weighted
      for (let i = 0; i < 4; i++) {
        drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares));
      }
      // Slot 5: Guaranteed Uncommon or better
      const isSlot5Rare = Math.random() < 0.2;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isSlot5Rare ? 'Rara' : 'Incomum'));
      // Slot 6: Guaranteed Uncommon or better
      const isSlot6Rare = Math.random() < 0.25;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isSlot6Rare ? 'Rara' : 'Incomum'));
      // Slot 7: Climax Slot — Pity garante Ultra Rara após 10 pacotes sem uma; senão 4%
      const pitySave = shouldTriggerPity();
      const isSlot7Ultra = pitySave || Math.random() < 0.04;
      drawnCards.push(drawSingleCard(pack, commons, uncommons, rares, ultraRares, isSlot7Ultra ? 'Ultra Rara' : 'Rara'));
    }

    // Filter nulls if any
    const validCards = drawnCards.filter(Boolean);

    // Save to inventory
    const inventoryResult = addCardsToInventory(validCards);

    // Check if pack contained Ultra Rare
    const hasUltra = validCards.some(c => c.rarity === 'Ultra Rara');

    // Update pity counter
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
  }, [cardPool, spendCoins, drawSingleCard, addCardsToInventory, addToast, incrementPity, resetPity]);

  return {
    openBoosterPack
  };
};
