import React, { useState } from 'react';
import { Task, TaskSubmission } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Share2,
  PauseCircle,
  PlayCircle,
  ExternalLink,
  Youtube,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminTasksManagement: React.FC = () => {
  const tasks = store.getTasks();
  const submissions = store.getSubmissions();

  const [activeSubTab, setActiveSubTab] = useState<'proofs' | 'jobs'>('proofs');
  const [selectedProof, setSelectedProof] = useState<string | null>(null);

  // Reject proof modal state
  const [rejectingSubId, setRejectingSubId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');
  const pendingTasks = tasks.filter((t) => t.status === 'pending_payment');

  const handleApproveSubmission = (id: string) => {
    store.reviewTaskSubmission(id, 'approve');
    confetti({ particleCount: 35, spread: 60 });
  };

  const handleConfirmRejectSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingSubId) return;

    store.reviewTaskSubmission(rejectingSubId, 'reject', rejectionReason);
    setRejectingSubId(null);
    setRejectionReason('');
  };

  const handlePublishTask = (id: string) => {
    store.adminManageTask(id, 'publish');
  };

  const handleUnpublishTask = (id: string) => {
    store.adminManageTask(id, 'unpublish');
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('Are you sure you want to delete this task permanently?')) {
      store.adminManageTask(id, 'delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 pb-3 gap-3">
        <button
          onClick={() => setActiveSubTab('proofs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'proofs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Youtube className="w-4 h-4 text-rose-400" />
          <span>Member Proof Submissions ({pendingSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
            activeSubTab === 'jobs'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>All Tasks & Campaigns ({tasks.length})</span>
        </button>
      </div>

      {/* 1. PROOF SUBMISSIONS TAB */}
      {activeSubTab === 'proofs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              Pending Task Proof Submissions ({pendingSubmissions.length})
            </h3>
            <span className="text-xs text-slate-400">
              Inspect user screenshots for YouTube subscriptions and video views before approving.
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
              No pending task proofs to review right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-100 block">{sub.userName}</span>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        {sub.userPhone}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs">
                      +{sub.reward.toLocaleString()} RWF
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                    <span className="text-slate-400 block mb-0.5">Task Name:</span>
                    <span className="font-semibold text-slate-200 block">{sub.taskTitle}</span>
                    {sub.notes && (
                      <p className="text-[11px] text-slate-400 italic mt-1">User Note: "{sub.notes}"</p>
                    )}
                  </div>

                  {/* Screenshot Thumbnail */}
                  {sub.proofPhotoUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={sub.proofPhotoUrl}
                        alt="Proof Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setSelectedProof(sub.proofPhotoUrl!)}
                      />
                      <button
                        type="button"
                        onClick={() => setSelectedProof(sub.proofPhotoUrl!)}
                        className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Full Screenshot</span>
                      </button>
                    </div>
                  )}

                  {/* Approve / Reject */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    <Button
                      size="sm"
                      variant="primary"
                      className="flex-1"
                      icon={<CheckCircle className="w-3.5 h-3.5" />}
                      onClick={() => handleApproveSubmission(sub.id)}
                    >
                      Approve (+{sub.reward} RWF)
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      icon={<XCircle className="w-3.5 h-3.5" />}
                      onClick={() => setRejectingSubId(sub.id)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. ALL JOBS & ADVERTISER TASKS TAB */}
      {activeSubTab === 'jobs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">
              All Tasks in System ({tasks.length})
            </h3>
            <span className="text-xs text-slate-400">
              Admin can Approve, Unpublish, Republish, or Delete tasks.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const isPending = task.status === 'pending_payment';
              const isPublished = task.status === 'published';

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isPublished
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isPending
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {isPublished ? 'Published' : isPending ? 'Pending Approval' : 'Unpublished'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{task.creatorName}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-100 mt-1">{task.title}</h4>
                    </div>

                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                      {task.rewardPerTask.toLocaleString()} RWF
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{task.description}</p>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex justify-between font-mono">
                    <span className="text-slate-400">
                      Completed: <strong className="text-emerald-400">{task.completedSlots}</strong> / {task.totalSlots}
                    </span>
                    <span className="text-amber-300">
                      Budget: {task.totalBudget.toLocaleString()} RWF
                    </span>
                  </div>

                  {/* Actions for task */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                    {isPending ? (
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        icon={<CheckCircle className="w-3.5 h-3.5" />}
                        onClick={() => handlePublishTask(task.id)}
                      >
                        Approve & Publish
                      </Button>
                    ) : isPublished ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        icon={<PauseCircle className="w-3.5 h-3.5 text-amber-400" />}
                        onClick={() => handleUnpublishTask(task.id)}
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1"
                        icon={<PlayCircle className="w-3.5 h-3.5" />}
                        onClick={() => handlePublishTask(task.id)}
                      >
                        Republish
                      </Button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proof Zoom Modal */}
      {selectedProof && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProof(null)}
          title="Task Proof Screenshot (Full View)"
          maxWidth="lg"
        >
          <div className="flex flex-col items-center">
            <img
              src={selectedProof}
              alt="Proof Full"
              className="max-h-[70vh] rounded-xl object-contain border border-slate-700 shadow-2xl"
            />
            <Button
              size="sm"
              variant="secondary"
              className="mt-4"
              onClick={() => setSelectedProof(null)}
            >
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Reject Submission Modal */}
      {rejectingSubId && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingSubId(null)}
          title="Reject Task Proof"
          maxWidth="md"
        >
          <form onSubmit={handleConfirmRejectSubmission} className="space-y-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Rejection Note / Reason *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Example: The screenshot does not show that you subscribed to the channel or the video link is incorrect..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1"
                onClick={() => setRejectingSubId(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" className="flex-1">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
