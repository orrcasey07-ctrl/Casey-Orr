import React from 'react';

const MARQUEE_ITEMS = [
  'NOTENBERECHNUNG',
  'SCHULNOTEN 1,0 – 6,0',
  'OBERSTUFE 0–15 PUNKTE',
  'ZIELNOTEN-PLANUNG',
  'LERNNOTIZEN CLOUD',
  'KLAUSUREN-PLANER',
  'DIGITALE KARTEIKARTEN',
  'POMODORO FOKUS-TIMER',
  'UNTERKURS-WARNUNG',
  '100% DATENSPARSAM',
];

export const GrainzMarquee: React.FC = () => {
  return (
    <div
      className="w-full overflow-hidden py-4 border-y border-[#292F2B] bg-[#090B0A] select-none group"
      aria-label="NotenPilot Funktionen Ticker"
    >
      <div className="flex w-max animate-marquee space-x-8 group-hover:[animation-play-state:paused]">
        {/* Render twice for continuous loop */}
        {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, idx) => (
          <div key={idx} className="flex items-center space-x-8">
            <span className="text-xs sm:text-sm font-mono tracking-widest text-[#A4AAA5] hover:text-white transition-colors">
              {item}
            </span>
            <span className="text-[#C5F82A] text-xs font-mono" aria-hidden="true">
              ✦
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
