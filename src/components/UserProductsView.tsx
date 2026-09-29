import React from 'react';
import { InvestmentTier } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import {
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Calendar,
  Layers,
  PhoneCall
} from 'lucide-react';

interface UserProductsViewProps {
  onOpenDeposit: (tierAmount: number) => void;
}

export const UserProductsView: React.FC<UserProductsViewProps> = ({ onOpenDeposit }) => {
  const tiers = store.getTiers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Daily Profit Products (7 Tiers)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Choose a Product & Earn Daily Income
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
          Product packages range from 5,000 RWF up to 50,000 RWF. Pay easily using MTN or Airtel Mobile Money,
          and automatically start receiving your daily profits every 24 hours!
        </p>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiers.map((tier, idx) => {
          const isVip = tier.tierAmount === 50000;
          const isPopular = tier.tierAmount === 20000;
          const monthlyReturn = tier.dailyProfit * tier.durationDays;

          return (
            <div
              key={tier.id}
              className={`relative rounded-3xl p-5 border flex flex-col justify-between transition-all ${
                isVip
                  ? 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/50 shadow-xl shadow-amber-950/30 ring-1 ring-amber-500/30'
                  : isPopular
                  ? 'bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-900 border-emerald-500/50 shadow-xl shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : 'bg-slate-900 border-slate-800 shadow-md hover:border-slate-700'
              }`}
            >
              {/* Badges */}
              {isVip && (
                <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  VIP Tier 7
                </div>
              )}
              {isPopular && (
                <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wide">
                    Tier {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {tier.tierAmount === 50000 ? 'VIP Platinum Tier' : `Product Package ${idx + 1}`}
                  </h3>
                </div>

                {/* Price Tag */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block uppercase">Product Price</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      {tier.tierAmount.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-300 font-bold">RWF</span>
                  </div>
                </div>

                {/* Features & Earnings */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      Daily Profit:
                    </span>
                    <span className="font-mono font-bold text-emerald-400">
                      +{tier.dailyProfit.toLocaleString()} RWF/day
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-200">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      Validity Duration:
                    </span>
                    <span className="font-semibold text-slate-300">{tier.durationDays} Days</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-200 pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Total Expected Return:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {monthlyReturn.toLocaleString()} RWF ({tier.totalReturnPercent}%)
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-950/40 p-2 rounded-xl">
                  Daily profit of {tier.dailyProfit.toLocaleString()} RWF for {tier.durationDays} days. Capital: {tier.tierAmount.toLocaleString()} RWF.
                </p>
              </div>

              <div className="pt-4 mt-2">
                <Button
                  size="md"
                  variant={isVip ? 'primary' : 'primary'}
                  className={`w-full ${isVip ? '!bg-amber-600 hover:!bg-amber-500' : ''}`}
                  onClick={() => onOpenDeposit(tier.tierAmount)}
                  icon={<Layers className="w-4 h-4" />}
                >
                  Buy This Product ({tier.tierAmount.toLocaleString()} RWF)
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
