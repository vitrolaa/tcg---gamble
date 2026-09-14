import { FALLBACK_CARDS } from '../data/fallbackCards';
import { RARITY_PRICES } from '../data/boosterPacks';

const BASE_URL = 'https://api.tcgdex.net/v2/pt';
const DB_NAME = 'pokevault_tcg_db';
const DB_VERSION = 2;
const STORE_SETS_LIST = 'sets_list_cache';
const STORE_SET_CARDS = 'set_cards_cache';
const STORE_CARDS = 'cards_cache';
const CACHE_TTL_MS = 72 * 60 * 60 * 1000; // 72 hours

// Curated theme styling for known major Pokémon TCG series
const SERIES_THEMES = {
  'Scarlet & Violet': {
    themeColor: 'from-rose-600 via-purple-600 to-indigo-800',
    glowColor: 'rgba(225, 29, 72, 0.5)',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30'
  },
  'Sword & Shield': {
    themeColor: 'from-blue-600 via-cyan-600 to-indigo-800',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  },
  'Sun & Moon': {
    themeColor: 'from-amber-500 via-orange-600 to-yellow-600',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30'
  },
  'XY': {
    themeColor: 'from-teal-600 via-emerald-600 to-cyan-800',
    glowColor: 'rgba(20, 184, 166, 0.5)',
    badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30'
  },
  'Classic': {
    themeColor: 'from-amber-400 via-rose-600 to-purple-800',
    glowColor: 'rgba(255, 208, 0, 0.7)',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-500/30'
  }
};

