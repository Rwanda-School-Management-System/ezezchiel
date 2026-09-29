import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { ArrowDown, Sparkles, CheckCircle2, LogIn } from 'lucide-react';
import confetti from 'canvas-confetti';

interface InteractiveTreeRopeProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const InteractiveTreeRope: React.FC<InteractiveTreeRopeProps> = ({
  isOpen,
  onOpen,
  onClose
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const dragY = useMotionValue(0);
  const springConfig = { damping: 18, stiffness: 220 };
  const smoothY = useSpring(dragY, springConfig);

  const handleDrag = (_event: any, info: { offset: { y: number } }) => {
    const y = Math.max(0, info.offset.y);
    dragY.set(y);
    setDragProgress(Math.min(100, Math.round((y / 90) * 100)));
  };

  const handleDragEnd = (_event: any, info: { offset: { y: number } }) => {
    setIsPulling(false);
    if (info.offset.y > 65) {
      triggerOpen();
    } else {
      dragY.set(0);
      setDragProgress(0);
    }
  };

  const triggerOpen = () => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.25 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899']
    });
    dragY.set(90);
    setTimeout(() => {
      dragY.set(0);
      setDragProgress(0);
      onOpen();
    }, 200);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none pt-2 pb-6">
      {/* Rwandan Tree Canopy Canvas & SVG ("Tree of Prosperity") */}
      <div className="relative w-full h-36 flex justify-center items-start overflow-visible">
        <svg
          viewBox="0 0 600 150"
          className="w-full max-w-lg h-36 drop-shadow-xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle sun glow behind branches */}
          <circle cx="300" cy="40" r="60" fill="#F59E0B" fillOpacity="0.12" />

          {/* Majestic Tree Trunk and Sturdy Branch */}
          <path
            d="M 500,150 C 470,110 440,80 380,65 C 330,55 240,55 120,60 C 80,62 40,65 0,70 L 0,85 C 40,80 80,76 130,73 C 240,67 320,68 360,78 C 420,92 445,115 480,150 Z"
            fill="#5A3A1E"
          />
          <path
            d="M 370,68 C 340,40 290,28 200,32 C 160,34 110,38 70,45 L 75,55 C 115,48 160,45 200,43 C 275,39 320,49 350,72 Z"
            fill="#472A14"
          />

          {/* Lush Green Foliage Clusters (Acacia style foliage) */}
          <ellipse cx="140" cy="40" rx="65" ry="26" fill="#15803D" fillOpacity="0.85" />
          <ellipse cx="210" cy="30" rx="75" ry="30" fill="#16A34A" fillOpacity="0.9" />
          <ellipse cx="280" cy="35" rx="65" ry="25" fill="#22C55E" fillOpacity="0.8" />
          <ellipse cx="360" cy="40" rx="70" ry="28" fill="#15803D" fillOpacity="0.85" />
          <ellipse cx="440" cy="55" rx="65" ry="24" fill="#166534" fillOpacity="0.9" />

          {/* Golden leaves / fruit accents */}
          <circle cx="160" cy="35" r="4" fill="#F59E0B" />
          <circle cx="230" cy="25" r="5" fill="#FBBF24" />
          <circle cx="310" cy="30" r="4" fill="#F59E0B" />
          <circle cx="390" cy="45" r="5" fill="#FBBF24" />

          {/* Branch knot where the rope is tied firmly */}
          <ellipse cx="300" cy="65" rx="7" ry="5" fill="#38210F" />
          <rect x="296" y="65" width="8" height="12" rx="3" fill="#B45309" />
        </svg>

        {/* Rope Tied to Branch & Hanging Down */}
        <div
          className="absolute top-[65px] left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ width: '130px' }}
        >
          {/* Animated SVG Braided Rope Line */}
          <svg width="24" height="95" className="overflow-visible">
            <line
              x1="12"
              y1="0"
              x2="12"
              y2={85}
              stroke="#D97706"
              strokeWidth="5"
              strokeDasharray="4 2"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="0"
              x2="12"
              y2={85}
              stroke="#92400E"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Pulling Handle / Tassel (Interactive Drag Element) */}
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            dragElastic={0.4}
            onDragStart={() => setIsPulling(true)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onClick={() => {
              if (isOpen) {
                onClose();
              } else {
                triggerOpen();
              }
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            style={{ y: smoothY }}
            className={`cursor-grab active:cursor-grabbing flex flex-col items-center -mt-3 p-2.5 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 border-2 border-amber-400/80 shadow-lg shadow-amber-950/60 transition-colors ${
              isPulling ? 'ring-4 ring-emerald-500/40' : ''
            }`}
          >
            {/* Wooden ring or handle */}
            <div className="w-10 h-10 rounded-full border-4 border-amber-300 flex items-center justify-center bg-amber-950 text-amber-200 shadow-inner">
              {isOpen ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-pulse" />
              ) : (
                <ArrowDown className="w-5 h-5 text-amber-300 animate-bounce" />
              )}
            </div>

            <span className="text-[11px] font-bold text-amber-100 tracking-wide mt-1.5 whitespace-nowrap px-2 py-0.5 rounded bg-black/40">
              {isOpen ? 'Close Form' : 'Pull Rope to Login'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Guide text & pulling indicator */}
      {!isOpen && (
        <div className="mt-7 text-center space-y-2">
          <p className="text-xs text-amber-300/90 font-medium flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pull the rope down using your mouse or finger to open the form</span>
          </p>
          {dragProgress > 0 && (
            <div className="w-48 mx-auto bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-75"
                style={{ width: `${dragProgress}%` }}
              />
            </div>
          )}
          <button
            type="button"
            onClick={triggerOpen}
            className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:underline pt-0.5 font-semibold"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Or click here to Open Login Form</span>
          </button>
        </div>
      )}
    </div>
  );
};
