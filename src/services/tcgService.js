import { FALLBACK_CARDS } from '../data/fallbackCards';
import { RARITY_PRICES } from '../data/boosterPacks';

const BASE_URL = 'https://api.tcgdex.net/v2/pt';
const CACHE_KEY_PREFIX = 'pokevault_tcgdex_';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

class TCGService {
  constructor() {
    this.memoryCache = new Map();
  }

  normalizeRarity(rawRarity, name = '') {
    if (!rawRarity) {
      if (name.includes(' ex') || name.includes(' VMAX') || name.includes(' VSTAR')) {
        return 'Ultra Rara';
      }
      return 'Comum';
    }

    const r = rawRarity.toLowerCase();
    if (r.includes('ultra') || r.includes('hiper') || r.includes('ilustra') || r.includes('secreta') || r.includes('especial') || r.includes('secret') || name.includes(' ex')) {
      return 'Ultra Rara';
    }
    if (r.includes('holo') || r.includes('rara') || r.includes('rare') || r.includes('dourada')) {
      return 'Rara';
    }
    if (r.includes('incomum') || r.includes('uncommon')) {
      return 'Incomum';
    }
    return 'Comum';
  }

  getSellPrice(rarity) {
    return RARITY_PRICES[rarity] || 15;
  }

  getFromStorage(key) {
    try {
      const itemStr = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!itemStr) return null;
      const item = JSON.parse(itemStr);
      const now = Date.now();
      if (now - item.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }
      return item.data;
    } catch {
      return null;
    }
  }

  saveToStorage(key, data) {
    try {
      const item = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(item));
    } catch (e) {
      console.warn('LocalStorage quota exceeded or disabled:', e);
    }
  }

  // Fetch set overview or full card pool
  async getSetCardPool(setId = 'sv01') {
    // 1. Check memory cache
    if (this.memoryCache.has(setId)) {
      return this.memoryCache.get(setId);
    }

    // 2. Check localStorage
    const cachedData = this.getFromStorage(`set_${setId}`);
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      this.memoryCache.set(setId, cachedData);
      return cachedData;
    }

    // 3. Fetch from TCGDex API
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(`${BASE_URL}/sets/${setId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TCGDex responded with status ${response.status}`);
      }

      const setData = await response.json();
      if (!setData || !setData.cards || !Array.isArray(setData.cards)) {
        throw new Error('Invalid set format from API');
      }

      // Map cards to standardized format
      const cards = setData.cards.map(card => {
        const rarity = this.normalizeRarity(card.rarity, card.name);
        const imageBase = card.image || `https://assets.tcgdex.net/pt/sv/${setId}/${card.localId}`;
        const cleanImage = imageBase.endsWith('.webp') || imageBase.endsWith('.png') 
          ? imageBase 
          : `${imageBase}/high.webp`;

        // Estimate type from index or fallback
        return {
          id: card.id || `${setId}-${card.localId}`,
          localId: card.localId,
          name: card.name,
          rarity,
          category: card.category || (card.name.includes('Energia') ? 'Energia' : card.name.includes('Treinador') ? 'Treinador' : 'Pokémon'),
          types: card.types || [this.guessType(card.name)],
          hp: card.hp || (rarity === 'Ultra Rara' ? 240 : rarity === 'Rara' ? 140 : 70),
          stage: card.stage || (rarity === 'Ultra Rara' ? 'Básico ex' : 'Básico'),
          image: cleanImage,
          illustrator: card.illustrator || 'Ilustrador Oficial Pokémon',
          attacks: card.attacks || [
            { name: 'Investida', cost: ['Incolor'], effect: 'Um ataque padrão.', damage: 20 }
          ],
          weaknesses: card.weaknesses || [],
          retreat: 1,
          sellValue: this.getSellPrice(rarity)
        };
      });

      // Merge with enriched fallback data for richer attacks/HP where available
      const mergedCards = cards.map(c => {
        const enriched = FALLBACK_CARDS.find(f => f.id === c.id || f.name === c.name);
        if (enriched) {
          return { ...c, ...enriched, image: c.image || enriched.image };
        }
        return c;
      });

      this.memoryCache.set(setId, mergedCards);
      this.saveToStorage(`set_${setId}`, mergedCards);
      return mergedCards;
    } catch (err) {
      console.warn('Could not fetch from TCGDex API, using enriched fallback cards pool:', err);
      this.memoryCache.set(setId, FALLBACK_CARDS);
      return FALLBACK_CARDS;
    }
  }

  // Fetch full details of a specific card if user opens detail modal
  async getCardDetails(cardId) {
    if (this.memoryCache.has(`card_${cardId}`)) {
      return this.memoryCache.get(`card_${cardId}`);
    }

    const cached = this.getFromStorage(`card_${cardId}`);
    if (cached) {
      this.memoryCache.set(`card_${cardId}`, cached);
      return cached;
    }

    try {
      const response = await fetch(`${BASE_URL}/cards/${cardId}`);
      if (response.ok) {
        const data = await response.json();
        const rarity = this.normalizeRarity(data.rarity, data.name);
        const imageBase = data.image || `https://assets.tcgdex.net/pt/${cardId.split('-')[0]}/${cardId.split('-')[1]}`;
        const cleanImage = imageBase.endsWith('.webp') || imageBase.endsWith('.png') 
          ? imageBase 
          : `${imageBase}/high.webp`;

        const detailed = {
          ...data,
          rarity,
          image: cleanImage,
          sellValue: this.getSellPrice(rarity)
        };
        this.memoryCache.set(`card_${cardId}`, detailed);
        this.saveToStorage(`card_${cardId}`, detailed);
        return detailed;
      }
    } catch (e) {
      console.warn(`Card detail fetch failed for ${cardId}:`, e);
    }

    const fallback = FALLBACK_CARDS.find(c => c.id === cardId);
    return fallback || null;
  }

  guessType(name) {
    const n = name.toLowerCase();
    if (n.includes('fogo') || n.includes('flame') || n.includes('char') || n.includes('arcanine') || n.includes('growlithe') || n.includes('crocalor') || n.includes('fuecoco')) return 'Fogo';
    if (n.includes('água') || n.includes('water') || n.includes('gyarados') || n.includes('magikarp') || n.includes('quaxly') || n.includes('quaquaval')) return 'Água';
    if (n.includes('planta') || n.includes('grass') || n.includes('sprigatito') || n.includes('floragato') || n.includes('meowscarada') || n.includes('pineco')) return 'Planta';
    if (n.includes('raio') || n.includes('elet') || n.includes('miraidon') || n.includes('pachirisu') || n.includes('magnemite') || n.includes('flaaffy') || n.includes('pikachu')) return 'Elétrico';
    if (n.includes('psí') || n.includes('gardevoir') || n.includes('ralts') || n.includes('kirlia') || n.includes('drowzee')) return 'Psíquico';
    if (n.includes('luta') || n.includes('koraidon') || n.includes('lucario') || n.includes('riolu') || n.includes('mankey')) return 'Luta';
    if (n.includes('treinador') || n.includes('bola') || n.includes('poção') || n.includes('pad')) return 'Treinador';
    return 'Incolor';
  }
}

export const tcgService = new TCGService();
