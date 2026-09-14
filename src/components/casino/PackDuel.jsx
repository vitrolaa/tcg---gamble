import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Trash2, Crown, Trophy, AlertCircle, Coins, Flame, Shuffle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { soundService } from '../../services/soundService';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import confetti from 'canvas-confetti';

export const PackDuel = ({ onBack }) => {
  const { coins, addCoins, spendCoins, recordCasinoGame, cardPool, addToast } = useGame();

  const [mode, setMode] = useState('high_roller'); // 'high_roller' | 'trash_tier'
  const [betAmount, setBetAmount] = useState(1000);
  const [isDueling, setIsDueling] = useState(false);
  const [playerCards, setPlayerCards] = useState([]);
  const [houseCards, setHouseCards] = useState([]);
  const [duelResult, setDuelResult] = useState(null); // { won: boolean, playerRarityScore: number, houseRarityScore: number, isPureTrash: boolean, payout: number }

  const getRarityScore = (card) => {
    if (!card) return 0;
    if (card.rarity === 'Ultra Rara') return 10;
    if (card.rarity === 'Rara') return 5;
    if (card.rarity === 'Incomum') return 2;
    return 1;
  };

  const draw5Cards = () => {
    if (!cardPool || cardPool.length === 0) return [];
    const drawn = [];
    for (let i = 0; i < 5; i++) {
      const idx = Math.floor(Math.random() * cardPool.length);
      drawn.push(cardPool[idx]);
    }
    return drawn;
  };

  const handleStartDuel = () => {
    if (isDueling) return;

    if (coins < betAmount) {
      addToast('Moedas Insuficientes', 'Você precisa de saldo para entrar no duelo!', 'error');
      return;
    }

    const deducted = spendCoins(betAmount);
    if (!deducted) return;

    setIsDueling(true);
    setDuelResult(null);
    setPlayerCards([]);
    setHouseCards([]);

    soundService.playPackShake();
    setTimeout(() => soundService.playPackRip(), 400);

    setTimeout(() => {
      const pCards = draw5Cards();
      const hCards = draw5Cards();

      setPlayerCards(pCards);
      setHouseCards(hCards);

      const pScore = pCards.reduce((acc, c) => acc + getRarityScore(c), 0);
      const hScore = hCards.reduce((acc, c) => acc + getRarityScore(c), 0);

      setIsDueling(false);

      if (mode === 'high_roller') {
        // High Roller Mode: highest rarity score wins
        if (pScore > hScore) {
          const payout = Math.round(betAmount * 3.5);
          addCoins(payout, 'VITÓRIA NO DUELO HIGH ROLLER!');
          soundService.playJackpotWin();
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
          recordCasinoGame({ type: 'pack_duel', bet: betAmount, won: true, payout });
          setDuelResult({ won: true, pScore, hScore, payout, message: `Vitória Esmagadora! ${pScore} pts vs ${hScore} pts da Banca!` });
        } else {
          soundService.playDryClick();
          recordCasinoGame({ type: 'pack_duel', bet: betAmount, won: false, payout: 0 });
          setDuelResult({ won: false, pScore, hScore, payout: 0, message: `Derrota! A banca tirou ${hScore} pts contra seus ${pScore} pts.` });
        }
      } else {
        // Trash Tier / Azarão Mode:
        // Must draw 100% Commons (every single card must have rarity === 'Comum')
        const allCommons = pCards.every(c => c.rarity === 'Comum');
        if (allCommons) {
          const payout = Math.round(betAmount * 12); // Absurd 12x jackpot!
          addCoins(payout, 'JACKPOT DO AZARÃO (100% LIXO)!');
          soundService.playVaultBurst();
          confetti({ particleCount: 160, spread: 100, origin: { y: 0.5 } });
          recordCasinoGame({ type: 'trash_duel', bet: betAmount, won: true, payout });
          setDuelResult({
            won: true,
            isPureTrash: true,
            pScore,
            hScore,
            payout,
            message: '🗑️ JACKPOT DO AZARÃO! Você tirou 5 cartas 100% lixo comum e a banca pagou 12x!'
          });
        } else {
          soundService.playDryClick();
          const unluckRares = pCards.filter(c => c.rarity !== 'Comum').map(c => c.name);
          recordCasinoGame({ type: 'trash_duel', bet: betAmount, won: false, payout: 0 });
          setDuelResult({
            won: false,
            isPureTrash: false,
            pScore,
            hScore,
            payout: 0,
            message: `Falhou! Vieram cartas boas indesejadas (${unluckRares.join(', ')}). Para vencer o Azarão é necessário 5 comuns puras!`
          });
        }
      }
    }, 1800);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Salão de Jogos
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Duelo de Pacotes
        </div>
      </div>

      {/* Mode Selector Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        
        {/* Mode 1: High Roller */}
        <div
          onClick={() => { setMode('high_roller'); setDuelResult(null); }}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            mode === 'high_roller'
              ? 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border-amber-400 shadow-xl shadow-amber-950/40'
              : 'glass-panel border-slate-800 opacity-60 hover:opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                Multiplicador 3.5x
              </span>
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-display font-black text-white">Modo High Roller</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Duelo de alta nobreza: quem abrir o pacote com o maior score de raridade vence e triplica o prêmio!
            </p>
          </div>
          <div className="mt-4 text-[11px] font-mono text-amber-400 font-bold">
            Ultra Raras: 10pts • Raras: 5pts • Incomuns: 2pts
          </div>
        </div>

        {/* Mode 2: Azarão / Trash Tier */}
        <div
          onClick={() => { setMode('trash_tier'); setDuelResult(null); }}
          className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
            mode === 'trash_tier'
              ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-400 shadow-xl shadow-purple-950/40'
              : 'glass-panel border-slate-800 opacity-60 hover:opacity-90'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase">
                Jackpot 12.0x Consolação
              </span>
              <Trash2 className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-display font-black text-white">Modo Azarão (Trash Tier)</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              O desafio sádico do cassino: o objetivo é tirar o <strong>pior pacote possível</strong> (5 comuns inúteis). Se conseguir, leva 12x a aposta!
            </p>
          </div>
          <div className="mt-4 text-[11px] font-mono text-purple-300 font-bold">
            Condição: 5/5 cartas COMUNS (zero raras ou incomuns permitidas).
          </div>
        </div>

      </div>

      {/* Duel Arena */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl mb-8">
        
        {/* Bet Selection */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">Valor da Aposta:</span>
            <div className="flex items-center gap-2">
              {[500, 1000, 2500, 5000].map(val => (
                <button
                  key={val}
                  disabled={isDueling}
                  onClick={() => setBetAmount(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black border transition-all cursor-pointer ${
                    betAmount === val
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                      : 'glass-panel-subtle text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="torii"
            size="md"
            icon={Sparkles}
            disabled={isDueling || coins < betAmount}
            onClick={handleStartDuel}
            className="w-full sm:w-auto px-8 py-3"
          >
            {isDueling ? 'Abrindo Pacotes...' : 'Rasgar Pacotes & Duelar'}
          </Button>
        </div>

        {/* Duel Results Display */}
        {isDueling ? (
          <div className="py-16 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <p className="text-sm font-display font-bold text-white animate-pulse">
              Rasgando pacotes e comparando raridades...
            </p>
          </div>
        ) : playerCards.length > 0 ? (
          <div className="mt-6 flex flex-col gap-8">
            
            {/* Outcome Banner */}
            {duelResult && (
              <div className={`p-4 rounded-2xl text-center text-sm font-black border ${
                duelResult.won
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              }`}>
                {duelResult.message}
              </div>
            )}

            {/* Player's Pack */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                  Seu Pacote ({mode === 'high_roller' ? `${duelResult?.pScore} Pontos` : '5 Cartas'})
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {playerCards.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-panel-subtle rounded-2xl p-2.5 flex flex-col items-center gap-1.5 border border-slate-700"
                  >
                    <img src={card.image} alt={card.name} className="w-20 h-28 object-cover rounded-lg shadow-sm" />
                    <span className="text-[11px] font-bold text-white truncate max-w-full">{card.name}</span>
                    <Badge variant={card.rarity}>{card.rarity}</Badge>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* House's Pack (Only in High Roller) */}
            {mode === 'high_roller' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Pacote da Banca ({duelResult?.hScore} Pontos)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {houseCards.map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-panel-subtle rounded-2xl p-2.5 flex flex-col items-center gap-1.5 border border-slate-800 opacity-80"
                    >
                      <img src={card.image} alt={card.name} className="w-20 h-28 object-cover rounded-lg shadow-sm" />
                      <span className="text-[11px] font-bold text-slate-300 truncate max-w-full">{card.name}</span>
                      <Badge variant={card.rarity}>{card.rarity}</Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            Escolha o modo, defina o valor da sua aposta e clique em "Rasgar Pacotes & Duelar"!
          </div>
        )}

      </div>

    </div>
  );
};