export const POPULAR_FALLBACK_SETS = [
  {
    id: 'sv01',
    name: 'Escarlate e Violeta',
    series: 'Scarlet & Violet',
    cardCount: { official: 198, total: 258 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv01/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv01/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv01/013/high.webp',
    coverPokemon: 'Sprigatito & Miraidon',
    price: 150
  },
  {
    id: 'sv02',
    name: 'Evoluções em Paldea',
    series: 'Scarlet & Violet',
    cardCount: { official: 193, total: 279 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv02/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv02/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv02/086/high.webp',
    coverPokemon: 'Meowscarada & Skeledirge',
    price: 220
  },
  {
    id: 'sv03',
    name: 'Obsidiana em Chamas',
    series: 'Scarlet & Violet',
    cardCount: { official: 197, total: 230 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv03/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv03/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv03/125/high.webp',
    coverPokemon: 'Charizard ex Teracristal',
    price: 280
  },
  {
    id: 'sv03.5',
    name: 'Pokémon 151 (Kanto Clássico)',
    series: 'Scarlet & Violet',
    cardCount: { official: 165, total: 207 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv03.5/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv03.5/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv03.5/006/high.webp',
    coverPokemon: 'Mew & 151 Clássicos',
    price: 350
  },
  {
    id: 'sv04',
    name: 'Fenda Paradoxal',
    series: 'Scarlet & Violet',
    cardCount: { official: 182, total: 266 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv04/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv04/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv04/081/high.webp',
    coverPokemon: 'Roaring Moon & Iron Valiant',
    price: 300
  },
  {
    id: 'sv06',
    name: 'Máscaras do Crepúsculo',
    series: 'Scarlet & Violet',
    cardCount: { official: 167, total: 226 },
    logo: 'https://assets.tcgdex.net/pt/sv/sv06/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/sv/sv06/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/sv/sv06/025/high.webp',
    coverPokemon: 'Ogerpon Mascarado',
    price: 320
  },
  {
    id: 'swsh01',
    name: 'Espada e Escudo',
    series: 'Sword & Shield',
    cardCount: { official: 202, total: 216 },
    logo: 'https://assets.tcgdex.net/pt/swsh/swsh01/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/swsh/swsh01/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/swsh/swsh01/001/high.webp',
    coverPokemon: 'Zacian & Zamazenta',
    price: 240
  },
  {
    id: 'swsh12',
    name: 'Tempestade Prateada',
    series: 'Sword & Shield',
    cardCount: { official: 195, total: 245 },
    logo: 'https://assets.tcgdex.net/pt/swsh/swsh12/logo.webp',
    symbol: 'https://assets.tcgdex.net/pt/swsh/swsh12/symbol.webp',
    coverImage: 'https://assets.tcgdex.net/pt/swsh/swsh12/035/high.webp',
    coverPokemon: 'Lugia VSTAR & Alolan Vulpix',
    price: 320
  }
];

export const POPULAR_SETS = POPULAR_FALLBACK_SETS;

class TCGService {
  constructor() {
    this.memoryCache = new Map();
    this.dbPromise = this.initIndexedDB();
  }

  // --- INDEXEDDB STORAGE ENGINE ---
  async initIndexedDB() {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return null;
    }
    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_SETS_LIST)) {
            db.createObjectStore(STORE_SETS_LIST, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_SET_CARDS)) {
            db.createObjectStore(STORE_SET_CARDS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORE_CARDS)) {
            db.createObjectStore(STORE_CARDS, { keyPath: 'id' });
          }
        };
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }

  async getFromDB(storeName, key) {
    const db = await this.dbPromise;
    if (!db) return this.getFromLocalStorage(`${storeName}_${key}`);
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
      this.saveToLocalStorage(`${storeName}_${key}`, data);
      return;
    }
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put({ id: key, data, timestamp: Date.now() });
    } catch (e) {
      console.warn('IndexedDB write error:', e);
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
      console.warn('LocalStorage save error:', e);
    }
  }

  // --- NORMALIZATION HELPERS ---
  normalizeRarity(rawRarity, name = '') {
    if (!rawRarity) {
      if (name.includes(' ex') || name.includes(' VMAX') || name.includes(' VSTAR') || name.includes(' GX') || name.includes(' V') || name.includes(' EX')) {
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
      name.includes(' VMAX') ||
      name.includes(' VSTAR')
    ) {
      return 'Ultra Rara';
    }
    if (r.includes('holo') || r.includes('rara') || r.includes('rare') || r.includes('dourada') || r.includes('radiante') || r.includes('prism')) {
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
    if (n.includes('fogo') || n.includes('flame') || n.includes('char') || n.includes('arcanine') || n.includes('growlithe') || n.includes('crocalor') || n.includes('fuecoco') || n.includes('cinderace') || n.includes('scorbunny') || n.includes('moltres')) return 'Fogo';
    if (n.includes('água') || n.includes('water') || n.includes('gyarados') || n.includes('magikarp') || n.includes('quaxly') || n.includes('quaquaval') || n.includes('blastoise') || n.includes('vaporeon') || n.includes('lapras') || n.includes('articuno')) return 'Água';
    if (n.includes('planta') || n.includes('grass') || n.includes('sprigatito') || n.includes('floragato') || n.includes('meowscarada') || n.includes('bulbasaur') || n.includes('venusaur') || n.includes('leafeon') || n.includes('celebi')) return 'Planta';
    if (n.includes('raio') || n.includes('elet') || n.includes('miraidon') || n.includes('pachirisu') || n.includes('magnemite') || n.includes('flaaffy') || n.includes('pikachu') || n.includes('raichu') || n.includes('jolteon') || n.includes('zapdos')) return 'Elétrico';
    if (n.includes('psí') || n.includes('gardevoir') || n.includes('ralts') || n.includes('kirlia') || n.includes('drowzee') || n.includes('mew') || n.includes('mewtwo') || n.includes('espeon') || n.includes('alakazam')) return 'Psíquico';
    if (n.includes('luta') || n.includes('koraidon') || n.includes('lucario') || n.includes('riolu') || n.includes('mankey') || n.includes('machop') || n.includes('machamp') || n.includes('primeape')) return 'Luta';
    if (n.includes('treinador') || n.includes('bola') || n.includes('poção') || n.includes('pad') || n.includes('professor') || n.includes('energia')) return 'Treinador';
    if (n.includes('metal') || n.includes('aço') || n.includes('steel') || n.includes('gholdengo') || n.includes('corviknight') || n.includes('scizor') || n.includes('dialga')) return 'Metal';
    if (n.includes('escur') || n.includes('dark') || n.includes('umbra') || n.includes('gengar') || n.includes('sableye') || n.includes('umbreon') || n.includes('darkrai')) return 'Escuridão';
    if (n.includes('drag') || n.includes('dragon') || n.includes('dragonite') || n.includes('rayquaza') || n.includes('garchomp')) return 'Dragão';
    return 'Incolor';
  }

  normalizeCard(card, setId = 'sv01', setName = 'Expansão Pokémon') {
    const rarity = this.normalizeRarity(card.rarity, card.name);
    const localId = card.localId || '001';
    
    // Official image standardizing
    const seriesPrefix = setId.startsWith('swsh') ? 'swsh' : setId.startsWith('sm') ? 'sm' : setId.startsWith('xy') ? 'xy' : 'sv';
    const rawImage = card.image || `https://assets.tcgdex.net/pt/${seriesPrefix}/${setId}/${localId}`;
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

  // Calculate dynamic booster pack price based on set series & size
  calculateSetPackPrice(set) {
    const total = set.cardCount?.total || set.totalCards || 200;
    const series = set.series || '';

    if (set.id === 'sv03.5' || set.name.includes('151')) return 350; // Classic 151 special tier
    if (series.includes('Scarlet & Violet')) {
      return total > 250 ? 280 : 200;
    }
    if (series.includes('Sword & Shield')) {
      return total > 230 ? 260 : 220;
    }
    if (series.includes('Sun & Moon')) {
      return 250;
    }
    return 180;
  }

  // --- 1. GET ALL OFFICIAL PT-BR SETS (DYNAMIC SET SYNC) ---
  async getAllOfficialSets() {
    const memKey = 'all_official_sets_pt';
    if (this.memoryCache.has(memKey)) {
      return this.memoryCache.get(memKey);
    }

    const cachedSets = await this.getFromDB(STORE_SETS_LIST, 'pt_sets_all');
    if (cachedSets && Array.isArray(cachedSets) && cachedSets.length > 0) {
      this.memoryCache.set(memKey, cachedSets);
      return cachedSets;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${BASE_URL}/sets`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const rawSets = await response.json();

      if (!Array.isArray(rawSets) || rawSets.length === 0) {
        throw new Error('Invalid sets array');
      }

      // Map raw API sets to enriched booster pack schemas
      const mappedSets = rawSets.map((s, index) => {
        const seriesName = s.series?.name || s.series || (s.id.startsWith('sv') ? 'Scarlet & Violet' : s.id.startsWith('swsh') ? 'Sword & Shield' : s.id.startsWith('sm') ? 'Sun & Moon' : 'Clássico');
        const theme = SERIES_THEMES[seriesName] || SERIES_THEMES['Scarlet & Violet'];
        const logoUrl = s.logo ? `${s.logo}.webp` : `https://assets.tcgdex.net/pt/${s.id.startsWith('swsh') ? 'swsh' : 'sv'}/${s.id}/logo.webp`;
        const symbolUrl = s.symbol ? `${s.symbol}.webp` : null;

        // Default cover image from set cards or fallback
        const fallbackSet = POPULAR_FALLBACK_SETS.find(f => f.id === s.id);
        const coverImage = fallbackSet?.coverImage || `https://assets.tcgdex.net/pt/${s.id.startsWith('swsh') ? 'swsh' : 'sv'}/${s.id}/001/high.webp`;

        return {
          id: s.id,
          name: s.name,
          series: seriesName,
          cardCount: s.cardCount || { official: 180, total: 200 },
          logo: logoUrl,
          symbol: symbolUrl,
          coverImage,
          coverPokemon: fallbackSet?.coverPokemon || `${s.name}`,
          themeColor: theme.themeColor,
          glowColor: theme.glowColor,
          badge: seriesName,
          badgeColor: theme.badgeColor,
          description: `Expansão oficial com ${s.cardCount?.total || 200} cartas colecionáveis em português.`,
          price: this.calculateSetPackPrice(s),
          rates: { common: 55, uncommon: 30, rare: 11, ultraRare: 4 },
          guaranteed: 'Garante pelo menos 1 carta Rara ou superior por pacote.',
          releaseDate: s.releaseDate || ''
        };
      });

      // Filter to sets that have valid cards and sort newest first
      const sortedSets = mappedSets.sort((a, b) => {
        if (a.id.startsWith('sv') && !b.id.startsWith('sv')) return -1;
        if (!a.id.startsWith('sv') && b.id.startsWith('sv')) return 1;
        return b.id.localeCompare(a.id);
      });

      this.memoryCache.set(memKey, sortedSets);
      await this.saveToDB(STORE_SETS_LIST, 'pt_sets_all', sortedSets);
      return sortedSets;
    } catch (err) {
      console.warn('Could not fetch sets list from TCGDex API, using popular sets fallback:', err);
      this.memoryCache.set(memKey, POPULAR_FALLBACK_SETS);
      return POPULAR_FALLBACK_SETS;
    }
  }

  // --- 2. GET SINGLE SET CARD POOL (EXACT SET POOL) ---
  async getSetCardPool(setId = 'sv01') {
    const memKey = `set_cards_${setId}`;
    if (this.memoryCache.has(memKey)) {
      return this.memoryCache.get(memKey);
    }

    const cachedCards = await this.getFromDB(STORE_SET_CARDS, setId);
    if (cachedCards && Array.isArray(cachedCards) && cachedCards.length > 0) {
      this.memoryCache.set(memKey, cachedCards);
      return cachedCards;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const response = await fetch(`${BASE_URL}/sets/${setId}`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const setData = await response.json();

      if (!setData || !setData.cards || !Array.isArray(setData.cards)) {
        throw new Error('Invalid set format');
      }

      const setName = setData.name || setId;
      const normalizedCards = setData.cards.map(c => this.normalizeCard(c, setId, setName));

      // Enrich with any known attacks/fallbacks
      const enriched = normalizedCards.map(c => {
        const fb = FALLBACK_CARDS.find(f => f.id === c.id || f.name === c.name);
        if (fb) {
          return { ...c, ...fb, image: c.image || fb.image, setId, setName };
        }
        return c;
      });

      this.memoryCache.set(memKey, enriched);
      await this.saveToDB(STORE_SET_CARDS, setId, enriched);
      return enriched;
    } catch (err) {
      console.warn(`Could not load cards for set ${setId}, falling back to curated cards:`, err);
      const filtered = FALLBACK_CARDS.map(c => ({ ...c, setId, setName: setId }));
      this.memoryCache.set(memKey, filtered);
      return filtered;
    }
  }

  // --- 3. GET MULTI-SET COMBINED POOL (THOUSANDS OF CARDS) ---
  async getCombinedCardPool(setIds = null) {
    // If no setIds specified, fetch all official sets and combine their top pools
    let targetSetIds = setIds;
    if (!targetSetIds || targetSetIds.length === 0) {
      const allSets = await this.getAllOfficialSets();
      // Combine top 10 sets (thousands of cards across SV and SWSH)
      targetSetIds = allSets.slice(0, 10).map(s => s.id);
    }

    const combinedKey = `combined_${targetSetIds.sort().join('_')}`;
    if (this.memoryCache.has(combinedKey)) {
      return this.memoryCache.get(combinedKey);
    }

    const cachedCombined = await this.getFromDB(STORE_SET_CARDS, combinedKey);
    if (cachedCombined && Array.isArray(cachedCombined) && cachedCombined.length > 0) {
      this.memoryCache.set(combinedKey, cachedCombined);
      return cachedCombined;
    }

    try {
      const promises = targetSetIds.map(id => this.getSetCardPool(id));
      const results = await Promise.allSettled(promises);

      let allCards = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          allCards = allCards.concat(res.value);
        } else {
          console.warn(`Set ${targetSetIds[i]} could not be loaded into combined pool.`);
        }
      });

      // Deduplicate cards by ID
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
      await this.saveToDB(STORE_SET_CARDS, combinedKey, uniqueCards);
      return uniqueCards;
    } catch (err) {
      console.error('Failed to build combined pool:', err);
      return FALLBACK_CARDS;
    }
  }

  // --- 4. GET SINGLE CARD DETAILS ---
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
      console.warn(`Card fetch failed for ${cardId}:`, e);
    }

    const fallback = FALLBACK_CARDS.find(c => c.id === cardId);
    return fallback || null;
  }
}

export const tcgService = new TCGService();
