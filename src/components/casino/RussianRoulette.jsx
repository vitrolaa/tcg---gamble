import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Sparkles, Flame, ShieldAlert, ArrowLeft, Coins, AlertTriangle, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import confetti from 'canvas-confetti';

const CHAMBER_COUNT = 6;
const COIN_BETS = [200, 500, 1000, 2500, 5000];

export const RussianRoulette = ({ onBack, onOpenLegendaryPack }) => {
  const {
    coins,
    inventory,
    burnCardFromInventory,
    addCoins,
    spendCoins,
    recordCasinoGame,
    addToast
  } = useGame();

  const [betType, setBetType] = useState('coins'); // 'coins' | 'card'
  const [selectedCoinBet, setSelectedCoinBet] = useState(500);
  const [selectedCardId, setSelectedCardId] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [cylinderAngle, setCylinderAngle] = useState(0);
  const [gameResult, setGameResult] = useState(null); // { won: boolean, chamber: number, burnedCard: string, reward: number }
  const [showResultModal, setShowResultModal] = useState(false);

  // Available cards for betting (Rares and Ultra Rares preferred, or all owned cards)
  const availableCards = Object.values(inventory).filter(item => item.count > 0);

  const handlePlayRoulette = () => {
    if (isSpinning) return;

    let cardToBurn = null;
    let betAmount = selectedCoinBet;

    if (betType === 'coins') {
      if (coins < selectedCoinBet) {
        addToast('Moedas Insuficientes', 'Você não tem moedas suficientes para esta aposta mortal!', 'error');
        return;
      }
      const deducted = spendCoins(selectedCoinBet);
      if (!deducted) return;
    } else {
      if (!selectedCardId || !inventory[selectedCardId]) {
        addToast('Selecione uma Carta', 'Você precisa escolher uma carta do seu inventário para arriscar!', 'warning');
        return;
      }
      cardToBurn = inventory[selectedCardId].card;
      betAmount = cardToBurn.sellValue * 2;
    }

    setIsSpinning(true);
    setGameResult(null);
    setShowResultModal(false);

    // Audio SFX
    soundService.playCylinderSpin();

    // Chamber 0, 1, 2, 3 = MORTAL (Death/Burn) (4/6 = 66.6% death)
    // Chamber 4, 5 = SURVIVAL / JACKPOT (2/6 = 33.3% win)
    const rolledChamber = Math.floor(Math.random() * CHAMBER_COUNT);
    const isWinner = rolledChamber >= 4; // 2 in 6 chance of survival

    // Spin angle: 4-6 full spins + offset for chamber
    const additionalSpins = 5 * 360;
    const targetAngle = cylinderAngle + additionalSpins + (rolledChamber * (360 / CHAMBER_COUNT));
    setCylinderAngle(targetAngle);

    setTimeout(() => {
      setIsSpinning(false);

      if (isWinner) {
        // --- SURVIVAL / JACKPOT ---
        const payout = betType === 'coins' ? selectedCoinBet * 2.5 : cardToBurn.sellValue * 4;
        addCoins(payout, 'SOBREVIVÊNCIA NA ROLETA RUSSA!');
        soundService.playJackpotWin();

        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ec4899', '#3b82f6', '#10b981']
        });

        recordCasinoGame({
          type: 'roulette',
          bet: betAmount,
          won: true,
          payout
        });

        setGameResult({
          won: true,
          chamber: rolledChamber + 1,
          reward: payout,
          packReward: betType === 'card' && cardToBurn.rarity === 'Ultra Rara'
        });
      } else {
        // --- DEATH / CARD BURN / COIN WIPEOUT ---
        soundService.playDryClick();
        setTimeout(() => soundService.playCardBurn(), 150);

        if (betType === 'card' && selectedCardId) {
          burnCardFromInventory(selectedCardId);
        }

        recordCasinoGame({
          type: 'roulette',
          bet: betAmount,
          won: false,
          payout: 0
        });

        setGameResult({
          won: false,
          chamber: rolledChamber + 1,
          burnedCard: cardToBurn ? cardToBurn.name : null,
          lostCoins: betType === 'coins' ? selectedCoinBet : 0
        });
      }

      setShowResultModal(true);
    }, 2400);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Salão de Jogos
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <Skull className="w-3.5 h-3.5 animate-pulse" />
          Risco Máximo & Queima de Cartas
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: 3D Cylinder & Visual Suspense */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center glass-panel rounded-3xl p-8 relative overflow-hidden border border-rose-500/20 shadow-2xl">
          
          {/* Ambient Danger Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-rose-950/30 via-transparent to-slate-950 pointer-events-none" />

          <h2 className="text-xl sm:text-2xl font-display font-black text-white text-center mb-1 flex items-center gap-2">
            <span>Tambor da Morte</span>
            <span className="hanko-seal text-[9px]">決死</span>
          </h2>
          <p className="text-xs text-slate-400 text-center mb-8">
            6 Câmaras: 4 Disparos Fatais (Queima) • 2 Câmaras de Glória (2.5x)
          </p>

          {/* 3D Animated Revolver Cylinder */}
          <div className="relative w-64 h-64 flex items-center justify-center my-4">
            
            {/* Outer Chamber Housing */}
            <div className="w-64 h-64 rounded-full border-4 border-slate-700 bg-slate-900 shadow-[0_0_50px_rgba(225,29,72,0.25)] flex items-center justify-center relative p-3">
              
              {/* Rotating Chamber Barrel */}
              <motion.div
                animate={{ rotate: cylinderAngle }}
                transition={{ duration: isSpinning ? 2.4 : 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="w-full h-full rounded-full border-2 border-slate-600 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 relative flex items-center justify-center"
              >
                {/* 6 Bullet Holes */}
                {Array.from({ length: CHAMBER_COUNT }).map((_, i) => {
                  const angle = (i * 360) / CHAMBER_COUNT;
                  const isSafeSlot = i >= 4;
                  return (
                    <div
                      key={i}
                      className="absolute w-12 h-12 rounded-full border-2 border-slate-700 bg-slate-950 flex items-center justify-center shadow-inner"
                      style={{
                        transform: `rotate(${angle}deg) translate(0, -78px) rotate(-${angle}deg)`
                      }}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black font-mono ${
                          isSafeSlot
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                        }`}
                      >
                        {isSafeSlot ? '★' : '💀'}
                      </div>
                    </div>
                  );
                })}

                {/* Central Pin */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-700 to-slate-500 border-2 border-slate-400 flex items-center justify-center shadow-lg">
                  <div className="w-4 h-4 rounded-full bg-slate-900" />
                </div>
              </motion.div>

              {/* Firing Pin Indicator (Top) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                <div className="w-3 h-5 bg-rose-600 rounded-b shadow-[0_0_12px_#e11d48]" />
              </div>
            </div>
          </div>

          {/* Probability Indicator */}
          <div className="w-full mt-6 grid grid-cols-2 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 block">Chance de Morte</span>
              <span className="text-lg font-black font-mono text-rose-500">66.6% (4/6)</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Chance de Glória</span>
              <span className="text-lg font-black font-mono text-amber-400">33.3% (2/6)</span>
            </div>
          </div>

        </div>

        {/* Right: Betting Controls & Card Sacrifice Selector */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl">
            <h3 className="text-lg font-display font-black text-white mb-4 flex items-center justify-between">
              <span>Selecione seu Sacrifício</span>
              <span className="text-xs font-mono text-amber-400">Saldo: {coins.toLocaleString('pt-BR')} moedas</span>
            </h3>

            {/* Bet Type Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-900/80 border border-slate-800 mb-6">
              <button
                onClick={() => setBetType('coins')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  betType === 'coins'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Apostar Moedas
              </button>

              <button
                onClick={() => setBetType('card')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  betType === 'card'
                    ? 'bg-rose-600 text-white font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                Arriscar Carta (Queima)
              </button>
            </div>

            {/* Coin Bet Selector */}
            {betType === 'coins' ? (
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-400">Escolha a quantia para apostar:</span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {COIN_BETS.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setSelectedCoinBet(amount)}
                      className={`py-2.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                        selectedCoinBet === amount
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                          : 'glass-panel-subtle text-slate-400 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Se sobreviver, recebe <strong className="text-amber-400">+{Math.round(selectedCoinBet * 2.5)} moedas</strong>. Se disparar, perde 100% da aposta.
                </p>
              </div>
            ) : (
              /* Card Sacrifice Selector */
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Atenção: A carta será DESTRUÍDA permanentemente se perder!
                  </span>
                </div>

                {availableCards.length === 0 ? (
                  <div className="p-6 rounded-2xl glass-panel-subtle text-center text-xs text-slate-400">
                    Você não possui nenhuma carta no inventário para apostar!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-56 overflow-y-auto pr-1">
                    {availableCards.map(item => {
                      const isSelected = selectedCardId === item.card.id;
                      return (
                        <div
                          key={item.card.id}
                          onClick={() => setSelectedCardId(item.card.id)}
                          className={`relative p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                            isSelected
                              ? 'bg-rose-500/20 border-rose-500 shadow-lg shadow-rose-950/40 ring-2 ring-rose-500'
                              : 'glass-panel-subtle border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <img
                            src={item.card.image}
                            alt={item.card.name}
                            className="w-16 h-22 object-cover rounded-lg border border-slate-700 shadow-sm"
                          />
                          <span className="text-[11px] font-bold text-white truncate max-w-full text-center">
                            {item.card.name}
                          </span>
                          <Badge variant={item.card.rarity}>
                            {item.card.rarity}
                          </Badge>
                          <span className="text-[9px] text-slate-400 font-mono">
                            Qtd: {item.count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Pull Trigger Action Button */}
            <div className="mt-8 pt-6 border-t border-slate-800">
              <Button
                variant="torii"
                size="lg"
                icon={Skull}
                disabled={isSpinning || (betType === 'card' && !selectedCardId)}
                onClick={handlePlayRoulette}
                className="w-full py-4 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 shadow-xl shadow-rose-950/40"
              >
                {isSpinning ? 'Girando Tambor...' : 'Puxar o Gatilho'}
              </Button>
            </div>

          </div>

        </div>

      </div>

      {/* Result Modal Overlay */}
      <AnimatePresence>
        {showResultModal && gameResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative border shadow-2xl ${
                gameResult.won
                  ? 'glass-panel border-amber-400/40 shadow-amber-500/20 bg-gradient-to-b from-amber-500/10 to-transparent'
                  : 'glass-panel border-rose-500/50 shadow-rose-600/30 bg-gradient-to-b from-rose-950/40 to-slate-950'
              }`}
            >
              <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-3xl shadow-lg">
                {gameResult.won ? '🏆' : '💀'}
              </div>

              <h3 className={`text-2xl font-display font-black mb-2 ${
                gameResult.won ? 'text-amber-400' : 'text-rose-500'
              }`}>
                {gameResult.won ? 'SOBREVIVÊNCIA GLORIOSA!' : 'DISPARO FATAL!'}
              </h3>

              <p className="text-xs text-slate-300 mb-6">
                {gameResult.won
                  ? `A câmara ${gameResult.chamber} estava livre! Você sobreviveu à roleta e multiplicou sua aposta!`
                  : `A câmara ${gameResult.chamber} disparou o tiro mortal!`
                }
              </p>

              {gameResult.won ? (
                <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono font-black text-xl mb-6">
                  +{gameResult.reward.toLocaleString('pt-BR')} PokéMoedas!
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs mb-6">
                  {gameResult.burnedCard
                    ? `A carta "${gameResult.burnedCard}" virou cinzas e foi removida do seu álbum permanentemente!`
                    : `Você perdeu -${gameResult.lostCoins} PokéMoedas!`
                  }
                </div>
              )}

              <Button
                variant={gameResult.won ? 'primary' : 'secondary'}
                size="md"
                onClick={() => setShowResultModal(false)}
                className="w-full"
              >
                Continuar
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
