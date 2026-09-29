import React from 'react';
import { User } from '../types';
import { Button } from './ui/Button';
import {
  Bell,
  MessageSquare,
  User as UserIcon,
  ShieldAlert,
  LogOut,
  Wallet,
  Sparkles,
  Globe
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenNotifications: () => void;
  onOpenChat: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  unreadNotifsCount: number;
  unreadChatsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenNotifications,
  onOpenChat,
  onOpenProfile,
  onOpenAuth,
  onLogout,
  unreadNotifsCount,
  unreadChatsCount
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab(isAdmin ? 'admin-overview' : 'dashboard')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-emerald-950/60 group-hover:scale-105 transition-transform">
              <span className="font-extrabold text-lg tracking-tighter">U</span>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                Umurimo Rwanda
              </span>
              <span className="text-[10px] text-emerald-400 font-medium tracking-wide">
                {isAdmin ? 'Admin Portal' : 'Earn & Profit Platform'}
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Clean unboxed links) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {!isAdmin ? (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onSelectTab('videos')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'videos' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Short Videos
              </button>
              <button
                onClick={() => onSelectTab('surveys')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'surveys' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Surveys
              </button>
              <button
                onClick={() => onSelectTab('products')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'products' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Products
              </button>
              <button
                onClick={() => onSelectTab('tasks')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'tasks' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Tasks
              </button>
              <button
                onClick={() => onSelectTab('transactions')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'transactions' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Transactions
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('admin-overview')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'admin-overview' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => onSelectTab('admin-finance')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'admin-finance' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Finance Approvals
              </button>
              <button
                onClick={() => onSelectTab('admin-tasks')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'admin-tasks' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Tasks Management
              </button>
              <button
                onClick={() => onSelectTab('admin-users')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'admin-users' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Users List
              </button>
              <button
                onClick={() => onSelectTab('admin-profit-settings')}
                className={`transition-colors hover:text-white ${
                  activeTab === 'admin-profit-settings' ? 'text-emerald-400 font-semibold' : ''
                }`}
              >
                Profit Rates
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions + User Quick Bar */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Easy English Indicator */}
          <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700/80 text-[11px] text-emerald-300 font-medium">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Easy English</span>
          </span>

          {currentUser ? (
            <>
              {/* User Balance Chip */}
              {!isAdmin && (
                <div
                  onClick={() => onSelectTab('transactions')}
                  className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors"
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block leading-none">Available Balance</span>
                    <span className="text-xs font-bold text-emerald-300 font-mono tabular-nums">
                      {currentUser.balance.toLocaleString()} RWF
                    </span>
                  </div>
                </div>
              )}

              {/* Chat Button with Badge */}
              <button
                onClick={onOpenChat}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Support Chat"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadChatsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                )}
              </button>

              {/* Notifications Button with Badge */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </button>

              {/* Profile Avatar & Name */}
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <span className="text-xs font-medium text-slate-200 block max-w-[110px] truncate leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 block leading-tight">
                    {isAdmin ? 'Admin' : currentUser.district || 'Member'}
                  </span>
                </div>
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-lg object-cover border border-emerald-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                  }}
                />
              </button>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={onOpenAuth}>
                Log In
              </Button>
              <Button size="sm" variant="primary" onClick={onOpenAuth}>
                Sign Up (+2,500 RWF)
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
