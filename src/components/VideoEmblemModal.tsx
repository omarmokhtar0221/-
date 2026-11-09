import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Sparkles, Check } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface VideoEmblemModalProps {
  onClose: () => void;
  autoCloseAfter3s?: boolean;
}

export const VideoEmblemModal: React.FC<VideoEmblemModalProps> = ({
  onClose,
  autoCloseAfter3s = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }

    // 3-second timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (autoCloseAfter3s) {
            onClose();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoCloseAfter3s, onClose]);

  const handleRestart = () => {
    setCountdown(3);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 animate-in fade-in duration-300">
      <div className="bg-white border-2 border-amber-400 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col text-slate-800">
        {/* Header */}
        <div className="p-3 bg-amber-50/70 border-b border-amber-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AppLogo size="xs" showSubtitle={false} />
            <span className="text-[11px] font-bold text-amber-900">
              الهوية الرسمية (مقدمة 3 ثوانٍ)
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3-second animated video */}
        <div className="relative aspect-[9/16] max-h-[50vh] bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src="/assets/aistudio/WhatsApp_Video_2026-11-09_at_8.55.09_PM_639cd4ce.mp4"
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />

          {/* 3-second countdown badge */}
          <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-amber-400/50 text-amber-300 px-2 py-1 rounded-full text-[11px] font-bold font-mono">
            {countdown > 0 ? `${countdown} ثوانٍ` : 'اكتملت الهوية'}
          </div>

          {/* Overlay Logo Branding */}
          <div className="absolute bottom-3 inset-x-0 flex flex-col items-center pointer-events-none">
            <span className="text-2xl font-black text-[#f3e5ab] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] font-['Cairo',sans-serif]">
              أجـنـدة
            </span>
            <span className="text-[10px] text-amber-200 font-semibold drop-shadow">
              المساعد الرقمي للمحامي المصري
            </span>
          </div>
        </div>

        {/* Description & Branding */}
        <div className="p-4 bg-white space-y-2.5 text-center text-xs">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base font-black text-slate-900">تطبيق أجـنـدة</span>
            <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 font-bold">
              شعار العدالة والنسر
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            «ميزان العدالة، القلب والعقل، صقر الشموخ، وكتاب القانون.. رسالة الدفاع السامية»
          </p>

          <div className="pt-2 flex items-center justify-center gap-2">
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>إعادة العرض</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow transition"
            >
              متابعة إلى التطبيق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
