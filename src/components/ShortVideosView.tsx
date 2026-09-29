import React, { useState, useEffect, useRef } from 'react';
import { ShortVideo, User } from '../types';
import { Button } from './ui/Button';
import { store } from '../data/store';
import { api } from '../services/api';
import { Play, Pause, CheckCircle2, Sparkles, Clock, AlertCircle, Video } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShortVideosViewProps {
  currentUser: User;
}

export const ShortVideosView: React.FC<ShortVideosViewProps> = ({ currentUser }) => {
  const [videos, setVideos] = useState<ShortVideo[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<ShortVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [secondsWatched, setSecondsWatched] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Load videos from backend / store
    api.getVideos()
      .then(res => setVideos(res.videos))
      .catch(() => {
        // Fallback default in Easy English
        setVideos([
          {
            id: 'vid-1',
            title: 'Digital Entrepreneurship & Online Jobs in Rwanda',
            description: 'Learn how young creators and freelancers in Rwanda are making daily income using technology.',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-working-on-a-laptop-43527-large.mp4',
            durationSeconds: 15,
            reward: 150,
            category: 'Business',
            isPublished: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'vid-2',
            title: 'Mobile Money Security Tips: Protect Your Secret PIN',
            description: 'Essential rules for safeguarding your Mobile Money account and avoiding fraudulent calls or fake SMS messages.',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-typing-on-a-laptop-at-home-43524-large.mp4',
            durationSeconds: 20,
            reward: 200,
            category: 'Security',
            isPublished: true,
            createdAt: new Date().toISOString()
          },
          {
            id: 'vid-3',
            title: 'How Daily Profit Products Work: Simple Guide',
            description: 'A quick visual walkthrough of buying a product and receiving daily earnings directly into your wallet balance.',
            videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-portrait-of-a-woman-in-a-business-suit-43306-large.mp4',
            durationSeconds: 15,
            reward: 180,
            category: 'Earnings',
            isPublished: true,
            createdAt: new Date().toISOString()
          }
        ]);
      });
  }, []);

  const handleSelectVideo = (video: ShortVideo) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setSecondsWatched(0);
    setIsCompleted(false);
    setClaimSuccess(null);
    setError(null);
  };

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
      clearInterval(timerRef.current);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
      timerRef.current = setInterval(() => {
        setSecondsWatched(prev => {
          const next = prev + 1;
          if (selectedVideo && next >= selectedVideo.durationSeconds) {
            setIsCompleted(true);
          }
          return next;
        });
      }, 1000);
    }
  };

  const handleClaimReward = async () => {
    if (!selectedVideo) return;
    setIsClaiming(true);
    setError(null);

    try {
      const res = await api.claimVideoReward(selectedVideo.id, currentUser.id, secondsWatched);
      setIsClaiming(false);
      if (res.success) {
        setClaimSuccess(res.message);
        confetti({ particleCount: 50, spread: 60 });
        store.claimDailyProfit(currentUser.id); // Trigger local sync
      }
    } catch (err: any) {
      setIsClaiming(false);
      setError(err.message || 'Could not claim reward.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-2">
          <Video className="w-3.5 h-3.5 text-amber-400" />
          <span>Watch Short Videos & Earn Cash</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Watch Short Videos to Earn Money Instantly
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mt-1">
          Select any video below, watch until the timer reaches 100%, and click the claim button to receive cash instantly into your wallet!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Videos List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-bold text-slate-300 block">
            Available Videos ({videos.length})
          </span>

          <div className="space-y-2.5">
            {videos.map(v => (
              <div
                key={v.id}
                onClick={() => handleSelectVideo(v)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  selectedVideo?.id === v.id
                    ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    {v.category}
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +{v.reward} RWF
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{v.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{v.durationSeconds} seconds</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Video Player & Progress Card */}
        <div className="lg:col-span-2">
          {selectedVideo ? (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                  {selectedVideo.category}
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedVideo.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{selectedVideo.description}</p>
              </div>

              {/* HTML5 Video Box */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800">
                <video
                  ref={videoRef}
                  src={selectedVideo.videoUrl}
                  className="w-full h-full object-cover"
                  onEnded={() => {
                    setIsPlaying(false);
                    clearInterval(timerRef.current);
                    setIsCompleted(true);
                  }}
                  playsInline
                />

                {/* Overlay Play / Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                </button>
              </div>

              {/* Progress & Countdown */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Time Watched:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {secondsWatched} / {selectedVideo.durationSeconds} s
                  </span>
                </div>

                <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${Math.min(100, (secondsWatched / selectedVideo.durationSeconds) * 100)}%`
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-400">
                  {isCompleted
                    ? '✓ Required time watched! Click the claim button below to get paid.'
                    : `Keep watching (${Math.max(
                        0,
                        selectedVideo.durationSeconds - secondsWatched
                      )} s remaining) to unlock your reward.`}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {claimSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{claimSuccess}</span>
                </div>
              )}

              {/* Claim Reward Button */}
              <Button
                size="md"
                variant="primary"
                disabled={!isCompleted || isClaiming || !!claimSuccess}
                isLoading={isClaiming}
                onClick={handleClaimReward}
                className="w-full py-3"
                icon={<Sparkles className="w-4 h-4 text-amber-300" />}
              >
                {claimSuccess
                  ? 'Reward Claimed!'
                  : isCompleted
                  ? `Claim Reward (+${selectedVideo.reward} RWF)`
                  : `Watch ${selectedVideo.durationSeconds} seconds first`}
              </Button>
            </div>
          ) : (
            <div className="p-16 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Video className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">Choose a video from the list on the left</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click on any short video to start playback and earn money instantly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
