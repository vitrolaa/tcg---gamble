import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Rocket, Flame, TrendingUp, Sparkles, AlertTriangle, ShieldCheck, Zap, RotateCcw, Award, CheckCircle2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';
import confetti from 'canvas-confetti';

const PRESET_BETS = [100, 250, 500, 1000, 2500, 5000];

export const CrashGame = ({ onBack }) => {
  const {
    coins,
    addCoins,
    spendCoins,
    recordCasinoGame,
    addToast
  } = useGame();

  const [betAmount, setBetAmount] = useState(250);
  const [autoCashoutValue, setAutoCashoutValue] = useState(2.0);
  const [useAutoCashout, setUseAutoCashout] = useState(false);
  const [gameState, setGameState] = useState('idle'); // 'idle' | 'flying' | 'crashed' | 'cashed_out'
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState(0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState(0);
  const [crashHistory, setCrashHistory] = useState([2.45, 1.12, 14.80, 1.85, 4.30, 1.05, 7.20]);
  const [psychologicalMessage, setPsychologicalMessage] = useState('');

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(0);
  const lastSoundTickRef = useRef(1);

  // Generate house-edge provably realistic crash multiplier
  const generateCrashMultiplier = () => {
    const r = Math.random();
    // 10% chance of instant death (< 1.20x)
    if (r < 0.10) {
      return Number((1.00 + Math.random() * 0.19).toFixed(2));
    }
    // Standard 96% RTP distribution curve
    const raw = 0.96 / (1 - r);
    return Math.min(100.0, Math.max(1.01, Number(raw.toFixed(2))));
  };

  const handleStartFlight = () => {
    if (gameState === 'flying') return;

    if (coins < betAmount || betAmount <= 0) {
      addToast('Moedas Insuficientes', 'Você precisa de saldo suficiente para iniciar o lançamento!', 'error');
      return;
    }

    const deducted = spendCoins(betAmount);
    if (!deducted) return;

    const targetCrash = generateCrashMultiplier();
    setCrashPoint(targetCrash);
    setGameState('flying');
    setCurrentMultiplier(1.0);
    setCashoutMultiplier(0);
    setPsychologicalMessage('');

    startTimeRef.current = performance.now();
    lastSoundTickRef.current = 1;

    // Flight Loop
    const runFlight = (now) => {
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      
      // Exponential multiplier growth: M(t) = 1.00 + 0.08 * t^1.8
      const calculatedMultiplier = Number((1.00 + Math.pow(elapsedSeconds * 0.85, 1.7)).toFixed(2));

      // Audio tick every 0.5x
      if (calculatedMultiplier - lastSoundTickRef.current >= 0.3) {
        soundService.playCrashFlight(260 + calculatedMultiplier * 15);
        lastSoundTickRef.current = calculatedMultiplier;
      }

      // Check for Auto Cashout
      if (useAutoCashout && autoCashoutValue > 1.0 && calculatedMultiplier >= autoCashoutValue && gameState !== 'cashed_out') {
        handleCashOut(autoCashoutValue);
      }

      if (calculatedMultiplier >= targetCrash) {
        // --- CRASH OCCURRED ---
        triggerCrash(targetCrash);
      } else {
        setCurrentMultiplier(calculatedMultiplier);
        animFrameRef.current = requestAnimationFrame(runFlight);
      }
    };

    animFrameRef.current = requestAnimationFrame(runFlight);
  };

  const handleCashOut = (forcedMultiplier = null) => {
    if (gameState !== 'flying') return;

    const finalMultiplier = forcedMultiplier || currentMultiplier;
    setCashoutMultiplier(finalMultiplier);
    setGameState('cashed_out');

    const payout = Math.round(betAmount * finalMultiplier);
    addCoins(payout, `CASH OUT NO CRASH (${finalMultiplier}x)!`);
    soundService.playCashOut();

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899']
    });

    recordCasinoGame({
      type: 'crash',
      bet: betAmount,
      won: true,
      payout
    });
  };

  const triggerCrash = (finalCrash) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setCurrentMultiplier(finalCrash);
    setGameState('crashed');
    soundService.playCrashExplosion();

    // Update history
    setCrashHistory(prev => [finalCrash, ...prev.slice(0, 7)]);

    // Record loss if player didn't cash out
    if (cashoutMultiplier === 0) {
      recordCasinoGame({
        type: 'crash',
        bet: betAmount,
        won: false,
        payout: 0
      });

      // Psychological Near-Miss Framing
      if (finalCrash < 1.30) {
        setPsychologicalMessage('💥 Quebrou na largada! O próximo tem probabilidade de voar mais alto!');
      } else if (finalCrash < 2.00) {
        setPsychologicalMessage('🔥 Foi por quase nada! O Charizard cansou em ' + finalCrash + 'x!');
      } else if (finalCrash >= 10.0) {
        setPsychologicalMessage('🚀 LUA! Esse voou até ' + finalCrash + 'x! Você teria ficado milionário!');
      } else {
        setPsychologicalMessage('⚠️ O foguete estourou em ' + finalCrash + 'x! Tente resgatar mais cedo da próxima vez.');
      }
    } else {
      setPsychologicalMessage(`🏆 Você resgatou com sucesso no ${cashoutMultiplier}x antes do crash em ${finalCrash}x!`);
    }
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Multiplier Visual Dynamic Colors & Intensity
  const getMultiplierColor = (mult) => {
    if (gameState === 'crashed') return 'text-rose-500';
    if (gameState === 'cashed_out') return 'text-emerald-400';
    if (mult >= 10.0) return 'text-fuchsia-400 animate-pulse';
    if (mult >= 5.0) return 'text-amber-400';
    if (mult >= 2.0) return 'text-cyan-400';
    return 'text-emerald-400';
  };

  // Trajectory percentage for the visual Charizard curve
  const progressRatio = Math.min(1, (currentMultiplier - 1.0) / 10.0);
  const charizardX = Math.min(85, 10 + progressRatio * 75);
  const charizardY = Math.max(15, 80 - Math.pow(progressRatio, 0.7) * 65);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Cassino
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold uppercase tracking-wider">
          <Rocket className="w-3.5 h-3.5 animate-bounce" />
          Crash Charizard • Foguete da Sorte
        </div>
      </div>

      {/* History Pill Bar (Confirmation Bias Strip) */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 max-w-full scrollbar-none">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider shrink-0 mr-1 font-display">
          Últimos Voos:
        </span>
        {crashHistory.map((h, i) => (
          <span
            key={i}
            className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border shrink-0 transition-all ${
              h >= 10.0
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/50 shadow-md shadow-fuchsia-500/20'
                : h >= 2.0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {h.toFixed(2)}x
          </span>
        ))}
      </div>

      {/* Main Crash Arena & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Top: The Visual Flight Radar Screen */}
        <div className="lg:col-span-8 glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden shadow-2xl min-h-[380px] sm:min-h-[440px] flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
          
          {/* Background Grid Lines & Cosmic Stars */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Top Info Bar */}
          <div className="relative z-10 flex items-center justify-between text-xs font-mono font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${gameState === 'flying' ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              {gameState === 'flying' ? 'VOO EM PROGRESSO' : gameState === 'crashed' ? 'CRASHOU' : 'AGUARDANDO LANÇAMENTO'}
            </span>
            <span>SALDO: <strong className="text-amber-400">{coins.toLocaleString('pt-BR')} moedas</strong></span>
          </div>

          {/* Center Multiplier HUD */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
            <motion.div
              key={currentMultiplier}
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className={`text-6xl sm:text-8xl font-mono font-black tracking-tight ${getMultiplierColor(currentMultiplier)}`}
            >
              {currentMultiplier.toFixed(2)}x
            </motion.div>

            {/* In-Flight Live Profit Preview */}
            {gameState === 'flying' && (
              <p className="text-xs sm:text-sm font-bold font-mono text-emerald-400 mt-2 animate-pulse">
                Lucro Atual: +{Math.round(betAmount * currentMultiplier).toLocaleString('pt-BR')} moedas
              </p>
            )}

            {/* Crash Explosion Banner */}
            {gameState === 'crashed' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs sm:text-sm font-black uppercase tracking-wider"
              >
                CRASHOU EM {currentMultiplier.toFixed(2)}x!
              </motion.div>
            )}

            {/* Cashed Out Success Banner */}
            {gameState === 'cashed_out' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-3 px-5 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-black uppercase tracking-wider"
              >
                🎉 RESGATADO NO {cashoutMultiplier.toFixed(2)}x (+{Math.round(betAmount * cashoutMultiplier).toLocaleString('pt-BR')} MOEDAS)!
              </motion.div>
            )}
          </div>

          {/* Flight Canvas Visual Trail & Flying Charizard */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {gameState === 'flying' && (
              <motion.div
                className="absolute text-5xl sm:text-6xl filter drop-shadow-[0_0_20px_#f97316] transition-all duration-100 ease-out"
                style={{
                  left: `${charizardX}%`,
                  top: `${charizardY}%`,
                  transform: 'translate(-50%, -50%) rotate(-15deg)'
                }}
              >
                🔥🐲
              </motion.div>
            )}

            {gameState === 'crashed' && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.4, 1.2], opacity: 1 }}
                className="absolute text-7xl filter drop-shadow-[0_0_30px_#e11d48]"
                style={{
                  left: `${charizardX}%`,
                  top: `${charizardY}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                💥
              </motion.div>
            )}
          </div>

          {/* Psychological Tease / Near-Miss Bottom Banner */}
          {psychologicalMessage && (
            <div className="relative z-10 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center text-xs font-bold text-slate-300 mt-2">
              {psychologicalMessage}
            </div>
          )}

        </div>

        {/* Right / Bottom: Betting & Cashout Panel */}
        <div className="lg:col-span-4 flex flex-col gap-5 glass-panel rounded-3xl p-6 border border-white/10 shadow-xl">
          
          <h3 className="text-base font-display font-black text-white flex items-center justify-between">
            <span>Painel de Apostas</span>
            <span className="text-xs font-mono text-amber-400 font-bold">{coins} moedas</span>
          </h3>

          {/* Bet Input & Presets */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-400">Quantia da Aposta:</label>
            <div className="relative">
              <input
                type="number"
                disabled={gameState === 'flying'}
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-2xl glass-panel-subtle text-white font-mono font-black text-base border border-slate-700 focus:outline-none focus:border-amber-400 transition-all"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                moedas
              </span>
            </div>

            {/* Quick Math Buttons (Metade / Dobro / Max) */}
            <div className="grid grid-cols-3 gap-2 mt-1">
              <button
                disabled={gameState === 'flying'}
                onClick={() => setBetAmount(Math.max(10, Math.floor(betAmount / 2)))}
                className="py-1.5 rounded-xl glass-panel-subtle text-xs font-mono font-bold text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                ½ Metade
              </button>
              <button
                disabled={gameState === 'flying'}
                onClick={() => setBetAmount(Math.min(coins, betAmount * 2))}
                className="py-1.5 rounded-xl glass-panel-subtle text-xs font-mono font-bold text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
              >
                2x Dobro
              </button>
              <button
                disabled={gameState === 'flying'}
                onClick={() => setBetAmount(coins)}
                className="py-1.5 rounded-xl bg-amber-500/20 text-xs font-mono font-black text-amber-300 border border-amber-500/40 cursor-pointer"
              >
                Máximo
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              {PRESET_BETS.map(val => (
                <button
                  key={val}
                  disabled={gameState === 'flying'}
                  onClick={() => setBetAmount(val)}
                  className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                    betAmount === val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'glass-panel-subtle text-slate-400 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Feature */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={gameState === 'flying'}
                  checked={useAutoCashout}
                  onChange={(e) => setUseAutoCashout(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span>Auto Resgate (Cashout Automático)</span>
              </label>
            </div>

            {useAutoCashout && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  min="1.1"
                  max="100.0"
                  disabled={gameState === 'flying'}
                  value={autoCashoutValue}
                  onChange={(e) => setAutoCashoutValue(Math.max(1.1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl glass-panel-subtle text-white font-mono font-bold text-xs border border-slate-700"
                />
                <span className="text-xs font-bold text-slate-400">x</span>
              </div>
            )}
          </div>

          {/* Main Flight & Cashout Action Button */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            {gameState === 'flying' ? (
              <Button
                variant="torii"
                size="lg"
                icon={Sparkles}
                onClick={() => handleCashOut()}
                className="w-full py-4 text-base font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-slate-950 shadow-2xl shadow-emerald-950/60 animate-pulse cursor-pointer"
              >
                Resgatar (+{Math.round(betAmount * currentMultiplier)} moedas)
              </Button>
            ) : (
              <Button
                variant="torii"
                size="lg"
                icon={Rocket}
                disabled={coins < betAmount}
                onClick={handleStartFlight}
                className="w-full py-4 text-sm font-black uppercase tracking-wider bg-gradient-to-r from-orange-500 via-rose-600 to-amber-500 shadow-xl shadow-orange-950/40 cursor-pointer"
              >
                {coins < betAmount ? 'Saldo Insuficiente' : 'Lançar Voo de Fogo'}
              </Button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
