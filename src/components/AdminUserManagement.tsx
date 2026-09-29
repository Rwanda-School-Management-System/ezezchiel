import React, { useState } from 'react';
import { User } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import {
  Search,
  Shield,
  Ban,
  Unlock,
  Trash2,
  MessageSquare,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Wallet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AdminUserManagementProps {
  onOpenChatWithUser: (userId: string) => void;
}

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  onOpenChatWithUser
}) => {
  const users = store.getUsers();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      (u.district && u.district.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleToggleBlock = (userId: string) => {
    store.toggleBlockUser(userId);
  };

  const handleDeleteUser = (userId: string) => {
    if (confirm('Are you sure you want to permanently delete this user account?')) {
      store.deleteUser(userId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-200">
            All Registered Members ({users.length})
          </h3>
          <span className="text-xs text-slate-400">
            Profile updates made by members reflect LIVE here in real-time.
          </span>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, district..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className={`p-4 rounded-2xl border transition-all ${
              u.isBlocked
                ? 'bg-rose-950/20 border-rose-500/40 opacity-80'
                : u.role === 'admin'
                ? 'bg-amber-950/15 border-amber-500/40'
                : 'bg-slate-900 border-slate-800 shadow-md'
            }`}
          >
            {/* Top User Info */}
            <div className="flex items-start gap-3">
              <img
                src={u.avatar}
                alt={u.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-100 truncate">{u.name}</h4>
                  {u.role === 'admin' && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                      Admin
                    </span>
                  )}
                  {u.isBlocked && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold">
                      Blocked
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                  {u.phone}
                </span>
                <span className="text-[10px] text-slate-500 block truncate">{u.email}</span>
              </div>
            </div>

            {/* Profile Attributes (Live from edit) */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  District:
                </span>
                <span className="font-semibold text-slate-200">{u.district || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-blue-400" />
                  Birth Date:
                </span>
                <span className="font-mono text-slate-300">{u.birthDate || 'Not specified'}</span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-amber-400" />
                  Balance:
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {u.balance.toLocaleString()} RWF
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Purchased Product:</span>
                <span
                  className={`font-semibold ${
                    u.hasBoughtProduct ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {u.hasBoughtProduct ? 'Yes (Withdrawals Unlocked)' : 'No (Bonus Locked)'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 text-[11px]"
                icon={<MessageSquare className="w-3 h-3 text-emerald-400" />}
                onClick={() => onOpenChatWithUser(u.id)}
              >
                Message
              </Button>

              {u.role !== 'admin' && (
                <>
                  <Button
                    size="sm"
                    variant={u.isBlocked ? 'success' : 'outline'}
                    className="text-[11px] px-2.5"
                    icon={
                      u.isBlocked ? (
                        <Unlock className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Ban className="w-3 h-3 text-rose-400" />
                      )
                    }
                    onClick={() => handleToggleBlock(u.id)}
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
