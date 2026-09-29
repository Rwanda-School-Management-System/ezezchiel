import React, { useState } from 'react';
import { Transaction } from '../types';
import { store } from '../data/store';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Gift,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  DollarSign
} from 'lucide-react';

interface TransactionsHistoryViewProps {
  userId?: string; // If provided, shows user transactions. If undefined, shows global (Admin).
  isAdmin?: boolean;
}

export const TransactionsHistoryView: React.FC<TransactionsHistoryViewProps> = ({
  userId,
  isAdmin = false
}) => {
  const transactions = store.getTransactions(userId);
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'all') return true;
    return tx.type === filterType;
  });

  const getTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'bonus':
        return 'Registration Bonus';
      case 'deposit_product':
        return 'Product Deposit';
      case 'daily_profit':
        return 'Daily Profit';
      case 'task_earning':
        return 'Task Reward';
      case 'video_earning':
        return 'Video Reward';
      case 'survey_earning':
        return 'Survey Reward';
      case 'withdrawal':
        return 'Withdrawal Request';
      case 'withdrawal_fee':
        return '30% Platform Fee';
      case 'withdrawal_refund':
        return 'Withdrawal Refund';
      case 'task_creation':
        return 'Task Creation Budget';
      default:
        return 'Transaction';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {isAdmin ? 'System-Wide Financial Ledger (All Transactions)' : 'My Transaction History'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time immutable ledger displaying deposits, daily profits, task rewards, withdrawals, and platform fees.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('daily_profit')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'daily_profit'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Daily Profits
          </button>
          <button
            onClick={() => setFilterType('task_earning')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'task_earning'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tasks
          </button>
          <button
            onClick={() => setFilterType('withdrawal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              filterType === 'withdrawal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Withdrawals
          </button>
        </div>
      </div>

      {/* Transaction Table / Card Rows */}
      {filtered.length === 0 ? (
        <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
          No transactions found in this category.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((tx) => {
            const isCredit = tx.direction === 'in';
            const isCompleted = tx.status === 'completed';
            const isPending = tx.status === 'pending';
            const isRejected = tx.status === 'rejected';

            return (
              <div
                key={tx.id}
                className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {tx.type === 'bonus' ? (
                      <Gift className="w-5 h-5 text-amber-400" />
                    ) : isCredit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-100 truncate">
                        {getTypeLabel(tx.type)}
                      </span>
                      {isAdmin && tx.userName && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({tx.userName})
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isPending
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {isCompleted ? 'Completed' : isPending ? 'Pending' : 'Rejected'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 truncate mt-0.5">{tx.description}</p>
                    {tx.notes && (
                      <p className="text-[11px] text-amber-400/90 italic mt-0.5 truncate">
                        Admin Note: {tx.notes}
                      </p>
                    )}

                    <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(tx.date).toLocaleString([], {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`font-mono font-bold text-sm sm:text-base tabular-nums ${
                      isCredit ? 'text-emerald-400' : 'text-slate-100'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {tx.amount.toLocaleString()} RWF
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
