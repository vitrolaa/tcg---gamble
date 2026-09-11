import { useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { soundService } from '../services/soundService';

export const FISHING_RODS = [
  {
    id: 'old_rod',
    name: 'Vara Velha',
    subtitle: 'Old Rod • ボロのつりざお',
    cost: 0,
    kanji: '初',
    icon: '🎣',
    color: 'from-amber-600 to-amber-800',
    borderColor: 'border-amber-600/40',
    badge: 'Ilimitada e Gratuita',
    badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30',
    description: 'Vara de pescar de madeira padrão. Cuidado — você pode pescar algas e botas velhas com ela.',
    lootPreview: 'Lixo (30%), Moedas (+10–35), Peixe (+15–30), Carta Comum'
  },
  {
    id: 'good_rod',
    name: 'Vara Boa',
    subtitle: 'Good Rod • いいつりざお',
    cost: 60,
    kanji: '上',
    icon: '🎏',
    color: 'from-blue-600 to-cyan-700',
    borderColor: 'border-blue-500/40',
    badge: 'Isca Reforçada',
    badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/30',
    description: 'Vara aprimorada com linha reforçada. Pesca pérolas, bolsas de moedas médias e cartas Incomuns/Raras.',
    lootPreview: 'Peixe (+25–50), Bolsas (+60–120), Pérola (+80–130) e Cartas Raras'
  },
  {
    id: 'super_rod',
    name: 'Super Vara',
    subtitle: 'Super Rod • すごいつりざお',
    cost: 180,
    kanji: '極',
    icon: '🔱',
    color: 'from-purple-600 via-rose-600 to-amber-500',
    borderColor: 'border-rose-500/40',
    badge: 'Tesouros Lendários',
    badgeColor: 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30',
    description: 'A lendária vara dos mestres pescadores. Chance de fisgar Baús de Ouro, Magikarp Dourado e Cartas Ultra Raras ex!',
    lootPreview: 'Peixe Médio (+90–160), Baú (+180–350), Dourado (+300) e Cartas Ultra Raras'
  }
];

// ─── Loot tables (coin ranges are intentionally tight / lower) ─────────────

const OLD_ROD_TABLE = [
  // 30% — trash (algae, old boot, etc.) → near zero coins
  {
    weight: 30,
    build: () => {
      const coin = Math.floor(Math.random() * 6); // 0–5
      return {
        type: 'trash',
        name: ['Alga Marinha', 'Bota Velha Enferrujada', 'Lata de Lixo', 'Casca de Caranguejo'][Math.floor(Math.random() * 4)],
        subtitle: ['海藻', '古いブーツ', '空き缶', 'カニの甲羅'][Math.floor(Math.random() * 4)],
        icon: ['🌿', '👢', '🥫', '🦀'][Math.floor(Math.random() * 4)],
        rewardText: coin > 0 ? `+${coin} PokéMoedas` : 'Nada de útil...',
        coins: coin,
        description: 'Que decepção. Parece que você pescou lixo do fundo do lago.'
      };
    }
  },
  // 40% — small coin pouch (+10 to +35)
  {
    weight: 40,
    build: () => {
      const coin = Math.floor(Math.random() * 26) + 10; // 10–35
      return {
        type: 'treasure',
        name: 'Pequena Bolsa de Moedas',
        subtitle: '小銭の小袋',
        icon: '🪙',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Algumas moedas perdidas encontradas presas no anzol!'
      };
    }
  },
  // 20% — Magikarp / small fish (+15 to +30)
  {
    weight: 20,
    build: () => {
      const coin = Math.floor(Math.random() * 16) + 15; // 15–30
      return {
        type: 'fish',
        name: 'Peixe Magikarp Fresco',
        subtitle: '新鮮なコイキング',
        icon: '🐟',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Um Magikarp agitado fisgado no lago e vendido no mercado de peixes.'
      };
    }
  },
  // 10% — common card
  {
    weight: 10,
    build: (cardPool) => {
      const commons = cardPool.filter(c => c.rarity === 'Comum');
      const card = commons[Math.floor(Math.random() * commons.length)] || cardPool[0];
      return {
        type: 'card',
        card,
        name: card.name,
        subtitle: 'Carta Comum',
        icon: '🃏',
        rewardText: `Carta ${card.name} Obtida!`,
        description: 'Você pescou uma carta clássica para sua coleção!'
      };
    }
  }
];

const GOOD_ROD_TABLE = [
  // 25% — small fish (+25 to +50) — barely covers rod cost
  {
    weight: 25,
    build: () => {
      const coin = Math.floor(Math.random() * 26) + 25; // 25–50
      return {
        type: 'fish',
        name: 'Peixe de Lago',
        subtitle: '湖の魚',
        icon: '🐠',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Um peixinho de lago comum vendido rapidamente no mercado.'
      };
    }
  },
  // 40% — coin pouch (+60 to +120)
  {
    weight: 40,
    build: () => {
      const coin = Math.floor(Math.random() * 61) + 60; // 60–120
      return {
        type: 'treasure',
        name: 'Bolsa Dourada de Moedas',
        subtitle: '金貨の革袋',
        icon: '💰',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Uma bolsa de couro selada com moedas douradas resgatada do fundo do lago.'
      };
    }
  },
  // 20% — pearl (+80 to +130)
  {
    weight: 20,
    build: () => {
      const coin = Math.floor(Math.random() * 51) + 80; // 80–130
      return {
        type: 'fish',
        name: 'Pérola Grande Brilhante',
        subtitle: 'おおきなしんじゅ',
        icon: '🦪',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Uma ostra pérola de alto valor vendida imediatamente no mercado.'
      };
    }
  },
  // 15% — uncommon or rare card
  {
    weight: 15,
    build: (cardPool) => {
      const pool = cardPool.filter(c => c.rarity === 'Incomum' || c.types?.includes('Água'));
      const card = pool[Math.floor(Math.random() * pool.length)] || cardPool[0];
      return {
        type: 'card',
        card,
        name: card.name,
        subtitle: `Carta ${card.rarity}`,
        icon: '🃏',
        rewardText: `Carta ${card.name} Pescada!`,
        description: 'Uma carta presa na linha de pesca que agora pertence ao seu Álbum!'
      };
    }
  }
];

const SUPER_ROD_TABLE = [
  // 25% — medium fish (+90 to +160) — barely above cost
  {
    weight: 25,
    build: () => {
      const coin = Math.floor(Math.random() * 71) + 90; // 90–160
      return {
        type: 'fish',
        name: 'Peixes das Profundezas',
        subtitle: '深海の魚',
        icon: '🐡',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Um peixe bizarro das profundezas vendido a um bom preço no mercado subaquático.'
      };
    }
  },
  // 35% — small sunken chest (+180 to +350)
  {
    weight: 35,
    build: () => {
      const coin = Math.floor(Math.random() * 171) + 180; // 180–350
      return {
        type: 'treasure',
        name: 'Baú do Tesouro Submerso',
        subtitle: '沈没船の宝箱',
        icon: '👑',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Um baú de tesouro ancestral afundado no lago repleto de ouro!'
      };
    }
  },
  // 15% — Golden Magikarp (+300 fixed)
  {
    weight: 15,
    build: () => {
      const coin = 300;
      return {
        type: 'fish',
        name: 'Magikarp Dourado Brilhante (Shiny)',
        subtitle: '金のコイキング',
        icon: '✨🐟',
        rewardText: `+${coin} PokéMoedas!`,
        coins: coin,
        description: 'Um raríssimo Magikarp Dourado! Os colecionadores pagaram uma fortuna por ele!'
      };
    }
  },
  // 25% — rare / ultra rare card
  {
    weight: 25,
    build: (cardPool) => {
      const ultraAndRares = cardPool.filter(c => c.rarity === 'Ultra Rara' || c.rarity === 'Rara');
      const waterCards = cardPool.filter(c => c.types?.includes('Água'));
      const pool = ultraAndRares.length > 0 ? ultraAndRares : waterCards;
      const card = pool[Math.floor(Math.random() * pool.length)];
      return {
        type: 'card',
        card,
        name: card.name,
        subtitle: `Carta ${card.rarity}`,
        icon: '🃏',
        rewardText: `Carta ${card.rarity} Obtida!`,
        description: `Você fisgou uma incrível carta ${card.name} direto ao seu Álbum!`
      };
    }
  }
];

// ─── Weighted random picker ────────────────────────────────────────────────
function pickFromTable(table, cardPool) {
  const total = table.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const entry of table) {
    r -= entry.weight;
    if (r <= 0) return entry.build(cardPool);
  }
  return table[table.length - 1].build(cardPool);
}

