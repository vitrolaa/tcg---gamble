import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Coins, Zap, Shield, RotateCcw, Award } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

const CHIP_VALUES = [100, 250, 500, 1000, 2500];

export const PokemonBlackjack = ({ onBack }) => {
  const { coins, addCoins, spendCoins, recordCasinoGame, cardPool, addToast } = useGame();

  const [currentBet, setCurrentBet] = useState(250);
  const [gameState, setGameState] = useState('betting'); // 'betting' | 'playing' | 'dealer_turn' | 'game_over'
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOutcome, setGameOutcome] = useState(null); // 'win' | 'blackjack' | 'lose' | 'bust' | 'push'
  const [outcomeMessage, setOutcomeMessage] = useState('');

  // Helper to map card to blackjack numerical value
  const getCardValue = (card) => {
    if (!card) return 5;
    if (card.rarity === 'Ultra Rara' || card.name.includes('ex') || card.name.includes('Lendário')) {
      return 11; // Ace equivalent
    }
    if (card.rarity === 'Rara' || card.stage?.includes('Estágio 2') || card.category === 'Treinador') {
      return 10;
    }
    if (card.rarity === 'Incomum' || card.stage?.includes('Estágio 1')) {
      return 7;
    }
    // Comum: 2 - 6 based on localId modulo
    const num = parseInt(card.localId, 10) || 5;
    return (num % 5) + 2;
  };

  const calculateHandScore = (hand) => {
    let score = 0;
    let aces = 0;

    hand.forEach(card => {
      const val = getCardValue(card);
      if (val === 11) {
        aces += 1;
        score += 11;
      } else {
        score += val;
      }
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const drawCard = () => {
    if (!cardPool || cardPool.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * cardPool.length);
    return cardPool[randomIndex];
  };

  const handleStartGame = () => {
    if (coins < currentBet) {
      addToast('Moedas Insuficientes', 'Você não possui saldo para esta aposta!', 'error');
      return;
    }

    const deducted = spendCoins(currentBet);
    if (!deducted) return;

    soundService.playChipBet();

    // Draw initial hands
    const p1 = drawCard();
    const p2 = drawCard();
    const d1 = drawCard();
    const d2 = drawCard();

    setPlayerHand([p1, p2]);
    setDealerHand([d1, d2]);
    setGameOutcome(null);
    setOutcomeMessage('');
    setGameState('playing');

    soundService.playCardSlide();

    // Check for natural Blackjack
    const initialPlayerScore = calculateHandScore([p1, p2]);
    if (initialPlayerScore === 21) {
      handleEndGame('blackjack', [p1, p2], [d1, d2]);
    }
  };

  const handleHit = () => {
    if (gameState !== 'playing') return;

    soundService.playCardSlide();
    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      handleEndGame('bust', newHand, dealerHand);
    } else if (score === 21) {
      handleStand(newHand);
    }
  };

  const handleDoubleDown = () => {
    if (gameState !== 'playing' || playerHand.length !== 2) return;
    if (coins < currentBet) {
      addToast('Moedas Insuficientes', 'Você não pode dobrar sem saldo suficiente!', 'error');
      return;
    }

    spendCoins(currentBet);
    const doubledBet = currentBet * 2;
    setCurrentBet(doubledBet);
    soundService.playChipBet();

    const newCard = drawCard();
    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);

    const score = calculateHandScore(newHand);
    if (score > 21) {
      handleEndGame('bust', newHand, dealerHand, doubledBet);
    } else {
      handleStand(newHand, doubledBet);
    }
  };

  const handleStand = (currentPHand = playerHand, activeBet = currentBet) => {
    setGameState('dealer_turn');

    let currentDHand = [...dealerHand];
    let dScore = calculateHandScore(currentDHand);

    // Dealer draws on < 17
    const dealerInterval = setInterval(() => {
      dScore = calculateHandScore(currentDHand);
      if (dScore < 17) {
        soundService.playCardSlide();
        currentDHand = [...currentDHand, drawCard()];
        setDealerHand(currentDHand);
      } else {
        clearInterval(dealerInterval);
        resolveWinner(currentPHand, currentDHand, activeBet);
      }
    }, 600);
  };

  const resolveWinner = (pHand, dHand, activeBet) => {
    const pScore = calculateHandScore(pHand);
    const dScore = calculateHandScore(dHand);

    if (dScore > 21) {
      handleEndGame('win', pHand, dHand, activeBet, 'O Dealer estourou! Você venceu!');
    } else if (pScore > dScore) {
      handleEndGame('win', pHand, dHand, activeBet, `Você venceu com ${pScore} contra ${dScore} do Dealer!`);
    } else if (pScore < dScore) {
      handleEndGame('lose', pHand, dHand, activeBet, `A banca venceu com ${dScore} contra ${pScore}.`);
    } else {
      handleEndGame('push', pHand, dHand, activeBet, 'Empate! Aposta devolvida.');
    }
  };

  const handleEndGame = (outcome, pHand, dHand, activeBet = currentBet, customMsg = '') => {
    setGameState('game_over');
    setGameOutcome(outcome);

    if (outcome === 'blackjack') {
      const payout = Math.round(activeBet * 2.5);
      addCoins(payout, 'BLACKJACK NATURAL 21!');
      soundService.playBlackjackWin();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setOutcomeMessage('🎉 BLACKJACK NATURAL! Pagamento de 2.5x!');
      recordCasinoGame({ type: 'blackjack', bet: activeBet, won: true, payout });
    } else if (outcome === 'win') {
      const payout = activeBet * 2;
      addCoins(payout, 'Vitória no Blackjack 21!');
      soundService.playBlackjackWin();
      setOutcomeMessage(customMsg || `🎉 Vitória! Você faturou +${payout} moedas!`);
      recordCasinoGame({ type: 'blackjack', bet: activeBet, won: true, payout });
    } else if (outcome === 'push') {
      addCoins(activeBet, 'Empate no Blackjack');
      setOutcomeMessage('🤝 Empate com o Dealer! Suas moedas foram devolvidas.');
    } else if (outcome === 'bust') {
      soundService.playDryClick();
      setOutcomeMessage(`💥 Estourou (${calculateHandScore(pHand)} pontos)! A banca recolheu sua aposta.`);
      recordCasinoGame({ type: 'blackjack', bet: activeBet, won: false, payout: 0 });
    } else {
      soundService.playDryClick();
      setOutcomeMessage(customMsg || 'Derrota contra a banca.');
      recordCasinoGame({ type: 'blackjack', bet: activeBet, won: false, payout: 0 });
    }
  };

  const playerScore = calculateHandScore(playerHand);
  const dealerVisibleScore = gameState === 'playing'
    ? getCardValue(dealerHand[0])
    : calculateHandScore(dealerHand);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Cassino
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          Blackjack 21 Pokémon
        </div>
      </div>

      {/* Main Blackjack Felt Table */}
      <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-emerald-500/20 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950 shadow-2xl relative overflow-hidden">
        
        {/* Table Watermark & Logo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 select-none font-japanese text-9xl text-emerald-300">
          勝負
        </div>

        {/* Dealer Area (Top) */}
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Mão do Dealer (Giovanni - Equipe Rocket)
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-mono font-bold text-amber-400">
              {dealerHand.length > 0 ? (gameState === 'playing' ? `${dealerVisibleScore} + ?` : dealerVisibleScore) : '0'}
            </span>
          </div>

          <div className="flex items-center gap-3 min-h-[140px]">
            {dealerHand.map((card, idx) => {
              const isHoleCard = idx === 1 && gameState === 'playing';
              return (
                <motion.div
                  key={idx}
                  initial={{ y: -40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.15 }}
                  className={`w-24 sm:w-28 h-36 sm:h-40 rounded-2xl border-2 flex flex-col items-center justify-between p-2 shadow-xl ${
                    isHoleCard
                      ? 'bg-gradient-to-tr from-indigo-900 to-slate-900 border-indigo-500/50'
                      : 'bg-slate-900 border-slate-700'
                  }`}
                >
                  {isHoleCard ? (
                    <div className="w-full h-full rounded-xl border border-dashed border-indigo-400/40 flex flex-col items-center justify-center gap-2">
                      <Shield className="w-6 h-6 text-indigo-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-indigo-300 font-japanese">伏せ札</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-400">
                        <span className="truncate max-w-[70px]">{card.name}</span>
                        <span className="font-mono text-amber-400 font-bold">+{getCardValue(card)}</span>
                      </div>
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-16 h-22 object-cover rounded-lg shadow-sm"
                      />
                      <span className="text-[9px] text-slate-500 font-mono">#{card.localId}</span>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Center Felt Divider with Outcome Banner */}
        <div className="relative my-6 py-3 border-y border-emerald-500/20 flex items-center justify-center">
          <AnimatePresence>
            {outcomeMessage && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black tracking-wide border shadow-lg ${
                  gameOutcome === 'win' || gameOutcome === 'blackjack'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : gameOutcome === 'push'
                    ? 'bg-slate-800 text-slate-300 border-slate-700'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                }`}
              >
                {outcomeMessage}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Player Area (Bottom) */}
        <div className="flex flex-col items-center justify-center mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Sua Mão
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-xs font-mono font-bold ${
              playerScore === 21
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse'
                : playerScore > 21
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : 'bg-slate-800 border-slate-700 text-emerald-400'
            }`}>
              {playerScore} Pontos
            </span>
          </div>

          <div className="flex items-center gap-3 min-h-[140px]">
            {playerHand.map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.15 }}
                className="w-24 sm:w-28 h-36 sm:h-40 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-between p-2 shadow-xl"
              >
                <div className="w-full flex items-center justify-between text-[10px] font-bold text-slate-300">
                  <span className="truncate max-w-[70px]">{card.name}</span>
                  <span className="font-mono text-amber-400 font-bold">+{getCardValue(card)}</span>
                </div>
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-16 h-22 object-cover rounded-lg shadow-sm"
                />
                <span className="text-[9px] text-slate-500 font-mono">#{card.localId}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Controls & Chips Table */}
        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Chip Value Selector */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Valor da Aposta: <strong className="text-amber-400 font-mono">{currentBet} moedas</strong>
            </span>
            <div className="flex items-center gap-2">
              {CHIP_VALUES.map(val => (
                <button
                  key={val}
                  disabled={gameState === 'playing' || gameState === 'dealer_turn'}
                  onClick={() => setCurrentBet(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                    currentBet === val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                      : 'glass-panel-subtle text-slate-400 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {gameState === 'betting' || gameState === 'game_over' ? (
              <Button
                variant="torii"
                size="lg"
                icon={Sparkles}
                onClick={handleStartGame}
                className="w-full sm:w-auto px-8"
              >
                {gameState === 'game_over' ? 'Jogar Novamente' : 'Dar as Cartas'}
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleHit}
                  disabled={gameState !== 'playing'}
                  className="flex-1 sm:flex-none"
                >
                  Pedir Carta (Hit)
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => handleStand()}
                  disabled={gameState !== 'playing'}
                  className="flex-1 sm:flex-none"
                >
                  Parar (Stand)
                </Button>

                {playerHand.length === 2 && (
                  <Button
                    variant="glass"
                    size="md"
                    onClick={handleDoubleDown}
                    disabled={gameState !== 'playing' || coins < currentBet}
                    className="flex-1 sm:flex-none"
                  >
                    Dobrar (2x)
                  </Button>
                )}
              </>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
