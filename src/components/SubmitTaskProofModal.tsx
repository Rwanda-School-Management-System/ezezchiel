import React, { useState } from 'react';
import { Task, User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import {
  ExternalLink,
  Upload,
  AlertCircle,
  CheckCircle2,
  Check,
  ShieldCheck,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SubmitTaskProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  currentUser: User | null;
}

export const SubmitTaskProofModal: React.FC<SubmitTaskProofModalProps> = ({
  isOpen,
  onClose,
  task,
  currentUser
}) => {
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!task || !currentUser) return null;

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

  const useSampleProof = () => {
    setProofImage(
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=600&q=80'
    );
    setNotes('Subscribed to the channel and turned on notifications bell!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (task.requiresProof && !proofImage) {
      setError('Please upload a screenshot showing that you subscribed or watched the video.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = store.submitTask({
        taskId: task.id,
        userId: currentUser.id,
        proofPhotoUrl: proofImage || undefined,
        notes: notes.trim()
      });

      setIsLoading(false);
      if (res.success) {
        setIsSuccess(true);
        confetti({ particleCount: 50, spread: 60 });
        setTimeout(() => {
          setIsSuccess(false);
          setProofImage(null);
          setNotes('');
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
      title="Complete Task & Submit Proof"
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="text-center py-8 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-lg font-bold text-emerald-300">
            {task.requiresProof ? 'Proof Screenshot Submitted!' : 'Task Completed!'}
          </h4>
          <p className="text-sm text-slate-300 max-w-sm mx-auto">
            {task.requiresProof
              ? `Admin has received your screenshot. Once verified, ${task.rewardPerTask.toLocaleString()} RWF will be added to your account.`
              : `Awesome! You have received ${task.rewardPerTask.toLocaleString()} RWF in your wallet immediately.`}
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

          {/* Task Info Header */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-semibold text-slate-100 text-sm">{task.title}</h4>
              <span className="font-mono font-bold text-xs text-emerald-400 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                +{task.rewardPerTask.toLocaleString()} RWF
              </span>
            </div>
            <p className="text-xs text-slate-400">{task.description}</p>
            <div className="pt-1">
              <a
                href={task.targetUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <span>Open Task Link (Click Here)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Instructions List */}
          <div>
            <span className="text-xs font-semibold text-slate-300 block mb-1.5">
              Task Guidelines:
            </span>
            <ul className="space-y-1.5">
              {task.instructions.map((inst, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Proof Upload (For YouTube tasks) */}
          {task.requiresProof && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-200">
                Attach Proof Screenshot (Subscribe / Video View)
              </label>

              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center bg-slate-950/50 hover:border-emerald-500/50 transition-colors">
                {proofImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={proofImage}
                      alt="Proof Preview"
                      className="max-h-36 rounded-lg border border-slate-700 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setProofImage(null)}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                    <div className="text-xs text-slate-300">
                      <label className="text-emerald-400 font-semibold cursor-pointer hover:underline">
                        Upload Screenshot
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>{' '}
                      or capture with camera
                    </div>
                    <button
                      type="button"
                      onClick={useSampleProof}
                      className="text-[11px] text-amber-400/90 hover:underline pt-1 block mx-auto"
                    >
                      ⚡ Use Sample Screenshot (Instant Test)
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">
                  Optional Comment / Note
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Subscribed and liked the video..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2.5"
              isLoading={isLoading}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-300" />}
            >
              {task.requiresProof
                ? 'Submit Proof for Admin Review'
                : `Confirm Task Completion (+${task.rewardPerTask.toLocaleString()} RWF)`}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
