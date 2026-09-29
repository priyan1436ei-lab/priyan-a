import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Bike,
  Car,
  Laptop,
  Smartphone,
  Home,
  GraduationCap,
  Landmark,
  PiggyBank,
  CheckCircle,
  Table,
  Sparkles,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { useFinFam } from '../context/FinFamContext';
import { EmiCalculatorEngine } from '../lib/emiCalculatorEngine';
import { FinancialEngine } from '../lib/financialEngine';

export const EmiCalculatorScreen: React.FC<{ onNavigateToManager: () => void }> = ({
  onNavigateToManager
}) => {
  const { addEmi } = useFinFam();

  const [principal, setPrincipal] = useState(120000);
  const [annualRate, setAnnualRate] = useState(9.5);
  const [tenureMonths, setTenureMonths] = useState(24);
  const [extraPrepayment, setExtraPrepayment] = useState(1500);
  const [activePresetId, setActivePresetId] = useState('bike');
  const [amortizationView, setAmortizationView] = useState<'YEARLY' | 'MONTHLY'>('YEARLY');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const calculation = useMemo(() => {
    return EmiCalculatorEngine.calculateEmi(principal, annualRate, tenureMonths, extraPrepayment);
  }, [principal, annualRate, tenureMonths, extraPrepayment]);

  const applyPreset = (preset: any) => {
    setActivePresetId(preset.id);
    setPrincipal(preset.defaultAmount);
    setAnnualRate(preset.defaultAnnualRate);
    setTenureMonths(preset.defaultTenureMonths);
  };

  const handleSaveToActiveEmis = () => {
    const preset = EmiCalculatorEngine.LOAN_PRESETS.find((p) => p.id === activePresetId);
    const title = preset ? preset.title : `Custom Loan (₹${principal.toLocaleString('en-IN')})`;
    const category = preset ? preset.category : 'General';
    const lender = preset ? preset.defaultLender : 'Bank Loan';

    addEmi(
      title,
      category,
      principal,
      Math.round(calculation.monthlyEmi),
      annualRate,
      tenureMonths,
      lender,
      '05th of every month'
    );

    setSaveSuccessMsg('Loan successfully saved to your Active EMIs tracker!');
    setTimeout(() => setSaveSuccessMsg(''), 3500);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            Interactive Smart EMI Calculator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time monthly repayment calculation, amortization curves & prepayment savings
          </p>
        </div>

        <button
          onClick={onNavigateToManager}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-cyan-500/20 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          View Active EMIs <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {saveSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {saveSuccessMsg}
        </div>
      )}

      {/* Preset Buttons */}
      <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-4">
        <div className="text-xs font-bold text-slate-300 mb-2.5">Loan Category Presets</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {EmiCalculatorEngine.LOAN_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`p-2.5 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-900/80 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="text-xs font-bold truncate">{preset.title.split('/')[0]}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ₹{(preset.defaultAmount / 1000).toFixed(0)}k • {preset.defaultAnnualRate}%
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Live Outcome */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#0E1528] border border-white/10 p-5 space-y-6">
          {/* Principal Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Loan Principal Amount</span>
              <div className="text-base font-bold font-mono text-cyan-400">
                {FinancialEngine.formatINR(principal)}
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="5000000"
              step="5000"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹10,000</span>
              <span>₹25,00,000</span>
              <span>₹50,00,000</span>
            </div>
          </div>

          {/* Interest Rate Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Annual Interest Rate</span>
              <div className="text-base font-bold font-mono text-amber-400">{annualRate}% p.a.</div>
            </div>
            <input
              type="range"
              min="0"
              max="24"
              step="0.25"
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% (Zero Cost)</span>
              <span>12%</span>
              <span>24%</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Loan Tenure</span>
              <div className="text-base font-bold font-mono text-purple-400">
                {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Years)
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="240"
              step="1"
              value={tenureMonths}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full accent-purple-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>3 Months</span>
              <span>60 Months (5 Yrs)</span>
              <span>240 Months (20 Yrs)</span>
            </div>
          </div>

          {/* Optional Prepayment Slider */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <PiggyBank className="w-4 h-4 text-emerald-400" />
                Extra Monthly Prepayment
              </span>
              <div className="text-base font-bold font-mono text-emerald-400">
                +{FinancialEngine.formatINR(extraPrepayment)}/mo
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="25000"
              step="500"
              value={extraPrepayment}
              onChange={(e) => setExtraPrepayment(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹0</span>
              <span>₹10,000/mo</span>
              <span>₹25,000/mo</span>
            </div>
          </div>
        </div>

        {/* Calculation Result Card (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#101A33] to-[#080E20] border border-cyan-500/30 p-6 flex flex-col justify-between shadow-xl">
          <div>
            <span className="text-xs text-cyan-300 font-semibold uppercase tracking-wider">
              Calculated Monthly Payment
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1">
              {FinancialEngine.formatExactINR(calculation.monthlyEmi)}
              <span className="text-sm text-slate-400 font-normal"> /month</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400">Total Interest Payable:</span>
                <span className="font-mono font-bold text-amber-300">
                  {FinancialEngine.formatINR(calculation.totalInterest)}
                </span>
              </div>

              <div className="flex justify-between text-xs pb-2 border-b border-white/10">
                <span className="text-slate-400">Total Amount Payable:</span>
                <span className="font-mono font-bold text-white">
                  {FinancialEngine.formatINR(calculation.totalPayable)}
                </span>
              </div>
            </div>

            {/* Principal vs Interest Ratio Bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-cyan-400 font-bold">
                  Principal ({calculation.principalPercentageOfTotal.toFixed(0)}%)
                </span>
                <span className="text-amber-400 font-bold">
                  Interest ({calculation.interestPercentageOfTotal.toFixed(0)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{ width: `${calculation.principalPercentageOfTotal}%` }}
                />
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${calculation.interestPercentageOfTotal}%` }}
                />
              </div>
            </div>

            {/* Prepayment Advantage Snapshot */}
            {calculation.prepaymentScenario && extraPrepayment > 0 && (
              <div className="mt-6 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4" /> Prepayment Advantage
                </div>
                <div className="mt-1.5 text-slate-200 text-[11px] leading-relaxed">
                  Paying an extra <span className="font-bold font-mono text-emerald-400">₹{extraPrepayment.toLocaleString('en-IN')}/mo</span> saves{' '}
                  <span className="font-bold font-mono text-emerald-300">
                    {calculation.prepaymentScenario.monthsSaved} months
                  </span>{' '}
                  and cuts{' '}
                  <span className="font-bold font-mono text-emerald-300">
                    {FinancialEngine.formatINR(calculation.prepaymentScenario.totalInterestSaved)}
                  </span>{' '}
                  in interest!
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleSaveToActiveEmis}
            className="w-full mt-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#050816] font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all active:scale-98"
          >
            Save to Active EMIs
          </button>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="rounded-2xl bg-[#0E1528] border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Amortization Schedule</h3>
          </div>

          <div className="flex items-center bg-slate-900 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setAmortizationView('YEARLY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                amortizationView === 'YEARLY'
                  ? 'bg-cyan-500 text-[#050816]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly Summary
            </button>
            <button
              onClick={() => setAmortizationView('MONTHLY')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                amortizationView === 'MONTHLY'
                  ? 'bg-cyan-500 text-[#050816]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Breakdown
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold font-mono">
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Opening Balance</th>
                <th className="py-2.5 px-3">EMI Paid</th>
                <th className="py-2.5 px-3 text-cyan-400">Principal</th>
                <th className="py-2.5 px-3 text-amber-400">Interest</th>
                <th className="py-2.5 px-3">Closing Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-slate-200">
              {(amortizationView === 'YEARLY'
                ? calculation.yearlyAmortization
                : calculation.monthlyAmortization.slice(0, 36)
              ).map((row) => (
                <tr key={row.periodIndex} className="hover:bg-white/[0.02]">
                  <td className="py-2.5 px-3 font-semibold text-slate-100">{row.periodLabel}</td>
                  <td className="py-2.5 px-3">{FinancialEngine.formatINR(row.openingBalance)}</td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    {FinancialEngine.formatINR(row.emiPaid)}
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400">
                    {FinancialEngine.formatINR(row.principalPaid)}
                  </td>
                  <td className="py-2.5 px-3 text-amber-400">
                    {FinancialEngine.formatINR(row.interestPaid)}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">
                    {FinancialEngine.formatINR(row.closingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {amortizationView === 'MONTHLY' && calculation.monthlyAmortization.length > 36 && (
            <div className="py-2 text-center text-[11px] text-slate-500 border-t border-white/5">
              Showing first 36 months of {calculation.monthlyAmortization.length} total installments
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
