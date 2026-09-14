import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertOctagon, Skull, Clock, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { Button } from '../ui/Button';

export const LoanSharkModal = ({ onClose }) => {
  const { loanDebt, takeLoan, repayLoan, coins } = useGame();
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!loanDebt.active) return;

    const updateTimer = () => {
      const remainingMs = Math.max(0, loanDebt.deadline - Date.now());
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      setTimeLeftStr(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [loanDebt]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-8 border border-rose-500/40 shadow-2xl bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-950 relative overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-panel-subtle text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NPC Avatar & Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-rose-600 to-slate-900 p-0.5 shadow-lg flex items-center justify-center text-3xl">
            😼
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-display font-black text-white">
                Agiota Meowth (Submundo Rocket)
              </h3>
              <span className="hanko-seal text-[8px]">闇金</span>
            </div>
            <p className="text-xs text-rose-300 font-medium">
              "Ficou sem um tostão, né parceiro? Eu posso te emprestar... mas com juros!"
            </p>
          </div>
        </div>

        {/* Active Loan State vs New Loan Offer */}
        {loanDebt.active ? (
          <div className="flex flex-col gap-5">
            
            {/* Danger Countdown Card */}
            <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Clock className="w-4 h-4 animate-spin" />
                Tempo Restante para Devolver
              </div>
              <span className="text-4xl font-mono font-black text-rose-500 tracking-wider my-1 animate-pulse">
                {timeLeftStr || '00:00'}
              </span>
              <p className="text-[11px] text-rose-300/80">
                Se o tempo esgotar, os capangas do Meowth <strong>confiscarão suas cartas mais raras do álbum</strong> sem aviso prévio!
              </p>
            </div>

            {/* Debt Details */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-2xl glass-panel-subtle border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Emprestado</span>
                <span className="text-sm font-black font-mono text-white">{loanDebt.originalAmount} moedas</span>
              </div>
              <div className="p-3 rounded-2xl glass-panel-subtle border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Dívida Total a Pagar</span>
                <span className="text-sm font-black font-mono text-amber-400">{loanDebt.amount} moedas</span>
              </div>
            </div>

            {/* Repay Action */}
            <Button
              variant="primary"
              size="lg"
              icon={DollarSign}
              disabled={coins < loanDebt.amount}
              onClick={() => {
                repayLoan();
                onClose();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600"
            >
              {coins >= loanDebt.amount ? `Pagar Dívida (${loanDebt.amount} moedas)` : `Saldo Insuficiente (${coins}/${loanDebt.amount})`}
            </Button>

          </div>
        ) : (
          /* New Loan Offer */
          <div className="flex flex-col gap-5">
            <div className="p-4 rounded-2xl glass-panel-subtle border border-slate-800 text-xs text-slate-300 leading-relaxed">
              Pegue <strong className="text-amber-400 font-bold">+2.000 PokéMoedas</strong> na hora. Você terá <strong>3 minutos reais</strong> para devolver <strong>2.800 moedas</strong> (+40% juros).
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <span>
                <strong>Penhora Forçada:</strong> Ao assinar este contrato, você concorda que o não pagamento acarretará no confisco imediato de cartas Raras/Ultra Raras do seu álbum.
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={onClose}
                className="py-3 rounded-xl glass-panel-subtle text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Recusar Oferta
              </button>

              <Button
                variant="torii"
                size="md"
                onClick={() => takeLoan(2000, 3)}
                className="py-3 bg-gradient-to-r from-rose-600 to-amber-600 text-xs font-black uppercase"
              >
                Aceitar 2.000 Moedas
              </Button>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};
