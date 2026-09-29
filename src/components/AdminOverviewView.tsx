import React from 'react';
import { store } from '../data/store';
import { Button } from './ui/Button';
import {
  Users,
  Wallet,
  ArrowDownRight,
  TrendingUp,
  Layers,
  CheckSquare,
  Clock,
  Radio,
  Settings,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface AdminOverviewViewProps {
  onSelectTab: (tab: string) => void;
  onOpenBroadcast: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  onSelectTab,
  onOpenBroadcast
}) => {
  const users = store.getUsers();
  const regularUsers = users.filter((u) => u.role === 'user');
  const purchases = store.getPurchases();
  const withdrawals = store.getWithdrawals();
  const tasks = store.getTasks();
  const submissions = store.getSubmissions();

  const pendingPurchases = purchases.filter((p) => p.status === 'pending');
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const pendingTasks = tasks.filter((t) => t.status === 'pending_payment');

  const totalDeposits = purchases
    .filter((p) => p.status === 'approved')
    .reduce((acc, curr) => acc + curr.tierAmount, 0);

  const totalWithdrawals = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((acc, curr) => acc + curr.netAmount, 0);

  const totalFeesCollected = withdrawals
    .filter((w) => w.status === 'approved')
    .reduce((acc, curr) => acc + curr.fee, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Center</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Umurimo Rwanda Admin Portal
          </h2>
          <p className="text-xs text-slate-400">
            Verify member deposits and withdrawals, configure daily profit rates for all 7 tiers,
            review YouTube screenshots, and manage user accounts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="primary"
            className="!bg-amber-600 hover:!bg-amber-500"
            onClick={onOpenBroadcast}
            icon={<Radio className="w-4 h-4 animate-pulse" />}
          >
            Send Broadcast
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSelectTab('admin-profit-settings')}
            icon={<Settings className="w-4 h-4" />}
          >
            Profit Settings
          </Button>
        </div>
      </div>

      {/* Pending Items Alert Card */}
      {(pendingPurchases.length > 0 ||
        pendingWithdrawals.length > 0 ||
        pendingSubmissions.length > 0 ||
        pendingTasks.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>PENDING ADMINISTRATIVE VERIFICATIONS</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <button
              onClick={() => onSelectTab('admin-finance')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition-colors"
            >
              <span className="text-slate-400 block text-[11px]">Pending Deposits:</span>
              <span className="font-mono text-base font-bold text-amber-300">
                {pendingPurchases.length}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('admin-finance')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition-colors"
            >
              <span className="text-slate-400 block text-[11px]">Pending Withdrawals:</span>
              <span className="font-mono text-base font-bold text-rose-400">
                {pendingWithdrawals.length}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('admin-tasks')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition-colors"
            >
              <span className="text-slate-400 block text-[11px]">Task Proof Screenshots:</span>
              <span className="font-mono text-base font-bold text-emerald-400">
                {pendingSubmissions.length}
              </span>
            </button>

            <button
              onClick={() => onSelectTab('admin-tasks')}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left hover:border-amber-400 transition-colors"
            >
              <span className="text-slate-400 block text-[11px]">Pending Task Posts:</span>
              <span className="font-mono text-base font-bold text-blue-400">
                {pendingTasks.length}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Global Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div
          onClick={() => onSelectTab('admin-users')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Members</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-white font-mono">{regularUsers.length}</span>
          <span className="text-[10px] text-slate-500 block">Click to manage accounts</span>
        </div>

        {/* Total Deposits */}
        <div
          onClick={() => onSelectTab('admin-finance')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Deposits</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400 font-mono">
            {totalDeposits.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-500 block">Verified MoMo product deposits</span>
        </div>

        {/* Total Withdrawals Paid */}
        <div
          onClick={() => onSelectTab('admin-finance')}
          className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1 cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Withdrawals Paid</span>
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-slate-200 font-mono">
            {totalWithdrawals.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-500 block">Paid out to member phones</span>
        </div>

        {/* System Fee Revenue (30%) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Platform Revenue (30% Fee)</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {totalFeesCollected.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-500 block">Earned from withdrawal fees</span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectTab('admin-finance')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-colors cursor-pointer space-y-2 shadow-md"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Wallet className="w-5 h-5" />
            <span>Finance Approvals</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Verify Mobile Money payment screenshots, approve deposits to unlock user bonuses, and approve
            or reject withdrawal requests with detailed notes.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('admin-tasks')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-colors cursor-pointer space-y-2 shadow-md"
        >
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <CheckSquare className="w-5 h-5" />
            <span>Tasks & Proofs</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Review YouTube subscription screenshots, approve advertiser-submitted tasks after confirming payment,
            or unpublish/delete outdated jobs.
          </p>
        </div>

        <div
          onClick={() => onSelectTab('admin-profit-settings')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/60 transition-colors cursor-pointer space-y-2 shadow-md"
        >
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Settings className="w-5 h-5" />
            <span>Product Profit Settings</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Adjust the daily profit amount for each of the 7 product packages (5,000 to 50,000 RWF) in real time.
          </p>
        </div>
      </div>
    </div>
  );
};
