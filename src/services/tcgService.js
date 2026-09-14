import { FALLBACK_CARDS } from '../data/fallbackCards';
import { RARITY_PRICES } from '../data/boosterPacks';

const BASE_URL = 'https://api.tcgdex.net/v2/pt';
const DB_NAME = 'pokevault_tcg_db';
const DB_VERSION = 1;
const STORE_SETS = 'sets_cache';
const STORE_CARDS = 'cards_cache';
const CACHE_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export const POPULAR_SETS = [
  { id: 'sv01', name: 'Escarlate & Violeta', series: 'Scarlet & Violet', totalCards: 258, icon: '⚡' },
  { id: 'sv02', name: 'Evoluções em Paldea', series: 'Scarlet & Violet', totalCards: 279, icon: '🌿' },
  { id: 'sv03', name: 'Obsidiana em Chamas', series: 'Scarlet & Violet', totalCards: 230, icon: '🔥' },
  { id: 'sv03.5', name: 'Pokémon 151 (Kanto Clássico)', series: 'Scarlet & Violet', totalCards: 207, icon: '👑' },
  { id: 'sv04', name: 'Fenda Paradoxal', series: 'Scarlet & Violet', totalCards: 266, icon: '🌀' },
  { id: 'sv06', name: 'Máscaras do Crepúsculo', series: 'Scarlet & Violet', totalCards: 226, icon: '🎭' },
  { id: 'swsh01', name: 'Espada & Escudo Base', series: 'Sword & Shield', totalCards: 216, icon: '⚔️' }
];

class TCGService {
  constructor() {
    this.memoryCache = new Map();
    this.dbPromise = this.initIndexedDB();
  }

