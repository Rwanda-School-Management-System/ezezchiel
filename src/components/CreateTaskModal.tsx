import React, { useState } from 'react';
import { TaskType, User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import {
  PlusCircle,
  Copy,
  Check,
  PhoneCall,
  Upload,
  AlertCircle,
  CheckCircle2,
  Youtube,
  Video,
  FileQuestion,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<TaskType>('youtube_subscribe');
  const [description, setDescription] = useState('');
  const [instructionText, setInstructionText] = useState(
    '1. Click the link to open YouTube\n2. Subscribe to the channel\n3. Take a screenshot as proof'
  );
  const [targetUrl, setTargetUrl] = useState('');
  const [rewardPerTask, setRewardPerTask] = useState<number>(200);
  const [totalSlots, setTotalSlots] = useState<number>(50);
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const totalBudget = rewardPerTask * totalSlots;
  // Specific Mobile Money USSD Code:
  // *182*8*1*1880554*amount#
  const paymentUssd = `*182*8*1*1880554*${totalBudget}#`;

  const copyUssd = () => {
    navigator.clipboard.writeText(paymentUssd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);

    if (!title.trim() || !description.trim() || !targetUrl.trim()) {
      setError('Please fill out all task details.');
      return;
    }

    if (totalBudget < 2000) {
      setError('Minimum task budget is 2,000 RWF.');
      return;
    }

    const instructionsArray = instructionText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    setIsLoading(true);
    setTimeout(() => {
      const res = store.createTask({
        creatorId: currentUser.id,
        creatorName: currentUser.name,
        title: title.trim(),
        type,
        description: description.trim(),
        instructions: instructionsArray,
        targetUrl: targetUrl.trim(),
        rewardPerTask,
        totalSlots,
        paymentProofUrl: proofImage || undefined,
        transactionId: transactionId.trim() || 'MOMO-' + Date.now().toString().slice(-6)
      });

      setIsLoading(false);
      if (res.success) {
        setIsSuccess(true);
        confetti({ particleCount: 50, spread: 60 });
        setTimeout(() => {
          setIsSuccess(false);
          setTitle('');
          setDescription('');
          setTargetUrl('');
          setProofImage(null);
          onClose();
        }, 2200);
      } else {
        setError(res.message);
      }
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post a New Task (Advertiser Portal)"
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-emerald-300">Task Submitted to Admin!</h4>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            Our admin team has received your task details and Mobile Money payment. Your task will be
            published to all users as soon as payment is confirmed!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-sm max-h-[75vh] overflow-y-auto pr-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Task Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Task Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('youtube_subscribe')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'youtube_subscribe'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-300 ring-2 ring-rose-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Youtube className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-semibold">YouTube Subscribe</span>
              </button>

              <button
                type="button"
                onClick={() => setType('youtube_watch')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'youtube_watch'
                    ? 'bg-red-500/15 border-red-500 text-red-300 ring-2 ring-red-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Video className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold">Watch Video</span>
              </button>

              <button
                type="button"
                onClick={() => setType('short_video')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'short_video'
                    ? 'bg-purple-500/15 border-purple-500 text-purple-300 ring-2 ring-purple-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-semibold">Short Video</span>
              </button>

              <button
                type="button"
                onClick={() => setType('survey')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'survey'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <FileQuestion className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold">Survey / Form</span>
              </button>

              <button
                type="button"
                onClick={() => setType('general')}
                className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                  type === 'general'
                    ? 'bg-blue-500/15 border-blue-500 text-blue-300 ring-2 ring-blue-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}
              >
                <Globe className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-semibold">Website / General</span>
              </button>
            </div>
          </div>

          {/* Title & URL */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Task Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Subscribe to our YouTube channel..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Target URL / Link (YouTube or Website)
              </label>
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://youtube.com/@channel or link"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Guidelines / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Instructions & Completion Guidelines
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain clearly what the worker needs to do..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Pricing & Slots */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Reward per Worker (RWF)</label>
              <input
                type="number"
                min={50}
                step={25}
                required
                value={rewardPerTask}
                onChange={(e) => setRewardPerTask(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Number of Workers (Slots)</label>
              <input
                type="number"
                min={10}
                step={5}
                required
                value={totalSlots}
                onChange={(e) => setTotalSlots(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono font-bold"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-[11px] text-amber-400 font-semibold mb-1">
                Calculated Total Budget
              </label>
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                {totalBudget.toLocaleString()} RWF
              </div>
            </div>
          </div>

          {/* Mobile Money Payment Instruction (Required before submit) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-900 to-amber-500/15 border border-amber-500/40 space-y-2">
            <span className="text-xs font-bold text-amber-300 block">
              Before submitting, please pay the task budget using Mobile Money:
            </span>
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/60 border border-slate-800">
              <span className="font-mono text-sm font-bold text-amber-300 tracking-wider">
                {paymentUssd}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copyUssd}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={`tel:${encodeURIComponent(paymentUssd)}`}
                  className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-xs text-white font-medium flex items-center gap-1"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>Dial</span>
                </a>
              </div>
            </div>
            <p className="text-[11px] text-slate-300">
              Payment is sent to official merchant account: <code className="text-amber-200">1880554</code>.
            </p>
          </div>

          {/* Screenshot proof of payment */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Payment SMS Screenshot (Proof)
            </label>
            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-200 cursor-pointer hover:bg-slate-700 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Upload Screenshot</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
              {proofImage && <span className="text-xs text-emerald-400 font-medium">✓ File attached</span>}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Submit Task for Verification
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
