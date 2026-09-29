import React, { useState } from 'react';
import { store } from '../data/store';
import { Button } from './ui/Button';
import { Radio, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminBroadcastComposer: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<string | null>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const res = store.sendBroadcast(title, message);
    if (res.success) {
      setSuccess(res.message);
      setTitle('');
      setMessage('');
      confetti({ particleCount: 40, spread: 60 });
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 mb-1">
          <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>Broadcast Public Announcement to All Members</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          This message will appear instantly as an alert and notification to every member on the platform.
        </p>

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-3.5 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Broadcast Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Scheduled Mobile Money Maintenance Notice..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the message you want all members across Rwanda to see..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full py-2.5 !bg-amber-600 hover:!bg-amber-500"
            icon={<Send className="w-4 h-4" />}
          >
            Send Broadcast to All Members
          </Button>
        </form>
      </div>
    </div>
  );
};
