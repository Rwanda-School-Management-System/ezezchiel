import React from 'react';
import { BroadcastNotification } from '../types';
import { Modal } from './ui/Modal';
import { Bell, Radio, CheckCircle, AlertTriangle, Info, Clock } from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: BroadcastNotification[];
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Platform Notifications & Announcements" maxWidth="md">
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No new notifications at this time.
          </div>
        ) : (
          notifications.map((n) => {
            const isBroadcast = n.type === 'broadcast';
            const isAlert = n.type === 'alert';
            const isSuccess = n.type === 'success';

            return (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isBroadcast
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : isAlert
                    ? 'bg-rose-500/10 border-rose-500/30'
                    : isSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700/60 shrink-0 mt-0.5">
                    {isBroadcast ? (
                      <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                    ) : isAlert ? (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    ) : isSuccess ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="text-xs font-bold text-slate-100 truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {n.message}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/60">
                      <span>{n.senderName}</span>
                      {isBroadcast && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold text-[9px]">
                          Public Announcement
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
