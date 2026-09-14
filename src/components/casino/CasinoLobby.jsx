import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Sparkles, Flame, Trophy, Coins, Clock, ShieldAlert, Dice5, Zap, Layers, Lock, AlertTriangle, Rocket } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { RussianRoulette } from './RussianRoulette';
import { PokemonBlackjack } from './PokemonBlackjack';
import { PackDuel } from './PackDuel';
import { CrashGame } from './CrashGame';
import { JackpotVault } from './JackpotVault';
import { LoanSharkModal } from './LoanSharkModal';
import { Button } from '../ui/Button';

export const CasinoLobby = ({ onOpenStore }) => {
  const {
    coins,
    casinoStats,
    loanDebt,
    setShowLoanModal,
    showLoanModal
  } = useGame();

  const [activeGame, setActiveGame] = useState('lobby'); // 'lobby' | 'crash' | 'roulette' | 'blackjack' | 'pack_duel'

  if (activeGame === 'crash') {
    return <CrashGame onBack={() => setActiveGame('lobby')} />;
  }

  if (activeGame === 'roulette') {
    return <RussianRoulette onBack={() => setActiveGame('lobby')} />;
  }

  if (activeGame === 'blackjack') {
    return <PokemonBlackjack onBack={() => setActiveGame('lobby')} />;
  }

  if (activeGame === 'pack_duel') {
    return <PackDuel onBack={() => setActiveGame('lobby')} />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Casino Grand Entrance Banner */}
      <div className="relative rounded-3xl glass-panel p-6 sm:p-10 mb-8 border border-amber-500/30 bg-gradient-to-tr from-amber-950/40 via-slate-900 to-slate-950 shadow-2xl overflow-hidden">
        
        {/* Oriental Kanji Watermark */}
        <div className="absolute right-4 -bottom-10 text-9xl font-black text-amber-500/[0.04] select-none pointer-events-none font-japanese">
          遊技場
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <span className="font-japanese text-[10px]">賭場</span>
              <span>Salão Secreto de Celadon • Apostas de Alto Risco</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight">
              Cassino <span className="text-amber-400">Pokémon VIP</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Arrisque moedas e cartas do seu álbum em jogos de azar brutais. Decole no Crash Charizard, sobreviva à Roleta Russa com queima de cartas, derrote a banca no 21 ou dispute o Duelo dos Pacotes!
            </p>
          </div>

          {/* Loan Shark Banner CTA */}
          <div className="flex flex-col gap-2 w-full md:w-auto">
            {loanDebt.active ? (
              <div
                onClick={() => setShowLoanModal(true)}
                className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/50 cursor-pointer hover:bg-rose-500/30 transition-all flex items-center gap-3 shadow-lg animate-pulse"
              >
                <Clock className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="text-[10px] font-black uppercase text-rose-300 block">Dívida Ativa com o Agiota</span>
                  <span className="text-xs font-mono font-bold text-white">Devolver {loanDebt.amount} moedas</span>
                </div>
              </div>
            ) : (
              <Button
                variant="torii"
                size="md"
                onClick={() => setShowLoanModal(true)}
                className="bg-gradient-to-r from-rose-600 to-amber-600 shadow-lg text-xs uppercase font-black"
              >
                Empréstimo com Agiota Meowth
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Progressive Jackpot Vault Widget */}
      <div className="mb-8">
        <JackpotVault />
      </div>

      {/* Main Games Grid (4 Games: Crash, Roulette, Blackjack, Pack Duel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        
        {/* Game 1: Crash Charizard (NEW FEATURED) */}
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-orange-500/40 hover:border-orange-500/70 shadow-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-b from-orange-950/30 via-slate-950 to-slate-950"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-black uppercase tracking-wider">
                Multiplicador 100x
              </span>
              <span className="text-[10px] font-japanese text-slate-400 font-bold">上昇</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Rocket className="w-7 h-7 animate-bounce" />
            </div>

            <h3 className="text-xl font-display font-black text-white">Crash Charizard</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              O multiplicador sobe em tempo real! Aperte o Cash Out antes que o Charizard canse e exploda na tela. Ganância e adrenalina pura!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-orange-400">Até 100.00x</span>
            <Button
              variant="torii"
              size="sm"
              onClick={() => setActiveGame('crash')}
              className="bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black shadow-md"
            >
              Lançar Crash
            </Button>
          </div>
        </motion.div>

        {/* Game 2: Russian Roulette */}
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-rose-500/30 hover:border-rose-500/60 shadow-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-b from-rose-950/20 to-transparent"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider">
                Risco Extremo
              </span>
              <span className="text-[10px] font-japanese text-slate-400 font-bold">決死</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Skull className="w-7 h-7 animate-pulse" />
            </div>

            <h3 className="text-xl font-display font-black text-white">Roleta Russa</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Arrisque cartas do álbum ou moedas em 6 câmaras. 4 disparos destroem a carta permanentemente, 2 garantem vitória!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-rose-400">Multiplicador: 2.5x</span>
            <Button
              variant="torii"
              size="sm"
              onClick={() => setActiveGame('roulette')}
              className="bg-rose-600 hover:bg-rose-500 text-white"
            >
              Jogar Roleta
            </Button>
          </div>
        </motion.div>

        {/* Game 3: Pokémon Blackjack 21 */}
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-indigo-500/30 hover:border-indigo-500/60 shadow-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-b from-indigo-950/20 to-transparent"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase tracking-wider">
                Estratégia & 21
              </span>
              <span className="text-[10px] font-japanese text-slate-400 font-bold">勝負</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7 text-amber-400" />
            </div>

            <h3 className="text-xl font-display font-black text-white">Blackjack 21</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Desafie o Dealer Giovanni da Equipe Rocket. Cartas Pokémon valem poder numérico. Peça mais cartas, pare no 21 ou dobre sua aposta!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-indigo-300">Blackjack: 2.5x</span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveGame('blackjack')}
            >
              Jogar 21
            </Button>
          </div>
        </motion.div>

        {/* Game 4: Pack Duel */}
        <motion.div
          whileHover={{ y: -6 }}
          className="rounded-3xl glass-panel p-6 flex flex-col justify-between border border-amber-500/30 hover:border-amber-500/60 shadow-xl transition-all duration-300 relative overflow-hidden group bg-gradient-to-b from-amber-950/20 to-transparent"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase tracking-wider">
                2 Modos
              </span>
              <span className="text-[10px] font-japanese text-slate-400 font-bold">対決</span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg group-hover:scale-110 transition-transform">
              <Trophy className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-display font-black text-white">Duelo de Pacotes</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Dispute no Modo High Roller para a melhor raridade ou no Modo Azarão buscando 100% cartas lixo para levar 12x!
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-amber-400">Até 12.0x</span>
            <Button
              variant="torii"
              size="sm"
              onClick={() => setActiveGame('pack_duel')}
              className="bg-amber-500 text-slate-950 font-black"
            >
              Duelo
            </Button>
          </div>
        </motion.div>

      </div>

      {/* Casino Lifetime Stats Strip */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 shadow-lg">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <span>Estatísticas do Jogador no Cassino</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-2xl glass-panel-subtle border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Apostado</span>
            <span className="text-lg font-mono font-black text-white">{casinoStats.totalBetsPlaced.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-subtle border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Moedas Faturadas</span>
            <span className="text-lg font-mono font-black text-emerald-400">+{casinoStats.coinsWon.toLocaleString('pt-BR')}</span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-subtle border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-rose-400 block">Cartas Queimadas</span>
            <span className="text-lg font-mono font-black text-rose-500">{casinoStats.cardsBurned}</span>
          </div>

          <div className="p-3.5 rounded-2xl glass-panel-subtle border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 block">Vitórias em 21</span>
            <span className="text-lg font-mono font-black text-amber-300">{casinoStats.blackjackWins}</span>
          </div>
        </div>
      </div>

      {/* Loan Shark Modal */}
      {showLoanModal && (
        <LoanSharkModal onClose={() => setShowLoanModal(false)} />
      )}

    </div>
  );
};
