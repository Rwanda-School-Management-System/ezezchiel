import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { store } from './data/store';
import { Task, User } from './types';
import { FloatingHeartsBackground } from './components/FloatingHeartsBackground';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { AuthTreeModal } from './components/AuthTreeModal';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { SubmitTaskProofModal } from './components/SubmitTaskProofModal';
import { ProfileEditModal } from './components/ProfileEditModal';
import { NotificationModal } from './components/NotificationModal';
import { LiveChatModal } from './components/LiveChatModal';
import { UserDashboardView } from './components/UserDashboardView';
import { UserProductsView } from './components/UserProductsView';
import { UserTasksView } from './components/UserTasksView';
import { ShortVideosView } from './components/ShortVideosView';
import { SurveysView } from './components/SurveysView';
import { TransactionsHistoryView } from './components/TransactionsHistoryView';
import { AdminOverviewView } from './components/AdminOverviewView';
import { AdminFinancialApprovals } from './components/AdminFinancialApprovals';
import { AdminTasksManagement } from './components/AdminTasksManagement';
import { AdminUserManagement } from './components/AdminUserManagement';
import { AdminProfitSettings } from './components/AdminProfitSettings';
import { AdminBroadcastComposer } from './components/AdminBroadcastComposer';
import { Shield, Sparkles, LogIn } from 'lucide-react';

