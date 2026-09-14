import React from 'react';
import { Search, Filter, Sparkles, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { POPULAR_SETS } from '../../services/tcgService';

export const POKEMON_TYPES = [
  { name: 'Todos', kanji: '全' },
  { name: 'Planta', kanji: '草', color: 'hover:border-emerald-400' },
  { name: 'Fogo', kanji: '炎', color: 'hover:border-orange-400' },
  { name: 'Água', kanji: '水', color: 'hover:border-blue-400' },
  { name: 'Elétrico', kanji: '雷', color: 'hover:border-amber-400' },
  { name: 'Psíquico', kanji: '超', color: 'hover:border-pink-400' },
  { name: 'Luta', kanji: '闘', color: 'hover:border-red-400' },
  { name: 'Escuridão', kanji: '悪', color: 'hover:border-purple-400' },
  { name: 'Metal', kanji: '鋼', color: 'hover:border-slate-400' },
  { name: 'Incolor', kanji: '無', color: 'hover:border-stone-400' },
  { name: 'Treinador', kanji: '訓', color: 'hover:border-indigo-400' }
];

export const RARITY_OPTIONS = [
  { name: 'Todas', kanji: '全' },
  { name: 'Comum', kanji: '普' },
  { name: 'Incomum', kanji: '特' },
  { name: 'Rara', kanji: '稀' },
  { name: 'Ultra Rara', kanji: '極' }
];

export const STATUS_OPTIONS = [
  { id: 'all', label: 'Todas as Cartas', kanji: '全て' },
  { id: 'owned', label: 'Apenas Obtidas', kanji: '入手済' },
  { id: 'missing', label: 'Faltando no Álbum', kanji: '未所持' },
  { id: 'duplicates', label: 'Com Repetidas', kanji: '重複' }
];

export const AlbumFilters = ({
  search,
  setSearch,
  selectedType,
  setSelectedType,
  selectedRarity,
  setSelectedRarity,
  statusFilter,
  setStatusFilter,
  selectedSet,
  setSelectedSet,
  totalMatching
}) => {
  return (
    <div className="w-full flex flex-col gap-4 mb-6">
      
      {/* Top Search Bar & Status Tabs */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, número (#001) ou expansão..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-panel-subtle text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orient-torii/40 dark:focus:ring-poke-yellow/40 transition-all shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white font-medium cursor-pointer"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 glass-panel rounded-2xl overflow-x-auto max-w-full">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.id}
              onClick={() => setStatusFilter(opt.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === opt.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/40'
              }`}
            >
              <span className="text-[10px] font-japanese opacity-75">{opt.kanji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Expansion Set Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-display">
          Expansão:
        </span>
        <button
          onClick={() => setSelectedSet('all')}
          className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all border cursor-pointer ${
            selectedSet === 'all'
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
              : 'glass-panel-subtle text-slate-400 border-slate-700 hover:text-white'
          }`}
        >
          Todas as Expansões (Milhares de Cartas)
        </button>
        {POPULAR_SETS.map(set => (
          <button
            key={set.id}
            onClick={() => setSelectedSet(set.id)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer flex items-center gap-1.5 ${
              selectedSet === set.id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm font-bold'
                : 'glass-panel-subtle text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <span>{set.icon}</span>
            <span>{set.name}</span>
          </button>
        ))}
      </div>

      {/* Secondary Row: Types & Rarities Pill Chips */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
        
        {/* Types Horizontal Scroller */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0 font-display">
            Tipo:
          </span>
          {POKEMON_TYPES.map(type => (
            <button
              key={type.name}
              onClick={() => setSelectedType(type.name)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all border cursor-pointer flex items-center gap-1 ${
                selectedType === type.name
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-japanese opacity-70">{type.kanji}</span>
              <span>{type.name}</span>
            </button>
          ))}
        </div>

        {/* Rarities Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 font-display">
            Raridade:
          </span>
          {RARITY_OPTIONS.map(rarity => (
            <button
              key={rarity.name}
              onClick={() => setSelectedRarity(rarity.name)}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1 ${
                selectedRarity === rarity.name
                  ? rarity.name === 'Ultra Rara'
                    ? 'bg-gradient-to-r from-amber-500 to-orient-yamabuki text-slate-950 border-amber-300 font-bold shadow-sm'
                    : rarity.name === 'Rara'
                    ? 'bg-orient-ai dark:bg-poke-blue text-white border-blue-400 font-bold shadow-sm'
                    : 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent'
                  : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span className="text-[10px] font-japanese opacity-70">{rarity.kanji}</span>
              <span>{rarity.name}</span>
            </button>
          ))}
        </div>

      </div>

      {/* Matching summary */}
      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
        <span>Exibindo <strong>{totalMatching}</strong> cartas no catálogo</span>
        {(search || selectedType !== 'Todos' || selectedRarity !== 'Todas' || statusFilter !== 'all' || selectedSet !== 'all') && (
          <button
            onClick={() => {
              setSearch('');
              setSelectedType('Todos');
              setSelectedRarity('Todas');
              setStatusFilter('all');
              setSelectedSet('all');
            }}
            className="text-orient-torii dark:text-poke-yellow hover:underline cursor-pointer font-bold"
          >
            Resetar Filtros
          </button>
        )}
      </div>

    </div>
  );
};
