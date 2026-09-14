import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Percent, ShieldCheck, Zap, Coins, Layers, Calendar, Filter } from 'lucide-react';
import { tcgService } from '../../services/tcgService';
import { Button } from '../ui/Button';
import { DropRatesModal } from './DropRatesModal';
import { useGame } from '../../context/GameContext';
import { useGacha } from '../../hooks/useGacha';

export const PackStore = ({ onPackOpened }) => {
  const { coins, addCoins, pityCounter, pityThreshold } = useGame();
  const { openBoosterPack } = useGacha();

  const [setsList, setSetsList] = useState([]);
  const [isLoadingSets, setIsLoadingSets] = useState(true);
  const [activeSeries, setActiveSeries] = useState('Todos');
  const [openingPackId, setOpeningPackId] = useState(null);
  const [selectedPackForRates, setSelectedPackForRates] = useState(null);
  const [showRatesModal, setShowRatesModal] = useState(false);

  // Load all official sets dynamically from TCGDex
  useEffect(() => {
    let isMounted = true;
    async function loadOfficialSets() {
      setIsLoadingSets(true);
      try {
        const officialSets = await tcgService.getAllOfficialSets();
        if (isMounted) {
          setSetsList(officialSets);
        }
      } catch (err) {
        console.error('Failed to load sets in store:', err);
      } finally {
        if (isMounted) {
          setIsLoadingSets(false);
        }
      }
    }
    loadOfficialSets();
    return () => { isMounted = false; };
  }, []);

  // Extract unique series from sets
  const seriesCategories = ['Todos', ...new Set(setsList.map(s => s.series).filter(Boolean))];

  const filteredSets = activeSeries === 'Todos'
    ? setsList
    : setsList.filter(s => s.series === activeSeries);

  const handleOpenPack = async (pack) => {
    if (openingPackId) return;
    setOpeningPackId(pack.id);
    try {
      const result = await openBoosterPack(pack);
      if (result && onPackOpened) {
        onPackOpened(result);
      }
    } finally {
      setOpeningPackId(null);
    }
  };

  const handleInspectRates = (pack) => {
    setSelectedPackForRates(pack);
    setShowRatesModal(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Store Hero Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 mb-10 shadow-xl overflow-hidden">
        
        {/* Oriental Kanji Watermark */}
        <div className="absolute right-4 -bottom-8 text-9xl font-black text-slate-900/[0.04] dark:text-white/[0.03] select-none pointer-events-none font-japanese">
          商店
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orient-torii/10 dark:bg-amber-500/15 border border-orient-torii/30 dark:border-amber-500/30 text-orient-torii dark:text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="font-japanese text-[10px]">公式</span>
              <span>Expansões Oficiais TCGDex PT-BR</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Loja Oficial de <span className="text-orient-torii dark:text-poke-red">Boosters</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Adquira pacotes com 7 cartas oficiais sincronizados com as expansões reais em português. Cada booster sorteia cartas exclusivas do seu respectivo Set oficial!
            </p>
          </div>

          {/* Testing Coin Grant & Drop Rates Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Button
              variant="glass"
              size="md"
              icon={Percent}
              onClick={() => {
                setSelectedPackForRates(null);
                setShowRatesModal(true);
              }}
            >
              Taxas
            </Button>

            <Button
              variant="primary"
              size="md"
              icon={Coins}
              onClick={() => addCoins(500, 'Recarga de teste concedida (+500 Moedas)!')}
            >
              +500 Moedas Grátis
            </Button>
          </div>
        </div>
      </div>

      {/* Pity Counter Banner */}
      {(() => {
        const pityPct = Math.round((pityCounter / pityThreshold) * 100);
        const remaining = pityThreshold - pityCounter;
        return (
          <div className="relative rounded-2xl glass-panel-subtle border border-slate-200/60 dark:border-slate-700/60 px-5 py-3.5 mb-8 overflow-hidden">
            {pityCounter >= 7 && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-400/8 to-transparent pointer-events-none animate-pulse" />
            )}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{pityCounter >= 7 ? '🔥' : '💎'}</span>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">
                    Garantia de Ultra Rara (Pity System)
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {pityCounter === 0
                      ? 'Abra pacotes para acumular garantia'
                      : remaining === 1
                      ? '⚡ Próximo pacote garante uma Ultra Rara!'
                      : `Faltam ${remaining} pacote${remaining > 1 ? 's' : ''} para a garantia`
                    }
                  </p>
                </div>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      pityCounter >= 7
                        ? 'bg-gradient-to-r from-purple-500 to-fuchsia-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${pityPct}%` }}
                  />
                </div>
                <span className="text-xs font-black font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  {pityCounter}/{pityThreshold}
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Series Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {seriesCategories.map(series => (
          <button
            key={series}
            onClick={() => setActiveSeries(series)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 cursor-pointer ${
              activeSeries === series
                ? 'bg-orient-torii dark:bg-poke-yellow text-white dark:text-slate-900 border-transparent shadow-md'
                : 'glass-panel-subtle border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orient-torii/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {series}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-mono">
          {filteredSets.length} expans{filteredSets.length !== 1 ? 'ões' : 'ão'} disponível
        </span>
      </div>

      {/* Booster Packs Grid */}
      {isLoadingSets ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 rounded-3xl glass-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
          {filteredSets.map((pack, index) => {
            const canAfford = coins >= pack.price;
            const isThisOpening = openingPackId === pack.id;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.08, 0.8) }}
                whileHover={{ y: -6 }}
                className="relative rounded-3xl glass-panel p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 group"
              >
                {/* Badge Tag & Set Logo / Identifier */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${pack.badgeColor}`}>
                      {pack.series}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                      {pack.id}
                    </span>
                  </div>

                  <button
                    onClick={() => handleInspectRates(pack)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Percent className="w-3.5 h-3.5" />
                    Taxas
                  </button>
                </div>

                {/* 3D Booster Visual Preview */}
                <div className="my-3 flex items-center justify-center relative">
                  <div
                    className={`w-44 h-64 rounded-2xl bg-gradient-to-br ${pack.themeColor} p-1 shadow-2xl relative overflow-hidden transition-transform duration-300 group-hover:scale-105 border border-white/30`}
                  >
                    <div className="w-full h-full rounded-xl bg-slate-950/80 p-3 flex flex-col items-center justify-between backdrop-blur-sm">
                      <span className="text-[9px] font-black uppercase text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30 font-japanese">
                        7枚入 • 7 CARTAS
                      </span>

                      {/* Official Set Card Art Preview */}
                      <img
                        src={pack.coverImage}
                        alt={pack.name}
                        className="w-32 h-36 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-300"
                      />

                      <span className="text-xs font-black tracking-wider text-white font-display text-center truncate w-full">
                        {pack.name}
                      </span>
                    </div>
                  </div>

                  {/* Ambient Glow */}
                  <div
                    className="absolute inset-0 rounded-full blur-3xl opacity-25 -z-10 group-hover:opacity-45 transition-opacity duration-300"
                    style={{ background: pack.glowColor }}
                  />
                </div>

                {/* Pack Info & Features */}
                <div className="flex flex-col gap-2.5 my-2">
                  <div>
                    <h3 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white truncate">
                      {pack.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{pack.cardCount?.total || 200} cartas no catálogo do set</span>
                    </p>
                  </div>

                  {/* Guaranteed feature callout */}
                  <div className="flex items-center gap-2 p-2 rounded-2xl glass-panel-subtle text-xs text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="leading-tight text-[11px] font-medium">{pack.guaranteed}</span>
                  </div>
                </div>

                {/* Price & Buy Action */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Preço</span>
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-mono font-black text-lg">
                      <span>{pack.price}</span>
                      <span className="text-xs font-sans text-amber-700 dark:text-amber-500 font-bold">moedas</span>
                    </div>
                  </div>

                  <Button
                    variant={canAfford ? 'primary' : 'secondary'}
                    size="md"
                    icon={Sparkles}
                    disabled={!canAfford || isThisOpening}
                    onClick={() => handleOpenPack(pack)}
                    className="flex-1"
                  >
                    {isThisOpening ? 'Abrindo...' : canAfford ? 'Abrir Booster' : 'Sem Moedas'}
                  </Button>
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* Drop Rates Modal */}
      {showRatesModal && (
        <DropRatesModal
          selectedPack={selectedPackForRates}
          onClose={() => setShowRatesModal(false)}
        />
      )}

    </div>
  );
};
