import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import { Send, MessageSquare, Shield, Clock } from 'lucide-react';

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  targetUserId?: string; // If admin is chatting with a specific user
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  targetUserId
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  // If user, receiver is admin. If admin, receiver is targetUserId or active user.
  const receiverId = isAdmin ? targetUserId || 'user-demo-1' : 'admin';
  const allChats = currentUser ? store.getChats(currentUser.id) : [];

  // Filter messages between these two parties
  const relevantChats = allChats.filter(
    (c) =>
      (currentUser && c.senderId === currentUser.id && (c.receiverId === receiverId || c.receiverId === 'admin')) ||
      (currentUser && c.senderId === receiverId && (c.receiverId === currentUser.id || c.receiverId === 'admin'))
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      scrollToBottom();
    }
  }, [isOpen, relevantChats.length, currentUser]);

  if (!currentUser) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    store.sendChatMessage(currentUser.id, inputText.trim(), receiverId);
    setInputText('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isAdmin
          ? `Direct Chat with Member (${targetUserId || 'Mugisha Patrick'})`
          : "Live Support & Administrator Chat"
      }
      maxWidth="md"
    >
      <div className="flex flex-col h-[65vh]">
        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto space-y-3 p-2 pr-1">
          {relevantChats.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
              <span>No messages yet. Type below to start the conversation!</span>
            </div>
          ) : (
            relevantChats.map((msg) => {
              const isMine = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {msg.senderName}
                    </span>
                    {msg.senderRole === 'admin' && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-bold">
                        Admin
                      </span>
                    )}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                      isMine
                        ? 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
                        : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700/80 shadow-md'
                    }`}
                  >
                    {msg.message}
                  </div>

                  <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send input box */}
        <form onSubmit={handleSend} className="pt-3 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            required
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
          />
          <Button type="submit" variant="primary" size="sm" icon={<Send className="w-3.5 h-3.5" />}>
            Send
          </Button>
        </form>
      </div>
    </Modal>
  );
};
