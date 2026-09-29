import React, { useState } from 'react';
import { InvestmentTier, User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import {
  Copy,
  Check,
  PhoneCall,
  Upload,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  selectedTierAmount?: number;
}

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  selectedTierAmount = 10000
}) => {
  const tiers = store.getTiers();
  const [chosenAmount, setChosenAmount] = useState<number>(selectedTierAmount);
  const [method, setMethod] = useState<'MTN' | 'AIRTEL_TIGO'>('MTN');
  const [senderPhone, setSenderPhone] = useState(currentUser?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedTier = tiers.find((t) => t.tierAmount === chosenAmount) || tiers[1];

  // Specific USSD codes:
  // Tigo / Airtel: *182*1*1*0738514596*amount#
  // MTN: *182*1*2*0738514596*amount#
  const ussdCode =
    method === 'MTN'
      ? `*182*1*2*0738514596*${chosenAmount}#`
      : `*182*1*1*0738514596*${chosenAmount}#`;

  const copyUssd = () => {
    navigator.clipboard.writeText(ussdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const setSampleScreenshot = () => {
    setScreenshotPreview(
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80'
    );
    setTransactionId('TX' + Math.floor(10000000 + Math.random() * 90000000));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    if (!screenshotPreview) {
      setError('Please upload a screenshot of your payment confirmation SMS.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = store.buyProduct({
        userId: currentUser.id,
        tierAmount: chosenAmount,
        paymentMethod: method,
        senderPhone: senderPhone.trim() || currentUser.phone,
        transactionId: transactionId.trim() || 'MOMO-' + Date.now().toString().slice(-6),
        screenshotUrl: screenshotPreview
      });

      setIsLoading(false);
      if (res.success) {
        setIsSuccess(true);
        confetti({ particleCount: 60, spread: 70 });
        setTimeout(() => {
          setIsSuccess(false);
          setScreenshotPreview(null);
          setTransactionId('');
          onClose();
        }, 2200);
      } else {
        setError(res.message);
      }
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buy Earning Product & Deposit"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-emerald-300">
            Payment Request Submitted!
          </h4>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            Our admin team is reviewing your payment screenshot. Once approved, your daily profits
            will begin automatically, and your 2,500 RWF registration bonus will be unlocked for withdrawal!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Choose Product Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              1. Select Product Package & Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setChosenAmount(t.tierAmount)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    chosenAmount === t.tierAmount
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold block font-mono">
                    {t.tierAmount.toLocaleString()} RWF
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    +{t.dailyProfit.toLocaleString()} RWF/day
                  </span>
                </button>
              ))}
            </div>
            {selectedTier && (
              <p className="text-xs text-slate-400 mt-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                💡 <span className="font-semibold text-emerald-300">{selectedTier.title}:</span>{' '}
                {selectedTier.description}
              </p>
            )}
          </div>

          {/* 2. Choose Telecom Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              2. Select Mobile Money Provider
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('MTN')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  method === 'MTN'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-2 ring-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  MTN
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">MTN Mobile Money</span>
                  <span className="text-[10px] text-slate-400">Code: *182*1*2*...#</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('AIRTEL_TIGO')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  method === 'AIRTEL_TIGO'
                    ? 'bg-red-500/15 border-red-500 text-red-200 ring-2 ring-red-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-red-600 text-white font-black flex items-center justify-center text-xs">
                  Airtel
                </div>
                <div className="text-left">
                  <span className="font-bold text-xs block">Airtel / Tigo Money</span>
                  <span className="text-[10px] text-slate-400">Code: *182*1*1*...#</span>
                </div>
              </button>
            </div>
          </div>

          {/* 3. USSD Dialer & Code Box */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30">
            <span className="text-xs text-amber-300 font-semibold block mb-1">
              3. Dial this code on your phone to pay {chosenAmount.toLocaleString()} RWF:
            </span>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/60 border border-slate-800">
              <span className="font-mono text-sm sm:text-base font-bold text-amber-300 tracking-wider">
                {ussdCode}
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={copyUssd}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <a
                  href={`tel:${encodeURIComponent(ussdCode)}`}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Dial Now</span>
                </a>
              </div>
            </div>
          </div>

          {/* 4. Upload Screenshot & Details */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-200">
              4. Upload Screenshot of Payment Confirmation SMS
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Sender Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="e.g. 078..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Transaction ID / Reference (Optional)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="e.g. MP2602..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Upload Area */}
            <div className="relative border-2 border-dashed border-slate-700/80 rounded-2xl p-4 text-center hover:border-emerald-500/60 transition-colors bg-slate-950/40">
              {screenshotPreview ? (
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={screenshotPreview}
                    alt="Screenshot Proof"
                    className="max-h-36 rounded-lg border border-slate-700 object-contain shadow-md"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setScreenshotPreview(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Change Screenshot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-xs text-slate-300">
                    <label className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                      Upload Screenshot File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>{' '}
                    or take a photo
                  </div>
                  <p className="text-[11px] text-slate-500">PNG, JPG, or WebP</p>
                  <button
                    type="button"
                    onClick={setSampleScreenshot}
                    className="text-[11px] text-amber-400/90 hover:underline pt-1 block mx-auto"
                  >
                    ⚡ Use Sample Screenshot (Instant Test)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
            >
              Submit Deposit of {chosenAmount.toLocaleString()} RWF
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
