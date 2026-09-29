import React, { useState } from 'react';
import { Task, TaskType } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import {
  Youtube,
  Video,
  FileQuestion,
  Globe,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Filter
} from 'lucide-react';

interface UserTasksViewProps {
  onOpenCreateTask: () => void;
  onSelectTaskToSubmit: (task: Task) => void;
}

export const UserTasksView: React.FC<UserTasksViewProps> = ({
  onOpenCreateTask,
  onSelectTaskToSubmit
}) => {
  const tasks = store.getTasks().filter((t) => t.status === 'published');
  const [filter, setFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.type === filter;
  });

  const getTaskIcon = (type: TaskType) => {
    switch (type) {
      case 'youtube_subscribe':
        return <Youtube className="w-5 h-5 text-rose-500" />;
      case 'youtube_watch':
        return <Video className="w-5 h-5 text-red-400" />;
      case 'short_video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'survey':
        return <FileQuestion className="w-5 h-5 text-amber-400" />;
      case 'general':
      default:
        return <Globe className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header with Post Task Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Micro-Tasks & Earning Marketplace
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Subscribe to YouTube channels, watch videos, answer surveys, and get paid directly to your wallet!
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={onOpenCreateTask}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          Post a New Task (Advertise)
        </Button>
      </div>

      {/* Filter Tabs (Interactive filter controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'all'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Tasks ({tasks.length})
        </button>

        <button
          onClick={() => setFilter('youtube_subscribe')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'youtube_subscribe'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          YouTube Subscribe
        </button>

        <button
          onClick={() => setFilter('youtube_watch')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'youtube_watch'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Watch Video
        </button>

        <button
          onClick={() => setFilter('short_video')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'short_video'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Short Videos
        </button>

        <button
          onClick={() => setFilter('survey')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'survey'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Surveys
        </button>

        <button
          onClick={() => setFilter('general')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            filter === 'general'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          General
        </button>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTasks.length === 0 ? (
          <div className="col-span-2 p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs text-slate-500">
            No active tasks found in this category.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {getTaskIcon(task.type)}
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        {task.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{task.creatorName}</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-sm shrink-0">
                    +{task.rewardPerTask.toLocaleString()} RWF
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">{task.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{task.description}</p>
              </div>

              {/* Progress & Slots */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    Completions: <strong className="text-emerald-400">{task.completedSlots}</strong> / {task.totalSlots}
                  </span>
                  {task.requiresProof && (
                    <span className="text-amber-400 flex items-center gap-1 font-sans">
                      📷 Screenshot Proof Required
                    </span>
                  )}
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (task.completedSlots / task.totalSlots) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <a
                  href={task.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <span>Open Task</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Button
                  size="sm"
                  variant="primary"
                  className="flex-1"
                  onClick={() => onSelectTaskToSubmit(task)}
                >
                  {task.requiresProof ? 'Submit Screenshot Proof' : 'Confirm Completion'}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
