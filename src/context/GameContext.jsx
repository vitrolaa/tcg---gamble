import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { tcgService } from '../services/tcgService';
import { soundService } from '../services/soundService';

const GameContext = createContext(null);

const STORAGE_KEYS = {
  COINS: 'pokevault_coins',
  INVENTORY: 'pokevault_inventory',
  STATS: 'pokevault_stats',
  DAILY_CLAIM: 'pokevault_daily_claim',
  SETTINGS: 'pokevault_settings',
  THEME: 'pokevault_theme',
  PITY: 'pokevault_pity',
  DAILY_QUESTS: 'pokevault_daily_quests',
  ACHIEVEMENTS: 'pokevault_achievements'
};

const PITY_THRESHOLD = 10; // Após 10 pacotes sem Ultra Rara, o próximo garante uma

const QUEST_TEMPLATES = [
  { id: 'open_packs_3',  label: 'Abra 3 pacotes',             icon: '🎁', goal: 3,  reward: 150, type: 'packsOpened' },
  { id: 'open_packs_5',  label: 'Abra 5 pacotes',             icon: '🎁', goal: 5,  reward: 250, type: 'packsOpened' },
  { id: 'get_rare',      label: 'Consiga 1 carta Rara',        icon: '⭐', goal: 1,  reward: 200, type: 'raresObtained' },
  { id: 'get_rare_3',    label: 'Consiga 3 cartas Raras',      icon: '⭐', goal: 3,  reward: 350, type: 'raresObtained' },
  { id: 'sell_dups_3',   label: 'Venda 3 cartas duplicadas',   icon: '♻️', goal: 3,  reward: 100, type: 'duplicatesSold' },
  { id: 'sell_dups_5',   label: 'Venda 5 cartas duplicadas',   icon: '♻️', goal: 5,  reward: 180, type: 'duplicatesSold' },
  { id: 'get_ultra',     label: 'Consiga 1 Ultra Rara',        icon: '💎', goal: 1,  reward: 500, type: 'ultraRaresObtained' },
  { id: 'collect_10',    label: 'Colete 10 cartas únicas',     icon: '📖', goal: 10, reward: 120, type: 'uniqueCards' },
];

const ALL_ACHIEVEMENTS = [
  { id: 'ach_first_pack',   label: 'Primeiro Passo',       desc: 'Abra seu 1º pacote',             icon: '🎴', goal: 1,   reward: 100,  type: 'packsOpened' },
  { id: 'ach_packs_10',     label: 'Colecionador',         desc: 'Abra 10 pacotes',                icon: '📦', goal: 10,  reward: 300,  type: 'packsOpened' },
  { id: 'ach_packs_50',     label: 'Viciado em Boosters',  desc: 'Abra 50 pacotes',                icon: '🔥', goal: 50,  reward: 1000, type: 'packsOpened' },
  { id: 'ach_rare_1',       label: 'Caçador de Raras',     desc: 'Consiga sua 1ª carta Rara',      icon: '⭐', goal: 1,   reward: 200,  type: 'raresObtained' },
  { id: 'ach_rare_10',      label: 'Especialista',         desc: 'Consiga 10 cartas Raras',        icon: '🌟', goal: 10,  reward: 600,  type: 'raresObtained' },
  { id: 'ach_ultra_1',      label: 'Lendário',             desc: 'Consiga sua 1ª Ultra Rara',      icon: '💎', goal: 1,   reward: 1000, type: 'ultraRaresObtained' },
  { id: 'ach_ultra_5',      label: 'Mestre dos Lendários', desc: 'Consiga 5 Ultra Raras',          icon: '👑', goal: 5,   reward: 2500, type: 'ultraRaresObtained' },
  { id: 'ach_sell_10',      label: 'Comerciante',          desc: 'Venda 10 cartas duplicadas',     icon: '💰', goal: 10,  reward: 400,  type: 'duplicatesSold' },
  { id: 'ach_unique_25',    label: 'Pokédex Básica',       desc: 'Colete 25 cartas únicas',        icon: '📖', goal: 25,  reward: 500,  type: 'uniqueCards' },
  { id: 'ach_unique_100',   label: 'Pokédex Completa',     desc: 'Colete 100 cartas únicas',       icon: '🏆', goal: 100, reward: 3000, type: 'uniqueCards' },
];

// Seleciona 3 quests aleatórias para o dia
const generateDailyQuests = () => {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
};

