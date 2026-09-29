import React, { useState } from 'react';
import { User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import {
  Wallet,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onOpenDeposit: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenDeposit
}) => {
  const [amount, setAmount] = useState<number>(5000);
  const [method, setMethod] = useState<'MTN' | 'AIRTEL_TIGO'>('MTN');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [recipientName, setRecipientName] = useState(currentUser?.name || '');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!currentUser) return null;

  // Real-time Fee calculation: 30% fee
  const fee = Math.round(amount * 0.3);
  const netAmount = Math.max(0, amount - fee);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Rule 1: Registration Bonus Lock - Must buy at least 1 product
    if (!currentUser.hasBoughtProduct) {
      setError(
        'SECURITY POLICY: You cannot withdraw funds until you purchase at least one product starting from 5,000 RWF.'
      );
      return;
    }

    // Rule 2: Minimum Withdrawal 5,000 Frw
    if (amount < 5000) {
      setError('Minimum withdrawal amount is 5,000 RWF.');
      return;
    }

    // Rule 3: Balance check
    if (currentUser.balance < amount) {
      setError(`Your available balance is ${currentUser.balance.toLocaleString()} RWF. You cannot withdraw ${amount.toLocaleString()} RWF.`);
      return;
    }

    // Rule 4: Phone validation
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (method === 'MTN') {
      if (!/^(078|079)\d{7}$/.test(cleanPhone)) {
        setError('MTN phone numbers must start with 078 or 079 and have 10 digits.');
        return;
      }
    } else {
      if (!/^(072|073)\d{7}$/.test(cleanPhone)) {
        setError('Airtel / Tigo phone numbers must start with 072 or 073 and have 10 digits.');
        return;
      }
    }

    if (!recipientName.trim()) {
      setError('Please enter the registered recipient name on Mobile Money.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = store.requestWithdrawal({
        userId: currentUser.id,
        amount,
        method,
        recipientPhone: cleanPhone,
        recipientName: recipientName.trim()
      });

      setIsLoading(false);
      if (res.success) {
        setIsSuccess(true);
        confetti({ particleCount: 50, spread: 60 });
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2500);
      } else {
        setError(res.message);
      }
    }, 500);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Money (Mobile Money)" maxWidth="md">
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-emerald-300">
            Withdrawal Request Submitted!
          </h4>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            Our finance administrator will send <span className="font-bold text-emerald-400 font-mono">{netAmount.toLocaleString()} RWF</span> to your phone {phone} ({recipientName}).
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Warning banner if product not purchased */}
          {!currentUser.hasBoughtProduct && (
            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>FINANCIAL SECURITY POLICY</span>
              </div>
              <p>
                Every newly registered member receives a 2,500 RWF bonus. To prevent bonus fraud,
                you must purchase at least one earning product (starting from 5,000 RWF) before withdrawals are unlocked.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDeposit();
                }}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Click here to buy a product (from 5,000 RWF)</span>
              </button>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Balance Display */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Available Wallet Balance:</span>
            </div>
            <span className="font-mono text-base font-bold text-emerald-300 tabular-nums">
              {currentUser.balance.toLocaleString()} RWF
            </span>
          </div>

          {/* Amount to Withdraw */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Amount to Withdraw (RWF)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Minimum: 5,000 RWF</span>
            </div>
            <input
              type="number"
              min={5000}
              step={500}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            {/* Quick amount shortcuts */}
            <div className="flex gap-2 mt-2">
              {[5000, 10000, 20000, 50000].map((quickAmt) => (
                <button
                  key={quickAmt}
                  type="button"
                  onClick={() => setAmount(quickAmt)}
                  className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                >
                  {quickAmt.toLocaleString()} RWF
                </button>
              ))}
            </div>
          </div>

          {/* Real-time 30% Fee Breakdown Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Withdrawal Amount:</span>
              <span className="font-mono text-slate-200 font-semibold">{amount.toLocaleString()} RWF</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Platform Fee (30%):</span>
              <span className="font-mono font-semibold">-{fee.toLocaleString()} RWF</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-emerald-400">
              <span>Net Amount Sent to Your Phone (70%):</span>
              <span className="font-mono text-base">{netAmount.toLocaleString()} RWF</span>
            </div>
          </div>

          {/* Choose Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Select Mobile Money Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('MTN')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'MTN'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-[10px]">
                  MTN
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">MTN MoMo</span>
                  <span className="text-[10px] text-slate-400">078 / 079</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('AIRTEL_TIGO')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  method === 'AIRTEL_TIGO'
                    ? 'bg-red-500/15 border-red-500 text-red-200 ring-2 ring-red-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-[10px]">
                  Airtel
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">Airtel / Tigo</span>
                  <span className="text-[10px] text-slate-400">072 / 073</span>
                </div>
              </button>
            </div>
          </div>

          {/* Phone & Recipient Name */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Recipient Phone Number {method === 'MTN' ? '(078... / 079...)' : '(072... / 073...)'}
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={method === 'MTN' ? '0789456123' : '0738129045'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Registered Recipient Name (on Mobile Money)
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Full name registered on SIM card"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              disabled={!currentUser.hasBoughtProduct || currentUser.balance < 5000}
              isLoading={isLoading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Submit Withdrawal Request ({amount.toLocaleString()} RWF)
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
