import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Sparkles, Percent, ShieldCheck, Zap, Coins } from 'lucide-react';
import { BOOSTER_PACKS } from '../../data/boosterPacks';
import { Button } from '../ui/Button';
import { DropRatesModal } from './DropRatesModal';
import { useGame } from '../../context/GameContext';
import { useGacha } from '../../hooks/useGacha';

export const PackStore = ({ onPackOpened }) => {
  const { coins, addCoins, pityCounter, pityThreshold } = useGame();
  const { openBoosterPack } = useGacha();
  const [selectedPackForRates, setSelectedPackForRates] = useState(null);
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const CATEGORIES = ['Todos', 'Geral', 'Elementar', 'Avançado', 'Especial', 'Supremo'];

  const filteredPacks = activeCategory === 'Todos'
    ? BOOSTER_PACKS
    : BOOSTER_PACKS.filter(p => p.category === activeCategory);

  const KANJI_LABELS = ['基本', '新', '炎', '水', '雷', '上', '竜', '霊', '氷', '伝'];

  const handleOpenPack = (pack) => {
    const result = openBoosterPack(pack);
    if (result && onPackOpened) {
      onPackOpened(result);
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
              <span>Expansão Oficial TCGDex PT-BR</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-slate-900 dark:text-white tracking-tight">
              Loja Oficial de <span className="text-orient-torii dark:text-poke-red">Boosters</span>
            </h1>
            
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Adquira pacotes com 7 cartas colecionáveis em alta definição direto da base oficial da TCGDex. Sorteios com garantia de cartas Raras e Ultra Raras Secretas!
            </p>
          </div>

          {/* Quick Bonus / Testing Coin Gain */}
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
              Tabela de Taxas
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
            {/* Danger glow when close */}
            {pityCounter >= 7 && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-fuchsia-400/8 to-transparent pointer-events-none animate-pulse" />
            )}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{pityCounter >= 7 ? '🔥' : '💎'}</span>
                <div>
                  <p className="text-xs font-black text-slate-800 dark:text-white">
                    Garantia de Ultra Rara
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

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-orient-torii dark:bg-poke-yellow text-white dark:text-slate-900 border-transparent shadow-md'
                : 'glass-panel-subtle border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-orient-torii/50 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 font-mono">
          {filteredPacks.length} pacote{filteredPacks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Booster Packs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {filteredPacks.map((pack, index) => {
          const globalIndex = BOOSTER_PACKS.indexOf(pack);
          const canAfford = coins >= pack.price;

          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              whileHover={{ y: -6 }}
              className="relative rounded-3xl glass-panel p-6 sm:p-7 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Badge Tag with Oriental Accent */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${pack.badgeColor}`}>
                    {pack.badge}
                  </span>
                  <span className="text-[10px] font-japanese text-slate-400 font-bold">
                    {KANJI_LABELS[globalIndex] ?? '札'}
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

                    <img
                      src={pack.coverImage}
                      alt={pack.coverPokemon}
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
                  <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
                    {pack.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {pack.description}
                  </p>
                </div>

                {/* Guaranteed feature callout */}
                <div className="flex items-center gap-2 p-2.5 rounded-2xl glass-panel-subtle text-xs text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span className="leading-tight font-medium">{pack.guaranteed}</span>
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
                  variant={canAfford ? (pack.category === 'Supremo' ? 'torii' : 'primary') : 'secondary'}
                  size="md"
                  icon={Sparkles}
                  disabled={!canAfford}
                  onClick={() => handleOpenPack(pack)}
                  className="flex-1"
                >
                  {canAfford ? 'Abrir Pacote' : 'Sem Moedas'}
                </Button>
              </div>

            </motion.div>
          );
        })}
      </div>

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
