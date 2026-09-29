import React, { useState, useEffect } from 'react';
import { Survey, User } from '../types';
import { Button } from './ui/Button';
import { store } from '../data/store';
import { api } from '../services/api';
import { FileQuestion, CheckCircle2, Clock, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SurveysViewProps {
  currentUser: User;
}

export const SurveysView: React.FC<SurveysViewProps> = ({ currentUser }) => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSurveys()
      .then(res => setSurveys(res.surveys))
      .catch(() => {
        // Fallback default in clean Easy English
        setSurveys([
          {
            id: 'surv-1',
            title: 'Youth Smartphone & Online Work Survey',
            description: 'Answer 3 quick questions about your internet and Mobile Money usage to earn 300 RWF instantly.',
            reward: 300,
            estimatedMinutes: 2,
            isPublished: true,
            completedCount: 38,
            maxCompletions: 200,
            createdAt: new Date().toISOString(),
            questions: [
              {
                id: 'q1',
                question: 'Which Mobile Money service do you use most often in Rwanda?',
                options: ['MTN Mobile Money (*182#)', 'Airtel Money (*182#)', 'I use both MTN and Airtel regularly'],
                required: true
              },
              {
                id: 'q2',
                question: 'What time of day do you prefer doing quick online tasks?',
                options: ['Morning (8:00 AM - 12:00 PM)', 'Afternoon (1:00 PM - 5:00 PM)', 'Evening & Night (6:00 PM onwards)'],
                required: true
              },
              {
                id: 'q3',
                question: 'Have you ever purchased a daily profit earning product before?',
                options: ['Yes, multiple times', 'Yes, this is my first time', 'No, but I am excited to start today'],
                required: true
              }
            ]
          },
          {
            id: 'surv-2',
            title: 'Marketplace Earning Preferences Survey',
            description: 'Help us learn what types of tasks you enjoy doing most so we can bring higher paying opportunities.',
            reward: 250,
            estimatedMinutes: 2,
            isPublished: true,
            completedCount: 64,
            maxCompletions: 150,
            createdAt: new Date().toISOString(),
            questions: [
              {
                id: 'sq1',
                question: 'Which micro-task type is your favorite to complete?',
                options: ['YouTube Subscribe & Video Watch', 'Watching 15-second Short Videos', 'Answering 2-minute Surveys', 'Liking and commenting on posts'],
                required: true
              },
              {
                id: 'sq2',
                question: 'What is your preferred withdrawal telecom provider?',
                options: ['MTN Mobile Money (078/079)', 'Airtel Money (072/073)', 'Either one is great'],
                required: true
              }
            ]
          }
        ]);
      });
  }, []);

  const handleSelectSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setAnswers({});
    setSubmitSuccess(null);
    setError(null);
  };

  const handleOptionSelect = (qId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurvey) return;

    // Validate that all required questions are answered
    for (const q of selectedSurvey.questions) {
      if (q.required && !answers[q.id]) {
        setError(`Please answer the question: "${q.question}"`);
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.submitSurvey(selectedSurvey.id, currentUser.id, answers);
      setIsSubmitting(false);
      if (res.success) {
        setSubmitSuccess(res.message);
        confetti({ particleCount: 60, spread: 70 });
        store.claimDailyProfit(currentUser.id); // Trigger local store sync
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setError(err.message || 'Could not submit survey.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <FileQuestion className="w-3.5 h-3.5 text-amber-400" />
          <span>Surveys & Feedback (Instant Earning System)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Answer Quick Questions & Get Paid Instantly
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
          Share your opinion on technology, products, and services in Rwanda. Every survey you finish credits cash directly to your wallet!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">
            Available Surveys ({surveys.length})
          </span>

          <div className="space-y-2.5">
            {surveys.map(s => (
              <div
                key={s.id}
                onClick={() => handleSelectSurvey(s)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedSurvey?.id === s.id
                    ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +{s.reward} RWF
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {s.estimatedMinutes} min
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-2 mt-1">{s.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{s.description}</p>
                <span className="text-[10px] text-slate-500 block mt-2">
                  Questions: {s.questions.length} · Completed: {s.completedCount}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Survey Questions Form */}
        <div className="lg:col-span-2">
          {selectedSurvey ? (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  +{selectedSurvey.reward} RWF Reward
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSurvey.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedSurvey.description}</p>
              </div>

              {submitSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-emerald-300">{submitSuccess}</h4>
                  <p className="text-xs text-slate-300">
                    The reward has been added to your wallet. You can now choose another survey from the list.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedSurvey(null);
                      setSubmitSuccess(null);
                    }}
                  >
                    Take Another Survey
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitSurvey} className="space-y-5">
                  {error && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {selectedSurvey.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <span className="text-xs font-bold text-slate-200 block">
                        {idx + 1}. {q.question} {q.required && <span className="text-rose-400">*</span>}
                      </span>

                      <div className="space-y-2">
                        {q.options.map(opt => {
                          const isSelected = answers[q.id] === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleOptionSelect(q.id, opt)}
                              className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/20'
                                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                              }`}
                            >
                              <span>{opt}</span>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full py-3"
                    isLoading={isSubmitting}
                    icon={<Sparkles className="w-4 h-4 text-amber-300" />}
                  >
                    Submit Answers & Claim {selectedSurvey.reward} RWF
                  </Button>
                </form>
              )}
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <FileQuestion className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Select a survey from the list on the left</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click on any survey to begin answering questions and receive payment instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
