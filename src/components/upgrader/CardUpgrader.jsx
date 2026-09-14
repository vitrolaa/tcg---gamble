import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronsUp,
  Sparkles,
  Info,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Search,
  X,
  Plus,
  Coins,
  ShieldCheck,
  Award,
  Layers,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

const MULTIPLIER_PRESETS = [
  { label: 'x1.5', mult: 1.5 },
  { label: 'x2', mult: 2.0 },
  { label: 'x4', mult: 4.0 },
  { label: 'x10', mult: 10.0 },
  { label: '35%', chance: 35 },
  { label: '50%', chance: 50 },
  { label: '70%', chance: 70 },
];

export const CardUpgrader = ({ onOpenAlbum }) => {
  const {
    coins,
    inventory,
    cardPool,
    burnCardFromInventory,
    addCardsToInventory,
    spendCoins,
    addCoins,
    recordCasinoGame,
    isMuted,
    toggleSound,
    addToast
  } = useGame();

  // Selected input cards from inventory
  const [selectedSacrificeCards, setSelectedSacrificeCards] = useState([]); // [{ card, count }]
  const [addedCoinBalance, setAddedCoinBalance] = useState(0);

  // Selected target card
  const [selectedTargetCard, setSelectedTargetCard] = useState(null);

  // Inventory & Target Filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [targetSearch, setTargetSearch] = useState('');
  const [targetRarityFilter, setTargetRarityFilter] = useState('Todas');
  const [targetSortOrder, setTargetSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Wheel animation state
  const [isRolling, setIsRolling] = useState(false);
  const [needleRotation, setNeedleRotation] = useState(0);
  const [rollResult, setRollResult] = useState(null); // { won: boolean, landedAngle: number, winAngle: number }
  const [statusMessage, setStatusMessage] = useState('');

  // Default target selection on mount
  useEffect(() => {
    if (!selectedTargetCard && cardPool && cardPool.length > 0) {
      // Pick a cool rare or ultra rare card by default
      const defaultTarget = cardPool.find(c => c.rarity === 'Ultra Rara' || c.rarity === 'Rara') || cardPool[0];
      setSelectedTargetCard(defaultTarget);
    }
  }, [cardPool, selectedTargetCard]);

  // Calculate total input value (Sacrificed Cards Value + Added Coin Balance)
  const cardsInputValue = useMemo(() => {
    return selectedSacrificeCards.reduce((sum, item) => sum + (item.card.sellValue || 35) * item.count, 0);
  }, [selectedSacrificeCards]);

  const totalInputValue = cardsInputValue + addedCoinBalance;

  // Calculate target value
  const targetCardValue = useMemo(() => {
    if (!selectedTargetCard) return 100;
    return (selectedTargetCard.sellValue || 100) * 1.6; // Market target pricing
  }, [selectedTargetCard]);

  // Calculate win probability: (totalInputValue / targetCardValue) * 95% (5% house edge)
  const winProbability = useMemo(() => {
    if (totalInputValue <= 0 || targetCardValue <= 0) return 0;
    const rawChance = (totalInputValue / targetCardValue) * 95;
    return Math.min(95, Math.max(1, Number(rawChance.toFixed(2))));
  }, [totalInputValue, targetCardValue]);

  // Win arc angle on 360-degree circle
  const winAngleDegree = (winProbability / 100) * 360;

  // Multiplier from input to target
  const calculatedMultiplier = totalInputValue > 0
    ? Number((targetCardValue / totalInputValue).toFixed(2))
    : 0;

  // Handle preset clicks (e.g. x2, x4, 50%, 70%)
  const handleApplyPreset = (preset) => {
    if (!cardPool || cardPool.length === 0) return;

    let targetPrice = 0;
    if (preset.mult) {
      const baseInput = totalInputValue > 0 ? totalInputValue : 200;
      targetPrice = baseInput * preset.mult;
    } else if (preset.chance) {
      const baseInput = totalInputValue > 0 ? totalInputValue : 200;
      targetPrice = (baseInput * 95) / preset.chance;
    }

    // Find card in pool closest to target price
    const sortedByDistance = [...cardPool].sort((a, b) => {
      const priceA = (a.sellValue || 100) * 1.6;
      const priceB = (b.sellValue || 100) * 1.6;
      return Math.abs(priceA - targetPrice) - Math.abs(priceB - targetPrice);
    });

    if (sortedByDistance[0]) {
      setSelectedTargetCard(sortedByDistance[0]);
    }
  };

  // Inventory available items
  const availableInventoryItems = useMemo(() => {
    return Object.values(inventory).filter(item => {
      if (item.count <= 0) return false;
      if (inventorySearch.trim()) {
        const query = inventorySearch.toLowerCase();
        return item.card.name.toLowerCase().includes(query) || item.card.localId?.includes(query);
      }
      return true;
    });
  }, [inventory, inventorySearch]);

  // Target card pool browser
  const availableTargetPool = useMemo(() => {
    if (!cardPool) return [];
    return cardPool
      .filter(card => {
        if (targetSearch.trim()) {
          const query = targetSearch.toLowerCase();
          const matchesName = card.name.toLowerCase().includes(query);
          const matchesSet = card.setName?.toLowerCase().includes(query);
          if (!matchesName && !matchesSet) return false;
        }
        if (targetRarityFilter !== 'Todas' && card.rarity !== targetRarityFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const valA = (a.sellValue || 100) * 1.6;
        const valB = (b.sellValue || 100) * 1.6;
        return targetSortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [cardPool, targetSearch, targetRarityFilter, targetSortOrder]);

  // Add card to sacrifice list
  const handleSelectSacrificeCard = (cardItem) => {
    const currentSelected = selectedSacrificeCards.find(s => s.card.id === cardItem.card.id)?.count || 0;
    if (currentSelected >= cardItem.count) {
      addToast('Máximo Selecionado', 'Você já selecionou todas as cópias disponíveis desta carta.', 'info');
      return;
    }

    setSelectedSacrificeCards(prev => {
      const exists = prev.find(s => s.card.id === cardItem.card.id);
      if (exists) {
        return prev.map(s => s.card.id === cardItem.card.id ? { ...s, count: s.count + 1 } : s);
      }
      return [...prev, { card: cardItem.card, count: 1 }];
    });
  };

  const handleRemoveSacrificeCard = (cardId) => {
    setSelectedSacrificeCards(prev => {
      const exists = prev.find(s => s.card.id === cardId);
      if (!exists) return prev;
      if (exists.count <= 1) {
        return prev.filter(s => s.card.id !== cardId);
      }
      return prev.map(s => s.card.id === cardId ? { ...s, count: s.count - 1 } : s);
    });
  };

  const handleClearSacrifice = () => {
    setSelectedSacrificeCards([]);
    setAddedCoinBalance(0);
  };

  // --- EXECUTE UPGRADE ROLL ---
  const handleExecuteUpgrade = () => {
    if (isRolling) return;

    if (totalInputValue <= 0) {
      addToast('Selecione Itens', 'Você precisa adicionar cartas ou saldo de moedas para o upgrade!', 'warning');
      return;
    }

    if (!selectedTargetCard) {
      addToast('Selecione o Alvo', 'Escolha a carta que você deseja tentar obter no upgrade!', 'warning');
      return;
    }

    // Deduct coins balance if used
    if (addedCoinBalance > 0) {
      if (coins < addedCoinBalance) {
        addToast('Moedas Insuficientes', 'Você não tem saldo suficiente para o valor adicionado!', 'error');
        return;
      }
      spendCoins(addedCoinBalance);
    }

    // Deduct / Burn cards from inventory
    selectedSacrificeCards.forEach(item => {
      for (let i = 0; i < item.count; i++) {
        burnCardFromInventory(item.card.id);
      }
    });

    setIsRolling(true);
    setRollResult(null);
    setStatusMessage('GIRANDO O UPGRADER...');
    soundService.playCylinderSpin();

    // Roll random landing angle (0 to 360)
    const rolledLandingDegree = Math.random() * 360;
    const isSuccess = rolledLandingDegree <= winAngleDegree;

    // Spin 4 full rotations + landing degree
    const totalSpinDegrees = needleRotation + 1440 + rolledLandingDegree;
    setNeedleRotation(totalSpinDegrees);

    setTimeout(() => {
      setIsRolling(false);
      setRollResult({ won: isSuccess, landedAngle: rolledLandingDegree, winAngle: winAngleDegree });

      if (isSuccess) {
        // --- WINNER ---
        addCardsToInventory([selectedTargetCard]);
        soundService.playJackpotWin();
        setStatusMessage('UPGRADE REALIZADO COM SUCESSO!');

        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#eab308', '#22c55e', '#3b82f6', '#f43f5e']
        });

        recordCasinoGame({
          type: 'upgrader',
          bet: totalInputValue,
          won: true,
          payout: targetCardValue
        });

        addToast(
          '🎉 UPGRADE COM SUCESSO!',
          `Você forjou com sucesso 1x ${selectedTargetCard.name} (${winProbability}% de chance)!`,
          'success'
        );
      } else {
        // --- LOST / FAILED ---
        soundService.playDryClick();
        setStatusMessage('UPGRADE FALHOU!');

        recordCasinoGame({
          type: 'upgrader',
          bet: totalInputValue,
          won: false,
          payout: 0
        });

        addToast(
          '💥 UPGRADE FALHOU',
          `O ponteiro parou fora da zona dourada. As cartas e saldo foram consumidos.`,
          'error'
        );
      }

      // Reset inputs after roll
      setSelectedSacrificeCards([]);
      setAddedCoinBalance(0);
    }, 2800);
  };

  // Circular gauge SVG calculations
  const gaugeRadius = 110;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const greenStrokeDash = (winProbability / 100) * gaugeCircumference;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-slate-100">
      
      {/* Upgrader Main Bar Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center p-2 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <ChevronsUp className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black tracking-wider text-white uppercase flex items-center gap-2">
              <span>UPGRADER</span>
              <span className="hanko-seal text-[9px] text-amber-400">昇級</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Multiplique suas cartas e saldo de moedas em upgrades de alta precisão
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={isMuted ? 'Ativar Sons' : 'Desativar Sons'}
            className="p-2.5 rounded-xl glass-panel-subtle text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coins.toLocaleString('pt-BR')}</span>
          </div>
        </div>
      </div>

      {/* Main CS2-Style Upgrader Altar (3 Main Boxes) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-10">
        
        {/* Left Column: Sacrifice Selection Box */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-slate-800 bg-[#10141f] shadow-2xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Cartas & Saldo de Entrada
              </span>
              {selectedSacrificeCards.length > 0 && (
                <button
                  onClick={handleClearSacrifice}
                  className="text-[11px] text-slate-500 hover:text-rose-400 font-bold transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-4">
              Selecione cartas do seu inventário ou adicione moedas para aumentar sua chance
            </p>

            {/* Central Slot Preview */}
            <div className="relative w-full h-44 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 flex flex-col items-center justify-center p-3 overflow-hidden">
              {selectedSacrificeCards.length > 0 ? (
                <div className="flex items-center gap-2 overflow-x-auto max-w-full p-1 scrollbar-none">
                  {selectedSacrificeCards.map((item) => (
                    <div
                      key={item.card.id}
                      className="relative p-1.5 rounded-xl bg-slate-900 border border-slate-700 shrink-0 flex flex-col items-center group"
                    >
                      <button
                        onClick={() => handleRemoveSacrificeCard(item.card.id)}
                        className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-rose-600 text-white shadow-md hover:scale-110 transition-transform z-20 cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <img
                        src={item.card.image}
                        alt={item.card.name}
                        className="w-16 h-22 object-cover rounded-lg shadow-sm"
                      />
                      <span className="text-[10px] font-bold text-white truncate max-w-[70px] mt-1">
                        {item.card.name}
                      </span>
                      <span className="text-[9px] font-mono text-amber-400 font-bold">
                        {item.count}x ({(item.card.sellValue || 35) * item.count}🟡)
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2 opacity-60">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <ChevronsUp className="w-6 h-6 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold text-slate-400 max-w-[200px]">
                    Nenhuma carta selecionada
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Balance Slider & Summary */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-slate-400">Adicionar Moedas:</span>
              <span className="text-amber-400">+{addedCoinBalance} moedas</span>
            </div>

            <input
              type="range"
              min="0"
              max={Math.min(coins, 5000)}
              step="50"
              value={addedCoinBalance}
              onChange={(e) => setAddedCoinBalance(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-bold">Valor Total de Entrada:</span>
              <span className="font-mono font-black text-amber-300 text-sm">
                {totalInputValue.toLocaleString('pt-BR')} moedas
              </span>
            </div>
          </div>

        </div>

        {/* Center Column: The Circular Radial Roll Gauge & Pointer */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 bg-[#0e121c] shadow-2xl relative">
          
          {/* Circular Wheel Gauge Container */}
          <div className="relative w-64 h-64 flex items-center justify-center my-2">
            
            {/* SVG Circular Progress Arc */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 260 260">
              {/* Background Dark Losing Track */}
              <circle
                cx="130"
                cy="130"
                r={gaugeRadius}
                fill="transparent"
                stroke="#1e293b"
                strokeWidth="20"
              />

              {/* Winning Colored Arc */}
              <circle
                cx="130"
                cy="130"
                r={gaugeRadius}
                fill="transparent"
                stroke="url(#upgraderGradient)"
                strokeWidth="20"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeCircumference - greenStrokeDash}
                strokeLinecap="round"
                className="transition-all duration-300"
              />

              <defs>
                <linearGradient id="upgraderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="60%" stopColor="#84cc16" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
            </svg>

            {/* Pointer / Needle Element */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              animate={{ rotate: needleRotation }}
              transition={{ duration: isRolling ? 2.8 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="absolute top-1 w-5 h-8 flex flex-col items-center">
                <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[14px] border-t-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
              </div>
            </motion.div>

            {/* Inner Center Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 select-none">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400 mb-1">
                <ChevronsUp className="w-5 h-5" />
              </div>

              <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tight ${
                winProbability >= 50 ? 'text-emerald-400' : winProbability >= 20 ? 'text-amber-400' : 'text-rose-400'
              }`}>
                {winProbability.toFixed(2)}%
              </span>

              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
                {statusMessage || 'Chance de Upgrade'}
              </span>

              {calculatedMultiplier > 0 && (
                <span className="text-[10px] font-mono text-amber-400 font-bold mt-0.5">
                  Multiplicador {calculatedMultiplier}x
                </span>
              )}
            </div>

          </div>

          {/* Big Yellow Action Button (Add to Upgrade / Upgrade) */}
          <div className="w-full mt-6">
            <Button
              variant="torii"
              size="lg"
              disabled={isRolling || totalInputValue <= 0 || !selectedTargetCard}
              onClick={handleExecuteUpgrade}
              className="w-full py-4 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              {isRolling ? 'Rolando Upgrade...' : 'Realizar Upgrade (Girar)'}
            </Button>
          </div>

        </div>

        {/* Right Column: Selected Target Box */}
        <div className="lg:col-span-4 glass-panel rounded-3xl p-6 border border-slate-800 bg-[#10141f] shadow-2xl flex flex-col justify-between min-h-[440px] relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
                Carta Alvo para Forjar
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">
                Valor: {targetCardValue.toLocaleString('pt-BR')} 🟡
              </span>
            </div>

            {selectedTargetCard ? (
              <div className="relative w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 flex flex-col items-center justify-center gap-2 group">
                <div className="relative w-36 h-48 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
                  <img
                    src={selectedTargetCard.image}
                    alt={selectedTargetCard.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={selectedTargetCard.rarity}>{selectedTargetCard.rarity}</Badge>
                  </div>
                </div>

                <div className="text-center mt-1">
                  <h4 className="text-sm font-black text-white truncate max-w-[220px]">
                    {selectedTargetCard.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {selectedTargetCard.setName || 'TCGDex'} • #{selectedTargetCard.localId}
                  </p>
                  <div className="text-base font-mono font-black text-amber-400 mt-1">
                    {targetCardValue.toLocaleString('pt-BR')} <span className="text-xs font-sans text-amber-500">moedas</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-56 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-4 text-slate-500">
                <span>Selecione uma carta na vitrine abaixo</span>
              </div>
            )}
          </div>

          {/* Multiplier Presets Strip */}
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Atalhos Rápidos de Multiplicador:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {MULTIPLIER_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  disabled={isRolling}
                  onClick={() => handleApplyPreset(preset)}
                  className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold glass-panel-subtle text-slate-300 hover:text-amber-400 border border-slate-800 hover:border-amber-400/50 transition-all shrink-0 cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Shelves (Inventory Browser & Target Catalog Browser) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Shelf: My Cards (Inventory) */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 bg-[#0d111a]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-display font-black text-white flex items-center gap-2">
                <span>Meu Inventário</span>
                <span className="text-xs font-mono font-bold text-amber-400">({availableInventoryItems.length} tipos)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Clique para adicionar cartas à mesa de sacrifício</p>
            </div>

            <div className="relative w-full sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar no álbum..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {availableInventoryItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Nenhuma carta disponível no inventário. Abra pacotes na Loja de Boosters!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
              {availableInventoryItems.map((item) => {
                const selectedCount = selectedSacrificeCards.find(s => s.card.id === item.card.id)?.count || 0;
                const isSelected = selectedCount > 0;

                return (
                  <div
                    key={item.card.id}
                    onClick={() => handleSelectSacrificeCard(item)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-md ring-1 ring-amber-400'
                        : 'glass-panel-subtle border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-950">
                      <img src={item.card.image} alt={item.card.name} className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono font-bold text-white border border-white/20">
                        x{item.count}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate">{item.card.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 font-bold">
                        +{item.card.sellValue || 35} moedas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Shelf: Target Cards Catalog */}
        <div className="lg:col-span-6 glass-panel rounded-3xl p-6 border border-slate-800 bg-[#0d111a]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-display font-black text-white flex items-center gap-2">
                <span>Catálogo de Alvos</span>
                <span className="text-xs font-mono font-bold text-slate-400">({availableTargetPool.length} cartas)</span>
              </h3>
              <p className="text-[11px] text-slate-400">Escolha a carta que você deseja forjar</p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar alvo..."
                  value={targetSearch}
                  onChange={(e) => setTargetSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl glass-panel-subtle text-xs text-white placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                onClick={() => setTargetSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-2.5 py-1.5 rounded-xl glass-panel-subtle text-xs font-bold text-slate-400 hover:text-white border border-slate-800 whitespace-nowrap cursor-pointer"
              >
                {targetSortOrder === 'asc' ? 'Menor $' : 'Maior $'}
              </button>
            </div>
          </div>

          {/* Rarity Filter Tabs */}
          <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {['Todas', 'Incomum', 'Rara', 'Ultra Rara'].map(r => (
              <button
                key={r}
                onClick={() => setTargetRarityFilter(r)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetRarityFilter === r
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'glass-panel-subtle text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {availableTargetPool.map((card) => {
              const isSelected = selectedTargetCard?.id === card.id;
              const cardPrice = (card.sellValue || 100) * 1.6;

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedTargetCard(card)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-400/10 border-amber-400 shadow-md ring-2 ring-amber-400'
                      : 'glass-panel-subtle border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative aspect-[2.5/3.5] rounded-xl overflow-hidden bg-slate-950">
                    <img src={card.image} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute top-1 right-1">
                      <Badge variant={card.rarity}>{card.rarity}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate">{card.name}</span>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {cardPrice.toLocaleString('pt-BR')} 🟡
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