const INITIAL_COINS = 1000;
const DAILY_REWARD_COINS = 300;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const GameProvider = ({ children }) => {
  // 1. Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark'; // default to refined dark
  });

  // Apply Theme class to HTML tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // 2. Coins
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COINS);
    return saved !== null ? Number(saved) : INITIAL_COINS;
  });

  // 3. Inventory: { [cardId]: { card: CardObject, count: number, firstObtainedAt: string } }
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : {};
  });

  // 4. Stats
  const [stats, setStats] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STATS);
    return saved ? JSON.parse(saved) : {
      packsOpened: 0,
      cardsObtainedTotal: 0,
      duplicatesSold: 0,
      coinsEarnedSelling: 0
    };
  });

  // 5. Daily Claim
  const [lastDailyClaim, setLastDailyClaim] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CLAIM);
    return saved ? Number(saved) : 0;
  });

  // 9. Pity Counter (quantos pacotes sem Ultra Rara)
  const [pityCounter, setPityCounter] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PITY);
    return saved !== null ? Number(saved) : 0;
  });

  // 10. Daily Quests
  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Regenera quests se o dia mudou
      const lastGen = parsed.generatedAt || 0;
      if (Date.now() - lastGen > ONE_DAY_MS) {
        return { quests: generateDailyQuests(), generatedAt: Date.now() };
      }
      return parsed;
    }
    return { quests: generateDailyQuests(), generatedAt: Date.now() };
  });

  // 11. Achievements
  const [achievements, setAchievements] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
    if (saved) return JSON.parse(saved);
    return ALL_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, unlocked: false, claimed: false }));
  });

  // 6. Sound Mute Setting
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!parsed.isMuted;
    }
    return false;
  });

  // 7. Card Pool & Loading State
  const [cardPool, setCardPool] = useState([]);
  const [isLoadingPool, setIsLoadingPool] = useState(true);
  const [activeSetId, setActiveSetId] = useState('sv01');

  // 8. Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((title, description, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COINS, coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_CLAIM, lastDailyClaim.toString());
  }, [lastDailyClaim]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PITY, pityCounter.toString());
  }, [pityCounter]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(dailyQuests));
  }, [dailyQuests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ isMuted }));
    soundService.setMuted(isMuted);
  }, [isMuted]);

  // Load Card Pool on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadPool() {
      setIsLoadingPool(true);
      try {
        const pool = await tcgService.getSetCardPool(activeSetId);
        if (isMounted) {
          setCardPool(pool);
        }
      } catch (err) {
        console.error('Failed to load card pool:', err);
      } finally {
        if (isMounted) {
          setIsLoadingPool(false);
        }
      }
    }
    loadPool();
    return () => { isMounted = false; };
  }, [activeSetId]);

  // Economy Actions
  const addCoins = useCallback((amount, reason = '') => {
    setCoins(prev => prev + amount);
    soundService.playCoinGain();
    if (reason) {
      addToast(`+${amount} PokéMoedas`, reason, 'success');
    }
  }, [addToast]);

  const spendCoins = useCallback((amount) => {
    if (coins < amount) {
      addToast('Moedas Insuficientes', 'Você precisa de mais PokéMoedas para abrir este pacote!', 'error');
      return false;
    }
    setCoins(prev => prev - amount);
    return true;
  }, [coins, addToast]);

  const canClaimDaily = () => {
    return Date.now() - lastDailyClaim > ONE_DAY_MS;
  };

  const getDailyTimeRemaining = () => {
    const diff = ONE_DAY_MS - (Date.now() - lastDailyClaim);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Pity Counter
  const incrementPity = useCallback(() => {
    setPityCounter(prev => Math.min(prev + 1, PITY_THRESHOLD));
  }, []);

  const resetPity = useCallback(() => {
    setPityCounter(0);
  }, []);

  const shouldTriggerPity = useCallback(() => {
    return pityCounter >= PITY_THRESHOLD;
  }, [pityCounter]);

  // Daily Quests progress updater
  const updateQuestProgress = useCallback((type, amount = 1) => {
    setDailyQuests(prev => {
      const updatedQuests = prev.quests.map(q => {
        if (q.type === type && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.goal);
          return { ...q, progress: newProgress, completed: newProgress >= q.goal };
        }
        return q;
      });
      return { ...prev, quests: updatedQuests };
    });
  }, []);

  const claimQuestReward = useCallback((questId) => {
    setDailyQuests(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest || !quest.completed || quest.claimed) return prev;
      setCoins(c => c + quest.reward);
      soundService.playCoinGain();
      addToast(`+${quest.reward} PokéMoedas!`, `Missão Concluída: ${quest.label}`, 'success');
      return {
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, claimed: true } : q)
      };
    });
  }, [addToast]);

  // Achievements progress updater
  const updateAchievementProgress = useCallback((type, value) => {
    setAchievements(prev => prev.map(a => {
      if (a.type === type && !a.unlocked) {
        const newProgress = Math.max(a.progress, value);
        const unlocked = newProgress >= a.goal;
        return { ...a, progress: newProgress, unlocked };
      }
      return a;
    }));
  }, []);

  const claimAchievementReward = useCallback((achId) => {
    setAchievements(prev => {
      const ach = prev.find(a => a.id === achId);
      if (!ach || !ach.unlocked || ach.claimed) return prev;
      setCoins(c => c + ach.reward);
      soundService.playCoinGain();
      addToast(`🏆 Conquista Desbloqueada!`, `${ach.label}: +${ach.reward} PokéMoedas`, 'success');
      return prev.map(a => a.id === achId ? { ...a, claimed: true } : a);
    });
  }, [addToast]);

  const claimDailyReward = useCallback(() => {
    if (!canClaimDaily()) {
      addToast('Recompensa Indisponível', `Volte em ${getDailyTimeRemaining()} para resgatar mais moedas!`, 'warning');
      return;
    }
    setLastDailyClaim(Date.now());
    addCoins(DAILY_REWARD_COINS, 'Bônus Diário de Treinador resgatado com sucesso!');
  }, [lastDailyClaim, addCoins, addToast]);

  const addCardsToInventory = useCallback((cards) => {
    let newCardsCount = 0;
    let duplicateCardsCount = 0;

    setInventory(prev => {
      const next = { ...prev };
      cards.forEach(card => {
        if (next[card.id]) {
          next[card.id] = {
            ...next[card.id],
            card: { ...next[card.id].card, ...card },
            count: next[card.id].count + 1,
            lastObtainedAt: new Date().toISOString()
          };
          duplicateCardsCount++;
        } else {
          next[card.id] = {
            card,
            count: 1,
            firstObtainedAt: new Date().toISOString(),
            lastObtainedAt: new Date().toISOString()
          };
          newCardsCount++;
        }
      });
      return next;
    });

    // Count raras and ultra raras for quest/achievement tracking
    const raresInPack = cards.filter(c => c.rarity === 'Rara').length;
    const ultraRaresInPack = cards.filter(c => c.rarity === 'Ultra Rara').length;
    const uniqueCardCount = Object.keys(inventory).length + newCardsCount;

    setStats(prev => {
      const next = {
        ...prev,
        packsOpened: prev.packsOpened + 1,
        cardsObtainedTotal: prev.cardsObtainedTotal + cards.length,
        raresObtained: (prev.raresObtained || 0) + raresInPack,
        ultraRaresObtained: (prev.ultraRaresObtained || 0) + ultraRaresInPack,
      };

      // Update quest progress
      if (raresInPack > 0) updateQuestProgress('raresObtained', raresInPack);
      if (ultraRaresInPack > 0) updateQuestProgress('ultraRaresObtained', ultraRaresInPack);
      updateQuestProgress('packsOpened', 1);

      // Update achievement progress
      updateAchievementProgress('packsOpened', next.packsOpened);
      updateAchievementProgress('raresObtained', next.raresObtained);
      updateAchievementProgress('ultraRaresObtained', next.ultraRaresObtained);
      updateAchievementProgress('uniqueCards', uniqueCardCount);

      return next;
    });

    return { newCardsCount, duplicateCardsCount };
  }, [inventory, updateQuestProgress, updateAchievementProgress]);

  const sellSingleCard = useCallback((cardId) => {
    const item = inventory[cardId];
    if (!item || item.count <= 1) {
      addToast('Venda Não Permitida', 'Você só pode vender cópias duplicadas para manter seu álbum completo!', 'warning');
      return;
    }

    const sellValue = item.card.sellValue || tcgService.getSellPrice(item.card.rarity);

    setInventory(prev => {
      const next = { ...prev };
      if (next[cardId].count > 1) {
        next[cardId] = {
          ...next[cardId],
          count: next[cardId].count - 1
        };
      }
      return next;
    });

    setCoins(prev => prev + sellValue);
    setStats(prev => {
      const next = {
        ...prev,
        duplicatesSold: prev.duplicatesSold + 1,
        coinsEarnedSelling: prev.coinsEarnedSelling + sellValue
      };
      updateQuestProgress('duplicatesSold', 1);
      updateAchievementProgress('duplicatesSold', next.duplicatesSold);
      return next;
    });

    soundService.playCoinGain();
    addToast('Carta Vendida!', `Você reciclou 1x ${item.card.name} e recebeu +${sellValue} PokéMoedas!`, 'success');
  }, [inventory, addToast]);

  // Remove Cards when Sacrificed in Fusion / Upgrader
  const removeCardsFromInventory = useCallback((sacrificeList) => {
    setInventory(prev => {
      const next = { ...prev };
      sacrificeList.forEach(({ cardId, count }) => {
        if (next[cardId]) {
          const newCount = next[cardId].count - count;
          if (newCount <= 0) {
            delete next[cardId];
          } else {
            next[cardId] = {
              ...next[cardId],
              count: newCount
            };
          }
        }
      });
      return next;
    });
  }, []);

  const sellAllDuplicates = useCallback(() => {
    let totalDuplicates = 0;
    let totalCoinGain = 0;
    const nextInventory = { ...inventory };

    Object.keys(nextInventory).forEach(cardId => {
      const item = nextInventory[cardId];
      if (item && item.count > 1) {
        const extraCount = item.count - 1;
        const val = (item.card.sellValue || tcgService.getSellPrice(item.card.rarity)) * extraCount;
        totalDuplicates += extraCount;
        totalCoinGain += val;
        nextInventory[cardId] = {
          ...item,
          count: 1
        };
      }
    });

    if (totalDuplicates === 0) {
      addToast('Nenhuma Repetida', 'Você não possui cartas duplicadas para vender no momento.', 'info');
      return { totalDuplicates: 0, totalCoinGain: 0 };
    }

    setInventory(nextInventory);
    setCoins(prev => prev + totalCoinGain);
    setStats(prev => {
      const next = {
        ...prev,
        duplicatesSold: prev.duplicatesSold + totalDuplicates,
        coinsEarnedSelling: prev.coinsEarnedSelling + totalCoinGain
      };
      updateQuestProgress('duplicatesSold', totalDuplicates);
      updateAchievementProgress('duplicatesSold', next.duplicatesSold);
      return next;
    });

    soundService.playCoinGain();
    addToast('Reciclagem Concluída!', `Você vendeu ${totalDuplicates} cartas repetidas e faturou +${totalCoinGain} PokéMoedas!`, 'success');
    return { totalDuplicates, totalCoinGain };
  }, [inventory, addToast]);

  const getCollectionStats = useCallback(() => {
    const totalUniqueInSet = cardPool.length || 1;
    const ownedUnique = Object.keys(inventory).length;
    const percentage = Math.min(100, Math.round((ownedUnique / totalUniqueInSet) * 100));

    let totalDuplicates = 0;
    let totalPotentialSellValue = 0;

    Object.values(inventory).forEach(item => {
      if (item.count > 1) {
        const extra = item.count - 1;
        totalDuplicates += extra;
        totalPotentialSellValue += extra * (item.card.sellValue || tcgService.getSellPrice(item.card.rarity));
      }
    });

    return {
      totalUniqueInSet,
      ownedUnique,
      percentage,
      totalDuplicates,
      totalPotentialSellValue
    };
  }, [cardPool, inventory]);

  const resetSave = useCallback(() => {
    setCoins(INITIAL_COINS);
    setInventory({});
    setStats({ packsOpened: 0, cardsObtainedTotal: 0, duplicatesSold: 0, coinsEarnedSelling: 0, raresObtained: 0, ultraRaresObtained: 0 });
    setLastDailyClaim(0);
    setPityCounter(0);
    setDailyQuests({ quests: generateDailyQuests(), generatedAt: Date.now() });
    setAchievements(ALL_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, unlocked: false, claimed: false })));
    localStorage.removeItem(STORAGE_KEYS.COINS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.STATS);
    localStorage.removeItem(STORAGE_KEYS.DAILY_CLAIM);
    localStorage.removeItem(STORAGE_KEYS.PITY);
    localStorage.removeItem(STORAGE_KEYS.DAILY_QUESTS);
    localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    addToast('Progresso Reiniciado', 'Sua coleção foi restaurada ao estado inicial com 1.000 moedas!', 'info');
  }, [addToast]);

  const toggleSound = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  return (
    <GameContext.Provider
      value={{
        theme,
        toggleTheme,
        coins,
        inventory,
        stats,
        cardPool,
        isLoadingPool,
        activeSetId,
        setActiveSetId,
        isMuted,
        toggleSound,
        toasts,
        addToast,
        removeToast,
        addCoins,
        spendCoins,
        claimDailyReward,
        canClaimDaily,
        getDailyTimeRemaining,
        addCardsToInventory,
        removeCardsFromInventory,
        sellSingleCard,
        sellAllDuplicates,
        getCollectionStats,
        resetSave,
        // Pity system
        pityCounter,
        pityThreshold: PITY_THRESHOLD,
        incrementPity,
        resetPity,
        shouldTriggerPity,
        // Daily Quests
        dailyQuests: dailyQuests.quests,
        claimQuestReward,
        // Achievements
        achievements,
        claimAchievementReward,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
