import React from 'react';
import { Home, Layers, CheckSquare, History, Shield, Users, DollarSign, Settings, Video } from 'lucide-react';

interface MobileBottomNavProps {
  isAdmin: boolean;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isAdmin,
  activeTab,
  onSelectTab
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 flex items-center justify-around h-16">
      {!isAdmin ? (
        <>
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Home className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">Home</span>
          </button>

          <button
            onClick={() => onSelectTab('videos')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'videos' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Video className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">Videos</span>
          </button>

          <button
            onClick={() => onSelectTab('surveys')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'surveys' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <CheckSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">Surveys</span>
          </button>

          <button
            onClick={() => onSelectTab('products')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'products' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">Products</span>
          </button>

          <button
            onClick={() => onSelectTab('tasks')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'tasks' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Layers className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">Tasks</span>
          </button>

          <button
            onClick={() => onSelectTab('transactions')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'transactions' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <History className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] truncate">History</span>
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onSelectTab('admin-overview')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'admin-overview' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate">Overview</span>
          </button>

          <button
            onClick={() => onSelectTab('admin-finance')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'admin-finance' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <DollarSign className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate">Finance</span>
          </button>

          <button
            onClick={() => onSelectTab('admin-tasks')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'admin-tasks' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <CheckSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate">Tasks</span>
          </button>

          <button
            onClick={() => onSelectTab('admin-users')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'admin-users' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate">Users</span>
          </button>

          <button
            onClick={() => onSelectTab('admin-profit-settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 min-h-[44px] transition-colors ${
              activeTab === 'admin-profit-settings' ? 'text-emerald-400 font-semibold' : 'text-slate-400'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] truncate">Rates</span>
          </button>
        </>
      )}
    </div>
  );
};
