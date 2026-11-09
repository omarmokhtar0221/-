import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'watermark';
  showSubtitle?: boolean;
  onClick?: () => void;
  className?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  onClick,
  className = '',
}) => {
  if (size === 'watermark') {
    return (
      <div
        className={`pointer-events-none select-none opacity-[0.04] flex flex-col items-center justify-center ${className}`}
      >
        <img
          src="/assets/aistudio/_________0051f627.png"
          alt="شعار أجندة"
          className="w-64 h-64 object-contain filter grayscale"
        />
        <span className="text-5xl font-black text-slate-800 tracking-wider mt-2 font-['Amiri',serif]">
          أجـنـدة
        </span>
      </div>
    );
  }

  const iconSizes = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Golden Eagle & Scales Emblem with Badge */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border border-amber-400/50 shadow-sm flex items-center justify-center p-1 shrink-0 ${
          onClick ? 'group-hover:border-amber-500 group-hover:shadow-md transition-all' : ''
        }`}
      >
        <img
          src="/assets/aistudio/_________0051f627.png"
          alt="شعار ميزان العدالة"
          className="w-full h-full object-contain filter drop-shadow-[0_1px_2px_rgba(180,140,50,0.4)]"
        />
        {/* Subtle gold accent dot */}
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
      </div>

      {/* Typography with Logo Wordmark "أجندة" */}
      <div className="flex flex-col text-right leading-none">
        <div className="flex items-center gap-1.5">
          <span
            className={`${titleSizes[size]} font-black tracking-tight text-slate-900 flex items-center gap-1 font-['Cairo',sans-serif]`}
          >
            <span className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-700 bg-clip-text text-transparent font-black">
              أجـنـدة
            </span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300/80 font-bold">
            المحامي
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-slate-600 font-semibold tracking-normal mt-0.5">
            المساعد الرقمي للمحامي المصري
          </span>
        )}
      </div>
    </div>
  );
};
