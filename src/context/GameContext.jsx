import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { tcgService, POPULAR_SETS } from '../services/tcgService';
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
  ACHIEVEMENTS: 'pokevault_achievements',
  LOAN: 'pokevault_loan',
  VAULT: 'pokevault_vault',
  CASINO_STATS: 'pokevault_casino_stats',
  ACTIVE_SET: 'pokevault_active_set'
};

const PITY_THRESHOLD = 10;
const INITIAL_COINS = 1000;
const DAILY_REWARD_COINS = 300;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const INITIAL_VAULT_COINS = 2500;

const QUEST_TEMPLATES = [
  { id: 'open_packs_3',  label: 'Abra 3 pacotes de boosters',   icon: '🎁', goal: 3,  reward: 150, type: 'packsOpened' },
  { id: 'open_packs_5',  label: 'Abra 5 pacotes de boosters',   icon: '🎁', goal: 5,  reward: 250, type: 'packsOpened' },
  { id: 'get_rare',      label: 'Consiga 1 carta Rara',          icon: '⭐', goal: 1,  reward: 200, type: 'raresObtained' },
  { id: 'get_rare_3',    label: 'Consiga 3 cartas Raras',        icon: '⭐', goal: 3,  reward: 350, type: 'raresObtained' },
  { id: 'sell_dups_3',   label: 'Venda 3 cartas duplicadas',     icon: '♻️', goal: 3,  reward: 100, type: 'duplicatesSold' },
  { id: 'play_roulette', label: 'Jogue 1 rodada na Roleta Russa',icon: '🎲', goal: 1,  reward: 200, type: 'casinoGames' },
  { id: 'play_21',       label: 'Vença 1 mão no Blackjack 21',   icon: '🃏', goal: 1,  reward: 250, type: 'blackjackWins' },
  { id: 'get_ultra',     label: 'Consiga 1 Ultra Rara Secreta',  icon: '💎', goal: 1,  reward: 500, type: 'ultraRaresObtained' },
  { id: 'collect_15',    label: 'Colete 15 cartas únicas',       icon: '📖', goal: 15, reward: 200, type: 'uniqueCards' },
];

const ALL_ACHIEVEMENTS = [
  { id: 'ach_first_pack',   label: 'Primeiro Passo',         desc: 'Abra seu 1º pacote',               icon: '🎴', goal: 1,   reward: 100,  type: 'packsOpened' },
  { id: 'ach_packs_10',     label: 'Colecionador',           desc: 'Abra 10 pacotes',                  icon: '📦', goal: 10,  reward: 300,  type: 'packsOpened' },
  { id: 'ach_packs_50',     label: 'Viciado em Boosters',    desc: 'Abra 50 pacotes',                  icon: '🔥', goal: 50,  reward: 1000, type: 'packsOpened' },
  { id: 'ach_rare_1',       label: 'Caçador de Raras',       desc: 'Consiga sua 1ª carta Rara',        icon: '⭐', goal: 1,   reward: 200,  type: 'raresObtained' },
  { id: 'ach_ultra_1',      label: 'Lendário',               desc: 'Consiga sua 1ª Ultra Rara',        icon: '💎', goal: 1,   reward: 1000, type: 'ultraRaresObtained' },
  { id: 'ach_roulette_surv',label: 'Mente de Aço',           desc: 'Sobreviva à Roleta Russa 3 vezes', icon: '💀', goal: 3,   reward: 800,  type: 'rouletteSurvivors' },
  { id: 'ach_blackjack_5',  label: 'Tubarão de Cassino',     desc: 'Vença 5 mãos de Blackjack 21',     icon: '🃏', goal: 5,   reward: 750,  type: 'blackjackWins' },
  { id: 'ach_vault_cracker',label: 'Ladrão do Cofre',        desc: 'Estoure o Cofre Acumulador',       icon: '🏦', goal: 1,   reward: 1500, type: 'vaultCracked' },
  { id: 'ach_trash_winner', label: 'Rei do Lixo',            desc: 'Vença o Duelo no Modo Azarão',     icon: '🗑️', goal: 1,   reward: 1200, type: 'trashDuelWins' },
  { id: 'ach_unique_50',    label: 'Mestre do Álbum',        desc: 'Colete 50 cartas únicas',          icon: '🏆', goal: 50,  reward: 2000, type: 'uniqueCards' },
];

const generateDailyQuests = () => {
  const shuffled = [...QUEST_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3).map(q => ({ ...q, progress: 0, completed: false, claimed: false }));
};