export default function App() {
  // Reactive store subscription
  const [, setTick] = useState(0);
  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const currentUser = store.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'admin-overview' : 'dashboard');

  // Keep tab aligned with user role
  useEffect(() => {
    if (isAdmin && !activeTab.startsWith('admin-')) {
      setActiveTab('admin-overview');
    } else if (!isAdmin && activeTab.startsWith('admin-')) {
      setActiveTab('dashboard');
    }
  }, [isAdmin]);

  // Modal open states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register' | 'admin'>('login');

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositTierAmount, setDepositTierAmount] = useState<number>(10000);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const [taskToSubmit, setTaskToSubmit] = useState<Task | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetUserId, setChatTargetUserId] = useState<string | undefined>(undefined);

  // Notifications & Chats badge counts
  const broadcasts = store.getBroadcasts();
  const userNotifications = currentUser
    ? broadcasts.filter((b) => b.targetUserId === 'ALL' || b.targetUserId === currentUser.id)
    : [];

  const unreadChats = currentUser
    ? store.getChats(currentUser.id).filter((c) => c.receiverId === currentUser.id && !c.isRead)
    : [];

  // Handlers
  const handleOpenDeposit = (tierAmount: number = 10000) => {
    setDepositTierAmount(tierAmount);
    setIsDepositOpen(true);
  };

  const handleOpenAuth = (mode: 'login' | 'register' | 'admin' = 'login') => {
    setAuthInitialMode(mode);
    setIsAuthOpen(true);
  };

  const handleOpenChatWithUser = (userId: string) => {
    setChatTargetUserId(userId);
    setIsChatOpen(true);
  };

  const handleLogout = () => {
    store.logout();
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative selection:bg-emerald-500 selection:text-slate-950 flex flex-col font-sans">
      {/* Floating Particle Hearts Background */}
      <FloatingHeartsBackground />

      {/* Main Top Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenChat={() => {
          setChatTargetUserId(undefined);
          setIsChatOpen(true);
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAuth={() => handleOpenAuth('login')}
        onLogout={handleLogout}
        unreadNotifsCount={userNotifications.length}
        unreadChatsCount={unreadChats.length}
      />

      {/* Role Switcher Floating Pill for quick evaluation demo */}
      <div className="fixed bottom-20 right-4 z-40 hidden sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md">
        <span className="text-[10px] text-slate-400 font-semibold px-1.5">Switch Role:</span>
        <button
          onClick={() => {
            const user = store.getUsers().find((u) => u.role === 'user');
            if (user) store.switchUser(user);
          }}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
            !isAdmin
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Member
        </button>
        <button
          onClick={() => {
            const admin = store.getUsers().find((u) => u.role === 'admin');
            if (admin) store.switchUser(admin);
          }}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${
            isAdmin
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Admin
        </button>
      </div>

      {/* Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 relative z-10">
        {/* If not logged in, prompt user to pull rope / sign in */}
        {!currentUser ? (
          <div className="py-16 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-2xl font-black text-white">Welcome to Umurimo Rwanda</h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              The premier online micro-tasks & daily earnings platform in Rwanda.
              Complete quick jobs, earn daily profits, and sign up right now to get a <strong>2,500 RWF</strong> welcome bonus instantly!
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold shadow-lg shadow-emerald-950/50 transition-all"
              >
                Pull Rope to Sign Up (+2,500 RWF)
              </button>
            </div>
          </div>
        ) : (
          /* USER ROUTES */
          !isAdmin ? (
            <>
              {activeTab === 'dashboard' && (
                <UserDashboardView
                  currentUser={currentUser}
                  onOpenDeposit={handleOpenDeposit}
                  onOpenWithdraw={() => setIsWithdrawOpen(true)}
                  onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                  onSelectTab={setActiveTab}
                  onSelectTaskToSubmit={(task) => setTaskToSubmit(task)}
                />
              )}

              {activeTab === 'videos' && (
                <ShortVideosView currentUser={currentUser} />
              )}

              {activeTab === 'surveys' && (
                <SurveysView currentUser={currentUser} />
              )}

              {activeTab === 'products' && (
                <UserProductsView onOpenDeposit={handleOpenDeposit} />
              )}

              {activeTab === 'tasks' && (
                <UserTasksView
                  onOpenCreateTask={() => setIsCreateTaskOpen(true)}
                  onSelectTaskToSubmit={(task) => setTaskToSubmit(task)}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsHistoryView userId={currentUser.id} />
              )}
            </>
          ) : (
            /* ADMIN ROUTES */
            <>
              {activeTab === 'admin-overview' && (
                <AdminOverviewView
                  onSelectTab={setActiveTab}
                  onOpenBroadcast={() => setIsNotificationsOpen(true)}
                />
              )}

              {activeTab === 'admin-finance' && <AdminFinancialApprovals />}

              {activeTab === 'admin-tasks' && <AdminTasksManagement />}

              {activeTab === 'admin-users' && (
                <AdminUserManagement onOpenChatWithUser={handleOpenChatWithUser} />
              )}

              {activeTab === 'admin-profit-settings' && <AdminProfitSettings />}
            </>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Umurimo Rwanda</span>
            <span>·</span>
            <span>Micro-Tasks & Daily Profit Platform</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>MTN & Airtel MoMo</span>
            <span>·</span>
            <span>Easy English</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        isAdmin={isAdmin}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* MODALS */}
      {/* 1. Login & Sign-up Modal with Tree & Rope pulling physics */}
      <AuthTreeModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authInitialMode}
      />

      {/* 2. Deposit / Product purchase Modal */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        currentUser={currentUser}
        selectedTierAmount={depositTierAmount}
      />

      {/* 3. Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        currentUser={currentUser}
        onOpenDeposit={() => handleOpenDeposit(5000)}
      />

      {/* 4. Advertiser Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        currentUser={currentUser}
      />

      {/* 5. Submit Task Proof Modal */}
      <SubmitTaskProofModal
        isOpen={!!taskToSubmit}
        onClose={() => setTaskToSubmit(null)}
        task={taskToSubmit}
        currentUser={currentUser}
      />

      {/* 6. Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
      />

      {/* 7. Notifications & Broadcasts Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={userNotifications}
      />

      {/* 8. Live Support Chat Modal */}
      <LiveChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentUser={currentUser}
        targetUserId={chatTargetUserId}
      />
    </div>
  );
}
