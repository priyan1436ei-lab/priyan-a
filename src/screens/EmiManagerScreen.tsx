import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Building,
  ArrowRight,
  TrendingDown,
  Clock
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { FinancialEngine } from '../lib/financialEngine';

export const EmiManagerScreen: React.FC<{
  onOpenAddEmi: () => void;
  onNavigateToCalculator: () => void;
}> = ({ onOpenAddEmi, onNavigateToCalculator }) => {
  const { emis, payEmi, deleteEmi } = useFinFam();
  const [successMsg, setSuccessMsg] = useState('');

  const totalMonthlyEmi = emis.reduce((acc, e) => acc + e.monthlyEmi, 0);
  const totalPrincipalRemaining = emis.reduce((acc, e) => acc + (e.totalAmount - e.paidAmount), 0);

  const handlePayEmi = (id: number, title: string, amount: number) => {
    payEmi(id, title, amount, 'UPI Auto-Debit');
    setSuccessMsg(`Paid installment for ${title} successfully!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            Active EMI & Loan Portfolio
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor active debt, tenure completion, and scheduled auto-debits
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToCalculator}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-cyan-500/20"
          >
            Open Calculator
          </button>
          <button
            onClick={onOpenAddEmi}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] text-xs font-bold shadow-md shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Add Loan
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {/* Aggregate Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-xs text-slate-400 font-medium">Total Monthly EMI Outflow</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {FinancialEngine.formatINR(totalMonthlyEmi)}
            <span className="text-xs text-slate-400 font-normal"> /mo</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Combined across {emis.length} active loan accounts
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-xs text-slate-400 font-medium">Remaining Principal Balance</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {FinancialEngine.formatINR(totalPrincipalRemaining)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Outstanding household debt</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0E1528] border border-white/10">
          <div className="text-xs text-slate-400 font-medium">Average Tenure Completion</div>
          <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {emis.length > 0
              ? (
                  (emis.reduce((acc, e) => acc + e.paidTenureMonths, 0) /
                    Math.max(emis.reduce((acc, e) => acc + e.totalTenureMonths, 0), 1)) *
                  100
                ).toFixed(0)
              : 0}
            %
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">On track with zero default record</div>
        </div>
      </div>

      {/* Active Loans List */}
      <div className="space-y-4">
        {emis.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#0E1528] border border-white/10 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">No active loans on record</p>
            <p className="text-xs text-slate-400">
              Your household is currently debt-free! Use the EMI calculator to simulate any future purchases.
            </p>
          </div>
        ) : (
          emis.map((emi) => {
            const pctPaid = Math.min(Math.round((emi.paidAmount / emi.totalAmount) * 100), 100);
            const remainingAmt = Math.max(emi.totalAmount - emi.paidAmount, 0);

            return (
              <div
                key={emi.id}
                className="p-5 rounded-2xl bg-[#0E1528] border border-white/10 space-y-4 hover:border-cyan-500/30 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{emi.title}</h3>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                        {emi.category}
                      </span>
                      {emi.interestRate === 0 && (
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          0% NO-COST
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-500" /> {emi.lenderBank}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-400">
                        <Calendar className="w-3 h-3" /> Due: {emi.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold font-mono text-white">
                        {FinancialEngine.formatINR(emi.monthlyEmi)}
                        <span className="text-xs text-slate-400 font-normal"> /mo</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {emi.interestRate}% p.a. • {emi.paidTenureMonths}/{emi.totalTenureMonths} Mos
                      </div>
                    </div>

                    <button
                      onClick={() => handlePayEmi(emi.id, emi.title, emi.monthlyEmi)}
                      disabled={emi.isPaidThisMonth}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        emi.isPaidThisMonth
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                          : 'bg-cyan-500 hover:bg-cyan-400 text-[#050816] shadow-md shadow-cyan-500/20'
                      }`}
                    >
                      {emi.isPaidThisMonth ? 'Paid This Month' : 'Pay Installment'}
                    </button>

                    <button
                      onClick={() => deleteEmi(emi.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                      title="Close Loan Account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Paid: {FinancialEngine.formatINR(emi.paidAmount)}</span>
                    <span className="text-slate-400">
                      Remaining: {FinancialEngine.formatINR(remainingAmt)} ({100 - pctPaid}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all"
                      style={{ width: `${pctPaid}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
