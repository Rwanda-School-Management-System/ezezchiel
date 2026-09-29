import React, { useState } from 'react';
import { InvestmentTier } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import { Settings, Save, CheckCircle2, TrendingUp, Sparkles, Percent } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminProfitSettings: React.FC = () => {
  const tiers = store.getTiers();
  const [profitValues, setProfitValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    tiers.forEach((t) => {
      map[t.id] = t.dailyProfit;
    });
    return map;
  });
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleProfitChange = (tierId: string, val: number) => {
    setProfitValues((prev) => ({
      ...prev,
      [tierId]: val
    }));
  };

  const handleSaveTier = (tier: InvestmentTier) => {
    const newProfit = profitValues[tier.id];
    if (!newProfit || newProfit < 0) return;

    store.updateTierDailyProfit(tier.id, newProfit);
    setSaveSuccess(`Daily profit for ${tier.tierAmount.toLocaleString()} RWF tier updated to +${newProfit.toLocaleString()} RWF/day!`);
    confetti({ particleCount: 30, spread: 50 });
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-emerald-400" />
            <span>Daily Profit Configuration (Admin Profit Settings Panel)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            The administrator can adjust the daily profit return amount for all 7 product packages at any time.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* 7 Tiers Table / Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier, idx) => {
          const currentVal = profitValues[tier.id] ?? tier.dailyProfit;
          const monthlyReturn = currentVal * 30;
          const percentReturn = Math.round((monthlyReturn / tier.tierAmount) * 100);

          return (
            <div
              key={tier.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Tier {idx + 1} Package
                </span>
                <span className="font-mono font-black text-sm text-slate-100">
                  {tier.tierAmount.toLocaleString()} RWF
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-400 font-medium">Daily Profit (RWF/day):</label>
                  <input
                    type="number"
                    min={0}
                    step={50}
                    value={currentVal}
                    onChange={(e) => handleProfitChange(tier.id, Number(e.target.value))}
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-right font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
                  <span>30-Day Estimated Return:</span>
                  <span className="font-mono text-slate-200 font-bold">
                    {monthlyReturn.toLocaleString()} RWF
                  </span>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Total Return Rate:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {percentReturn}%
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="primary"
                className="w-full"
                icon={<Save className="w-3.5 h-3.5" />}
                onClick={() => handleSaveTier(tier)}
              >
                Save New Profit Rate
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