// ─── Hook ─────────────────────────────────────────────────────────────────
export const useFishing = () => {
  const { spendCoins, addCoins, cardPool, addCardsToInventory, addToast } = useGame();

  const generateCatch = useCallback((rod) => {
    // 1. Deduct cost
    if (rod.cost > 0) {
      const ok = spendCoins(rod.cost);
      if (!ok) return null;
    }

    let table;
    if (rod.id === 'super_rod') table = SUPER_ROD_TABLE;
    else if (rod.id === 'good_rod') table = GOOD_ROD_TABLE;
    else table = OLD_ROD_TABLE;

    const result = pickFromTable(table, cardPool);

    // Apply rewards
    if (result.type === 'card') {
      addCardsToInventory([result.card]);
      if (result.card.rarity === 'Ultra Rara') soundService.playUltraRareFanfare();
      else soundService.playRareShine();
    } else if (result.type === 'trash') {
      if (result.coins > 0) {
        addCoins(result.coins);
        soundService.playCoinGain();
      }
      // No toast for trash — modal handles it
    } else {
      // treasure or fish
      addCoins(result.coins);
      if (rod.id === 'super_rod') soundService.playTreasureCatch();
      else soundService.playCoinGain();
    }

    return result;
  }, [cardPool, spendCoins, addCoins, addCardsToInventory]);

  return { FISHING_RODS, generateCatch };
};
