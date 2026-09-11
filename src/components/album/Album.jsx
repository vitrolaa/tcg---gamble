import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Layers, Sparkles, ChevronLeft, ChevronRight, Lock, ShoppingBag } from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { AlbumFilters } from './AlbumFilters';
import { CardDetailModal } from './CardDetailModal';
import { HolographicCard } from '../gacha/HolographicCard';
import { Button } from '../ui/Button';
import { useGame } from '../../context/GameContext';

const CARDS_PER_PAGE = 24;

export const Album = ({ onOpenStore, onOpenRecycle }) => {
  const { cardPool, inventory, isLoadingPool } = useGame();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedRarity, setSelectedRarity] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCardForModal, setSelectedCardForModal] = useState(null);

  const filteredCards = useMemo(() => {
    if (!cardPool) return [];

    return cardPool.filter(card => {
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        const matchesName = card.name?.toLowerCase().includes(query);
        const matchesNumber = card.localId?.toString().includes(query);
        if (!matchesName && !matchesNumber) return false;
      }

      if (selectedType !== 'Todos') {
        const types = card.types || [];
        const hasType = types.some(t => t.toLowerCase() === selectedType.toLowerCase());
        if (!hasType) return false;
      }

      if (selectedRarity !== 'Todas') {
        if (card.rarity !== selectedRarity) return false;
      }

      const item = inventory[card.id];
      const isOwned = item && item.count > 0;
      const isDuplicate = item && item.count > 1;

      if (statusFilter === 'owned' && !isOwned) return false;
      if (statusFilter === 'missing' && isOwned) return false;
      if (statusFilter === 'duplicates' && !isDuplicate) return false;

      return true;
    });
  }, [cardPool, inventory, search, selectedType, selectedRarity, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCards.length / CARDS_PER_PAGE));
  const currentCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    return filteredCards.slice(start, start + CARDS_PER_PAGE);
  }, [filteredCards, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Progress & Stats Bar */}
      <ProgressBar onOpenRecycle={onOpenRecycle} />

      {/* Prominent Quick Selling Action Callout */}
      <div className="mb-6 p-4 sm:p-5 rounded-3xl glass-panel border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg bg-emerald-500/[0.04]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-display font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Mercado de Vendas & Reciclagem de Cartas</span>
              <span className="hanko-seal text-[8px]">換金所</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Venda cópias repetidas para ganhar PokéMoedas ou clique em qualquer carta para vender cópias extras individualmente.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenRecycle}
          className="w-full sm:w-auto shrink-0"
        >
          Abrir Painel de Vendas
        </Button>
      </div>

      {/* Filter Controls */}
      <AlbumFilters
        search={search}
        setSearch={setSearch}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedRarity={selectedRarity}
        setSelectedRarity={setSelectedRarity}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalMatching={filteredCards.length}
      />

      {/* Loading Skeleton */}
      {isLoadingPool ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 my-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2.5/3.5] rounded-2xl glass-card animate-pulse" />
          ))}
        </div>
      ) : filteredCards.length === 0 ? (
        /* Empty State */
        <div className="rounded-3xl glass-panel p-12 text-center my-8 flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl glass-panel-subtle text-slate-400">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
            Nenhuma carta encontrada com os filtros atuais
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md">
            Experimente alterar os filtros ou abrir mais pacotes de booster na loja para expandir sua coleção!
          </p>
          <Button
            variant="torii"
            size="md"
            icon={ShoppingBag}
            onClick={onOpenStore}
          >
            Ir para a Loja de Boosters
          </Button>
        </div>
      ) : (
        /* Main Binder Grid */
        <div className="rounded-3xl glass-panel p-4 sm:p-7 shadow-lg my-6">
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-5">
            {currentCards.map((card) => {
              const item = inventory[card.id];
              const isOwned = item && item.count > 0;
              const count = item ? item.count : 0;

              return (
                <div key={card.id} className="flex flex-col gap-1.5 group">
                  {isOwned ? (
                    /* OWNED CARD: Full Color 3D Holographic */
                    <HolographicCard
                      card={card}
                      isFlipped={true}
                      showDuplicateBadge={true}
                      duplicateCount={count}
                      interactive={true}
                      onClick={() => setSelectedCardForModal(card)}
                    />
                  ) : (
                    /* UNOWNED CARD: Japanese Minimalist Frosted Sleeve Slot */
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedCardForModal(card)}
                      className="relative w-full aspect-[2.5/3.5] rounded-2xl glass-panel-subtle flex flex-col items-center justify-between p-3.5 cursor-pointer hover:border-orient-torii/30 dark:hover:border-slate-600 transition-all overflow-hidden shadow-sm"
                    >
                      {/* Top Meta */}
                      <div className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                        <span>#{card.localId}</span>
                        <Lock className="w-3 h-3 text-slate-400 dark:text-slate-600 group-hover:text-orient-torii dark:group-hover:text-poke-yellow transition-colors" />
                      </div>

                      {/* Center Silhouette Minimal */}
                      <div className="flex flex-col items-center justify-center gap-1.5 opacity-40 group-hover:opacity-75 transition-opacity">
                        <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                          <span className="font-japanese text-xs font-bold text-slate-400 dark:text-slate-500">
                            未
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 text-center max-w-[100px] truncate">
                          {card.name}
                        </span>
                      </div>

                      {/* Bottom Status */}
                      <div className="w-full text-center">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-japanese">
                          未所持 (Não Obtida)
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Card Label */}
                  <div className="flex items-center justify-between px-1 text-xs">
                    <span className={`font-semibold truncate max-w-[90px] ${isOwned ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>
                      {card.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      #{card.localId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Binder Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-800/80">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Página <strong className="text-slate-900 dark:text-white">{currentPage}</strong> de <strong className="text-slate-900 dark:text-white">{totalPages}</strong> ({filteredCards.length} cartas totais)
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={ChevronLeft}
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  Anterior
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5 && currentPage > 3) {
                      pageNum = Math.min(currentPage - 2 + i, totalPages - 4 + i);
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm font-black'
                            : 'glass-panel-subtle text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Próxima <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Card Detail Modal */}
      {selectedCardForModal && (
        <CardDetailModal
          card={selectedCardForModal}
          onClose={() => setSelectedCardForModal(null)}
        />
      )}

    </div>
  );
};