  // --- INDEXEDDB INITIALIZATION ---
  async initIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_SETS)) {
            db.createObjectStore(STORE_SETS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_CARDS)) {
            db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
          }
        };
        request.onsuccess = (e) => {
          resolve(e.target.result);
        };
        request.onerror = (e) => {
          console.warn('IndexedDB opening error, falling back to storage:', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB not supported or blocked:', err);
        resolve(null);
      }
    });
  }

  async getFromDB(storeName, key) {
    const db = await this.dbPromise;
    if (!db) return this.getFromLocalStorage(key);
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.get(key);
        req.onsuccess = () => {
          const res = req.result;
          if (!res) {
            resolve(null);
            return;
          }
          if (Date.now() - res.timestamp > CACHE_TTL_MS) {
            resolve(null);
          } else {
            resolve(res.data);
          }
        };
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async saveToDB(storeName, key, data) {
    const db = await this.dbPromise;
    if (!db) {
      this.saveToLocalStorage(key, data);
      return;
    }
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put({ id: key, data, timestamp: Date.now() });
    } catch (e) {
      console.warn('IndexedDB write failed:', e);
    }
  }

  // --- LOCALSTORAGE FALLBACK ---
  getFromLocalStorage(key) {
    try {
      const raw = localStorage.getItem(`pokevault_${key}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
        localStorage.removeItem(`pokevault_${key}`);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  saveToLocalStorage(key, data) {
    try {
      const payload = { data, timestamp: Date.now() };
      localStorage.setItem(`pokevault_${key}`, JSON.stringify(payload));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // --- NORMALIZATION & PRICING ---
  normalizeRarity(rawRarity, name = '') {
    if (!rawRarity) {
      if (name.includes(' ex') || name.includes(' VMAX') || name.includes(' VSTAR') || name.includes(' GX') || name.includes(' V')) {
        return 'Ultra Rara';
      }
      return 'Comum';
    }

    const r = rawRarity.toLowerCase();
    if (
      r.includes('ultra') ||
      r.includes('hiper') ||
      r.includes('ilustra') ||
      r.includes('secreta') ||
      r.includes('especial') ||
      r.includes('secret') ||
      r.includes('promo') ||
      name.includes(' ex') ||
      name.includes(' VMAX')
    ) {
      return 'Ultra Rara';
    }
    if (r.includes('holo') || r.includes('rara') || r.includes('rare') || r.includes('dourada') || r.includes('radiante')) {
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

  guessType(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('fogo') || n.includes('flame') || n.includes('char') || n.includes('arcanine') || n.includes('growlithe') || n.includes('crocalor') || n.includes('fuecoco') || n.includes('cinderace') || n.includes('scorbunny')) return 'Fogo';
    if (n.includes('água') || n.includes('water') || n.includes('gyarados') || n.includes('magikarp') || n.includes('quaxly') || n.includes('quaquaval') || n.includes('blastoise') || n.includes('vaporeon') || n.includes('lapras')) return 'Água';
    if (n.includes('planta') || n.includes('grass') || n.includes('sprigatito') || n.includes('floragato') || n.includes('meowscarada') || n.includes('bulbasaur') || n.includes('venusaur') || n.includes('leafeon')) return 'Planta';
    if (n.includes('raio') || n.includes('elet') || n.includes('miraidon') || n.includes('pachirisu') || n.includes('magnemite') || n.includes('flaaffy') || n.includes('pikachu') || n.includes('raichu') || n.includes('jolteon') || n.includes('zapdos')) return 'Elétrico';
    if (n.includes('psí') || n.includes('gardevoir') || n.includes('ralts') || n.includes('kirlia') || n.includes('drowzee') || n.includes('mew') || n.includes('mewtwo') || n.includes('espeon') || n.includes('alakazam')) return 'Psíquico';
    if (n.includes('luta') || n.includes('koraidon') || n.includes('lucario') || n.includes('riolu') || n.includes('mankey') || n.includes('machop') || n.includes('machamp') || n.includes('primeape')) return 'Luta';
    if (n.includes('treinador') || n.includes('bola') || n.includes('poção') || n.includes('pad') || n.includes('professor') || n.includes('energia')) return 'Treinador';
    if (n.includes('metal') || n.includes('aço') || n.includes('steel') || n.includes('gholdengo') || n.includes('corviknight') || n.includes('scizor')) return 'Metal';
    if (n.includes('escur') || n.includes('dark') || n.includes('umbra') || n.includes('gengar') || n.includes('sableye') || n.includes('umbreon')) return 'Escuridão';
    return 'Incolor';
  }

  // Normalize single raw API card
  normalizeCard(card, setId = 'sv01', setName = 'Escarlate & Violeta') {
    const rarity = this.normalizeRarity(card.rarity, card.name);
    const localId = card.localId || '001';
    const rawImage = card.image || `https://assets.tcgdex.net/pt/${setId.startsWith('swsh') ? 'swsh' : 'sv'}/${setId}/${localId}`;
    const cleanImage = (rawImage.endsWith('.webp') || rawImage.endsWith('.png'))
      ? rawImage
      : `${rawImage}/high.webp`;

    return {
      id: card.id || `${setId}-${localId}`,
      localId: localId,
      name: card.name || 'Pokémon',
      rarity,
      category: card.category || (card.name?.includes('Energia') ? 'Energia' : card.name?.includes('Treinador') ? 'Treinador' : 'Pokémon'),
      types: card.types && card.types.length > 0 ? card.types : [this.guessType(card.name)],
      hp: card.hp || (rarity === 'Ultra Rara' ? 240 : rarity === 'Rara' ? 140 : 80),
      stage: card.stage || (rarity === 'Ultra Rara' ? 'Básico ex' : 'Básico'),
      image: cleanImage,
      illustrator: card.illustrator || 'Ilustrador Oficial Pokémon',
      attacks: card.attacks && card.attacks.length > 0 ? card.attacks : [
        { name: 'Investida Poderosa', cost: ['Incolor', 'Incolor'], damage: 30, effect: 'Um ataque padrão confiável.' }
      ],
      weaknesses: card.weaknesses || [],
      retreat: card.retreat || 1,
      sellValue: this.getSellPrice(rarity),
      setId: setId,
      setName: setName
    };
  }

  // --- FETCH SINGLE SET FROM TCGDEX OR CACHE ---
  async getSetCardPool(setId = 'sv01') {
    const memoryKey = `set_${setId}`;
    if (this.memoryCache.has(memoryKey)) {
      return this.memoryCache.get(memoryKey);
    }

    // Check IndexedDB
    const dbCached = await this.getFromDB(STORE_SETS, setId);
    if (dbCached && Array.isArray(dbCached) && dbCached.length > 0) {
      this.memoryCache.set(memoryKey, dbCached);
      return dbCached;
    }

    const setMeta = POPULAR_SETS.find(s => s.id === setId) || { id: setId, name: 'Expansão TCG', totalCards: 200 };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(`${BASE_URL}/sets/${setId}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`TCGDex error status ${response.status}`);
      }

      const setData = await response.json();
      if (!setData || !setData.cards || !Array.isArray(setData.cards)) {
        throw new Error('Invalid set format from API');
      }

      const cards = setData.cards.map(c => this.normalizeCard(c, setId, setData.name || setMeta.name));

      // Enrich with any known fallback details
      const enrichedCards = cards.map(c => {
        const fallback = FALLBACK_CARDS.find(f => f.id === c.id || f.name === c.name);
        if (fallback) {
          return { ...c, ...fallback, image: c.image || fallback.image, setId, setName: setData.name || setMeta.name };
        }
        return c;
      });

      this.memoryCache.set(memoryKey, enrichedCards);
      await this.saveToDB(STORE_SETS, setId, enrichedCards);
      return enrichedCards;
    } catch (err) {
      console.warn(`Could not fetch set ${setId} from TCGDex, using fallback cards:`, err);
      const filteredFallback = FALLBACK_CARDS.map(c => ({ ...c, setId, setName: setMeta.name }));
      this.memoryCache.set(memoryKey, filteredFallback);
      return filteredFallback;
    }
  }

  // --- FETCH MULTIPLE EXPANSIONS COMBINED (THOUSANDS OF CARDS) ---
  async getCombinedCardPool(setIds = ['sv01', 'sv02', 'sv03', 'sv03.5', 'sv04', 'sv06']) {
    const combinedKey = `combined_${setIds.sort().join('_')}`;
    if (this.memoryCache.has(combinedKey)) {
      return this.memoryCache.get(combinedKey);
    }

    const dbCached = await this.getFromDB(STORE_SETS, combinedKey);
    if (dbCached && Array.isArray(dbCached) && dbCached.length > 0) {
      this.memoryCache.set(combinedKey, dbCached);
      return dbCached;
    }

    try {
      const promises = setIds.map(id => this.getSetCardPool(id));
      const results = await Promise.allSettled(promises);

      let allCards = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          allCards = allCards.concat(res.value);
        } else {
          console.warn(`Set ${setIds[i]} failed to load in combined pool.`);
        }
      });

      // Deduplicate by card id
      const seen = new Set();
      const uniqueCards = [];
      for (const card of allCards) {
        if (!seen.has(card.id)) {
          seen.add(card.id);
          uniqueCards.push(card);
        }
      }

      if (uniqueCards.length === 0) {
        return FALLBACK_CARDS;
      }

      this.memoryCache.set(combinedKey, uniqueCards);
      await this.saveToDB(STORE_SETS, combinedKey, uniqueCards);
      return uniqueCards;
    } catch (err) {
      console.error('Failed to build combined card pool:', err);
      return FALLBACK_CARDS;
    }
  }

  // --- FETCH SPECIFIC CARD DETAILS ---
  async getCardDetails(cardId) {
    if (!cardId) return null;

    const memKey = `card_${cardId}`;
    if (this.memoryCache.has(memKey)) {
      return this.memoryCache.get(memKey);
    }

    const cached = await this.getFromDB(STORE_CARDS, cardId);
    if (cached) {
      this.memoryCache.set(memKey, cached);
      return cached;
    }

    try {
      const response = await fetch(`${BASE_URL}/cards/${cardId}`);
      if (response.ok) {
        const data = await response.json();
        const normalized = this.normalizeCard(data, cardId.split('-')[0]);
        this.memoryCache.set(memKey, normalized);
        await this.saveToDB(STORE_CARDS, cardId, normalized);
        return normalized;
      }
    } catch (e) {
      console.warn(`Detail fetch failed for ${cardId}:`, e);
    }

    const fallback = FALLBACK_CARDS.find(c => c.id === cardId);
    return fallback || null;
  }
}

export const tcgService = new TCGService();