export const GameProvider = ({ children }) => {
  // 1. Theme State ('dark' | 'light')
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

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
      coinsEarnedSelling: 0,
      raresObtained: 0,
      ultraRaresObtained: 0,
      casinoGames: 0,
      blackjackWins: 0,
      rouletteSurvivors: 0,
      trashDuelWins: 0,
      vaultCracked: 0
    };
  });

  // 5. Casino Stats
  const [casinoStats, setCasinoStats] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASINO_STATS);
    return saved ? JSON.parse(saved) : {
      totalBetsPlaced: 0,
      coinsWon: 0,
      coinsLost: 0,
      cardsBurned: 0,
      rouletteWins: 0,
      rouletteLosses: 0,
      blackjackWins: 0,
      blackjackLosses: 0,
      packDuelWins: 0
    };
  });

  // 6. Progressive Jackpot Vault
  const [vaultCoins, setVaultCoins] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VAULT);
    return saved !== null ? Number(saved) : INITIAL_VAULT_COINS;
  });

  // 7. Loan Shark State
  const [loanDebt, setLoanDebt] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LOAN);
    return saved ? JSON.parse(saved) : {
      active: false,
      amount: 0,
      originalAmount: 0,
      deadline: 0,
      takenAt: 0,
      confiscatedCards: []
    };
  });

  // 8. Pity & Despair Mode
  const [pityCounter, setPityCounter] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PITY);
    return saved !== null ? Number(saved) : 0;
  });

  const [lossStreak, setLossStreak] = useState(0);
  const [showDespairModal, setShowDespairModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);

  // 9. Active Set / Expansion & Card Pool
  const [activeSetId, setActiveSetId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SET);
    return saved || 'all'; // Default to 'all' to load multi-expansion thousands of cards
  });
  const [cardPool, setCardPool] = useState([]);
  const [isLoadingPool, setIsLoadingPool] = useState(true);

  // 10. Daily Quests & Daily Claim
  const [lastDailyClaim, setLastDailyClaim] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_CLAIM);
    return saved ? Number(saved) : 0;
  });

  const [dailyQuests, setDailyQuests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DAILY_QUESTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Date.now() - (parsed.generatedAt || 0) > ONE_DAY_MS) {
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

  // 12. Audio Mute
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      return !!parsed.isMuted;
    }
    return false;
  });

  // 13. Toasts
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

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.COINS, coins.toString()); }, [coins]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats)); }, [stats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CASINO_STATS, JSON.stringify(casinoStats)); }, [casinoStats]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VAULT, vaultCoins.toString()); }, [vaultCoins]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LOAN, JSON.stringify(loanDebt)); }, [loanDebt]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DAILY_CLAIM, lastDailyClaim.toString()); }, [lastDailyClaim]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PITY, pityCounter.toString()); }, [pityCounter]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DAILY_QUESTS, JSON.stringify(dailyQuests)); }, [dailyQuests]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVE_SET, activeSetId); }, [activeSetId]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ isMuted }));
    soundService.setMuted(isMuted);
  }, [isMuted]);

  // Load Card Pool on Mount or Set Switch
  useEffect(() => {
    let isMounted = true;
    async function loadCards() {
      setIsLoadingPool(true);
      try {
        let pool = [];
        if (activeSetId === 'all') {
          pool = await tcgService.getCombinedCardPool(['sv01', 'sv02', 'sv03', 'sv03.5', 'sv04', 'sv06']);
        } else {
          pool = await tcgService.getSetCardPool(activeSetId);
        }
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
    loadCards();
    return () => { isMounted = false; };
  }, [activeSetId]);

  // Check Loan Expiration Ticker
  useEffect(() => {
    if (!loanDebt.active) return;

    const interval = setInterval(() => {
      if (Date.now() > loanDebt.deadline) {
        // Confiscate cards from inventory!
        triggerDebtConfiscation();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [loanDebt, inventory]);

  // Economy & Vault
  const addToVault = useCallback((amount) => {
    setVaultCoins(prev => prev + Math.max(1, Math.round(amount)));
  }, []);

  const addCoins = useCallback((amount, reason = '') => {
    setCoins(prev => prev + amount);
    soundService.playCoinGain();
    if (reason) {
      addToast(`+${amount.toLocaleString('pt-BR')} PokéMoedas`, reason, 'success');
    }
  }, [addToast]);

  const spendCoins = useCallback((amount) => {
    if (coins < amount) {
      addToast('Moedas Insuficientes', 'Você não possui saldo suficiente!', 'error');
      // Trigger loan shark offer if player is completely out of cash
      if (coins <= 50 && !loanDebt.active) {
        setShowLoanModal(true);
      }
      return false;
    }
    setCoins(prev => prev - amount);
    return true;
  }, [coins, loanDebt.active, addToast]);

  // Quest & Achievement Update Helpers
  const updateQuestProgress = useCallback((type, amount = 1) => {
    setDailyQuests(prev => {
      const updated = prev.quests.map(q => {
        if (q.type === type && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.goal);
          return { ...q, progress: newProgress, completed: newProgress >= q.goal };
        }
        return q;
      });
      return { ...prev, quests: updated };
    });
  }, []);

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

  // --- CARD BURNING & SACRIFICE (RUSSIAN ROULETTE / UPGRADER) ---
  const burnCardFromInventory = useCallback((cardId) => {
    const item = inventory[cardId];
    if (!item || item.count <= 0) return false;

    setInventory(prev => {
      const next = { ...prev };
      if (next[cardId].count > 1) {
        next[cardId] = { ...next[cardId], count: next[cardId].count - 1 };
      } else {
        delete next[cardId];
      }
      return next;
    });

    setCasinoStats(prev => ({ ...prev, cardsBurned: prev.cardsBurned + 1 }));
    soundService.playCardBurn();
    return true;
  }, [inventory]);

  // --- LOAN SHARK (AGIOTA MEOWTH) SYSTEM ---
  const takeLoan = useCallback((amount = 2000, durationMinutes = 3) => {
    if (loanDebt.active) {
      addToast('Empréstimo Ativo', 'Você já possui uma dívida com o Agiota!', 'warning');
      return false;
    }

    const totalToRepay = Math.round(amount * 1.4); // 40% juros
    const deadline = Date.now() + durationMinutes * 60 * 1000;

    setLoanDebt({
      active: true,
      amount: totalToRepay,
      originalAmount: amount,
      deadline,
      takenAt: Date.now(),
      confiscatedCards: []
    });

    setCoins(prev => prev + amount);
    soundService.playLoanSharkAlert();
    addToast('Empréstimo Concedido!', `Você recebeu +${amount} moedas do Agiota! Devolva ${totalToRepay} antes do tempo acabar!`, 'warning');
    setShowLoanModal(false);
    return true;
  }, [loanDebt.active, addToast]);

  const repayLoan = useCallback(() => {
    if (!loanDebt.active) return false;

    if (coins < loanDebt.amount) {
      addToast('Saldo Insuficiente', `Você precisa de ${loanDebt.amount} moedas para quitar sua dívida com o Agiota!`, 'error');
      return false;
    }

    setCoins(prev => prev - loanDebt.amount);
    setLoanDebt({ active: false, amount: 0, originalAmount: 0, deadline: 0, takenAt: 0, confiscatedCards: [] });
    soundService.playCoinGain();
    addToast('Dívida Paga!', 'Você honrou seu pagamento com o Agiota. Seu álbum está seguro... por enquanto.', 'success');
    return true;
  }, [coins, loanDebt, addToast]);

  const triggerDebtConfiscation = useCallback(() => {
    const ownedCardKeys = Object.keys(inventory);
    let confiscated = [];

    if (ownedCardKeys.length > 0) {
      // Sort by rarity to seize the most valuable cards first
      const sortedKeys = [...ownedCardKeys].sort((a, b) => {
        const rOrder = { 'Ultra Rara': 4, 'Rara': 3, 'Incomum': 2, 'Comum': 1 };
        const valA = rOrder[inventory[a]?.card?.rarity] || 1;
        const valB = rOrder[inventory[b]?.card?.rarity] || 1;
        return valB - valA;
      });

      // Seize up to 2 top cards
      const keysToSeize = sortedKeys.slice(0, 2);
      keysToSeize.forEach(k => {
        confiscated.push(inventory[k].card.name);
        burnCardFromInventory(k);
      });
    }

    setLoanDebt({
      active: false,
      amount: 0,
      originalAmount: 0,
      deadline: 0,
      takenAt: 0,
      confiscatedCards: confiscated
    });

    soundService.playConfiscateAlarm();
    addToast(
      '🚨 CONFISCO DO AGIOTA!',
      `O tempo expirou! Os capangas levaram: ${confiscated.length > 0 ? confiscated.join(', ') : 'tudo o que restava'}!`,
      'error'
    );
  }, [inventory, burnCardFromInventory, addToast]);

  // --- JACKPOT VAULT SYSTEM ---
  const crackJackpotVault = useCallback(() => {
    const winAmount = vaultCoins;
    setCoins(prev => prev + winAmount);
    setVaultCoins(INITIAL_VAULT_COINS);
    soundService.playVaultBurst();

    setStats(prev => {
      const next = { ...prev, vaultCracked: (prev.vaultCracked || 0) + 1 };
      updateAchievementProgress('vaultCracked', next.vaultCracked);
      return next;
    });

    addToast('🎉 JACKPOT DO COFRE!', `Você estourou o cofre acumulador e faturou +${winAmount.toLocaleString('pt-BR')} PokéMoedas!`, 'success');
    return winAmount;
  }, [vaultCoins, updateAchievementProgress, addToast]);

  // --- DESPAIR MODE BONUS ---
  const recordLoss = useCallback(() => {
    setLossStreak(prev => {
      const next = prev + 1;
      if (next >= 3 && coins < 200) {
        setShowDespairModal(true);
        soundService.playDespairAlarm();
      }
      return next;
    });
  }, [coins]);

  const recordWin = useCallback(() => {
    setLossStreak(0);
  }, []);

  const claimDespairBonus = useCallback((bonusAmount = 600) => {
    setCoins(prev => prev + bonusAmount);
    setLossStreak(0);
    setShowDespairModal(false);
    soundService.playCoinGain();
    addToast('Gatilho de Recuperação!', `Você recebeu um Bônus de Retorno de emergência de +${bonusAmount} PokéMoedas!`, 'success');
  }, [addToast]);

  // --- CASINO RECORDING HELPER ---
  const recordCasinoGame = useCallback(({ type, bet, won, payout }) => {
    const isWin = won;
    const profit = isWin ? payout - bet : -bet;

    // Route 7% of bet to Vault
    addToVault(bet * 0.07);

    setCasinoStats(prev => ({
      ...prev,
      totalBetsPlaced: prev.totalBetsPlaced + bet,
      coinsWon: prev.coinsWon + (isWin ? payout : 0),
      coinsLost: prev.coinsLost + (isWin ? 0 : bet),
      rouletteWins: type === 'roulette' && isWin ? prev.rouletteWins + 1 : prev.rouletteWins,
      rouletteLosses: type === 'roulette' && !isWin ? prev.rouletteLosses + 1 : prev.rouletteLosses,
      blackjackWins: type === 'blackjack' && isWin ? prev.blackjackWins + 1 : prev.blackjackWins,
      blackjackLosses: type === 'blackjack' && !isWin ? prev.blackjackLosses + 1 : prev.blackjackLosses,
      packDuelWins: type === 'pack_duel' && isWin ? prev.packDuelWins + 1 : prev.packDuelWins
    }));

    setStats(prev => {
      const next = {
        ...prev,
        casinoGames: (prev.casinoGames || 0) + 1,
        blackjackWins: type === 'blackjack' && isWin ? (prev.blackjackWins || 0) + 1 : (prev.blackjackWins || 0),
        rouletteSurvivors: type === 'roulette' && isWin ? (prev.rouletteSurvivors || 0) + 1 : (prev.rouletteSurvivors || 0),
        trashDuelWins: type === 'trash_duel' && isWin ? (prev.trashDuelWins || 0) + 1 : (prev.trashDuelWins || 0)
      };

      updateQuestProgress('casinoGames', 1);
      if (type === 'blackjack' && isWin) updateQuestProgress('blackjackWins', 1);
      updateAchievementProgress('blackjackWins', next.blackjackWins);
      updateAchievementProgress('rouletteSurvivors', next.rouletteSurvivors);
      updateAchievementProgress('trashDuelWins', next.trashDuelWins);

      return next;
    });

    if (isWin) {
      recordWin();
    } else {
      recordLoss();
    }
  }, [addToVault, recordWin, recordLoss, updateQuestProgress, updateAchievementProgress]);

  // --- INVENTORY MANAGEMENT ---
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

      if (raresInPack > 0) updateQuestProgress('raresObtained', raresInPack);
      if (ultraRaresInPack > 0) updateQuestProgress('ultraRaresObtained', ultraRaresInPack);
      updateQuestProgress('packsOpened', 1);

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
        next[cardId] = { ...next[cardId], count: next[cardId].count - 1 };
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
      return next;
    });

    soundService.playCoinGain();
    addToast('Carta Vendida!', `Você reciclou 1x ${item.card.name} e recebeu +${sellValue} PokéMoedas!`, 'success');
  }, [inventory, updateQuestProgress, addToast]);

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
        nextInventory[cardId] = { ...item, count: 1 };
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
      return next;
    });

    soundService.playCoinGain();
    addToast('Reciclagem Concluída!', `Você vendeu ${totalDuplicates} cartas repetidas e faturou +${totalCoinGain} PokéMoedas!`, 'success');
    return { totalDuplicates, totalCoinGain };
  }, [inventory, updateQuestProgress, addToast]);

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

  const canClaimDaily = () => Date.now() - lastDailyClaim > ONE_DAY_MS;

  const getDailyTimeRemaining = () => {
    const diff = ONE_DAY_MS - (Date.now() - lastDailyClaim);
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const claimDailyReward = useCallback(() => {
    if (!canClaimDaily()) {
      addToast('Recompensa Indisponível', `Volte em ${getDailyTimeRemaining()} para resgatar mais moedas!`, 'warning');
      return;
    }
    setLastDailyClaim(Date.now());
    addCoins(DAILY_REWARD_COINS, 'Bônus Diário de Treinador resgatado com sucesso!');
  }, [lastDailyClaim, addCoins, addToast]);

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

  const removeCardsFromInventory = useCallback((sacrificeList) => {
    setInventory(prev => {
      const next = { ...prev };
      sacrificeList.forEach(({ cardId, count }) => {
        if (next[cardId]) {
          const newCount = next[cardId].count - count;
          if (newCount <= 0) {
            delete next[cardId];
          } else {
            next[cardId] = { ...next[cardId], count: newCount };
          }
        }
      });
      return next;
    });
  }, []);

  const resetSave = useCallback(() => {
    setCoins(INITIAL_COINS);
    setInventory({});
    setStats({
      packsOpened: 0,
      cardsObtainedTotal: 0,
      duplicatesSold: 0,
      coinsEarnedSelling: 0,
      raresObtained: 0,
      ultraRaresObtained: 0,
      casinoGames: 0,
      blackjackWins: 0,
      rouletteSurvivors: 0,
      trashDuelWins: 0,
      vaultCracked: 0
    });
    setCasinoStats({
      totalBetsPlaced: 0,
      coinsWon: 0,
      coinsLost: 0,
      cardsBurned: 0,
      rouletteWins: 0,
      rouletteLosses: 0,
      blackjackWins: 0,
      blackjackLosses: 0,
      packDuelWins: 0
    });
    setVaultCoins(INITIAL_VAULT_COINS);
    setLoanDebt({ active: false, amount: 0, originalAmount: 0, deadline: 0, takenAt: 0, confiscatedCards: [] });
    setLastDailyClaim(0);
    setPityCounter(0);
    setDailyQuests({ quests: generateDailyQuests(), generatedAt: Date.now() });
    setAchievements(ALL_ACHIEVEMENTS.map(a => ({ ...a, progress: 0, unlocked: false, claimed: false })));
    localStorage.clear();
    addToast('Progresso Reiniciado', 'Sua conta foi restaurada com 1.000 moedas!', 'info');
  }, [addToast]);

  return (
    <GameContext.Provider
      value={{
        theme,
        toggleTheme,
        coins,
        inventory,
        stats,
        casinoStats,
        cardPool,
        isLoadingPool,
        activeSetId,
        setActiveSetId,
        isMuted,
        toggleSound: () => setIsMuted(prev => !prev),
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
        burnCardFromInventory,
        sellSingleCard,
        sellAllDuplicates,
        getCollectionStats,
        resetSave,
        // Pity & Despair
        pityCounter,
        pityThreshold: PITY_THRESHOLD,
        incrementPity: () => setPityCounter(prev => Math.min(prev + 1, PITY_THRESHOLD)),
        resetPity: () => setPityCounter(0),
        shouldTriggerPity: () => pityCounter >= PITY_THRESHOLD,
        lossStreak,
        showDespairModal,
        setShowDespairModal,
        claimDespairBonus,
        // Loan Shark
        loanDebt,
        takeLoan,
        repayLoan,
        showLoanModal,
        setShowLoanModal,
        // Vault
        vaultCoins,
        addToVault,
        crackJackpotVault,
        // Casino Engine
        recordCasinoGame,
        // Quests & Achievements
        dailyQuests: dailyQuests.quests,
        claimQuestReward,
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
